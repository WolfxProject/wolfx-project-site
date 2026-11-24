import { expect, test } from '@playwright/test'
import { jmaProducts } from '../../scripts/check-jma-docs.mjs'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('wolfx-locale', 'ja'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('https://api.wolfx.jp/**', async (route) => {
    if (new URL(route.request().url()).pathname === '/ws_clients.json') {
      await route.fulfill({ json: { client_counts: 1234, update_at: '2026-11-16 00:00:00' } })
    }
    else {
      await route.fulfill({
        contentType: 'image/png',
        body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+Xw0YAAAAAElFTkSuQmCC', 'base64'),
      })
    }
  })
})

for (const locale of ['ja', 'zh', 'en']) {
  const prefix = locale === 'ja' ? '' : `/${locale}`
  for (const width of [390, 1366]) {
    test(`${locale} JMA documentation renders and searches on a static server at ${width}px`, async ({ page }) => {
      test.setTimeout(60_000)
      await page.setViewportSize({ width, height: 900 })
      const problems = []
      page.on('pageerror', error => problems.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error' || /hydration/i.test(message.text()))
          problems.push(message.text())
      })
      const response = await page.goto(`${prefix}/docs/open-api/`, { waitUntil: 'networkidle' })
      expect(response?.ok()).toBeTruthy()
      await expect(page.locator('main')).toContainText('validUntil')
      const titles = []
      for (const product of jmaProducts) {
        const endpoint = `https://api.wolfx.jp/${product}.json`
        const heading = page.getByText(endpoint, { exact: true }).first().locator('xpath=preceding::h2[1]')
        await expect(heading).toHaveCount(1)
        titles.push(await heading.evaluate((element) => {
          const title = element.cloneNode(true)
          title.querySelectorAll('[aria-hidden="true"]').forEach(node => node.remove())
          return title.textContent.trim()
        }))
        const anchor = heading.locator('a')
        const href = await anchor.getAttribute('href')
        expect(href).toMatch(/^#.+/)
        await anchor.click()
        await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe(decodeURIComponent(href))
        expect(await heading.evaluate(element => element.getBoundingClientRect().top
          >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1)).toBeTruthy()

        const section = await heading.evaluate((element) => {
          const nodes = []
          for (let node = element.nextElementSibling; node && node.tagName !== 'H2'; node = node.nextElementSibling)
            nodes.push(node)
          const tables = nodes.flatMap(node => [...node.querySelectorAll('table')])
          return {
            tables: tables.map(table => ({
              headers: [...table.querySelectorAll('th')].map(cell => cell.textContent.trim()),
              fields: [...table.querySelectorAll('tbody tr')].map(row => row.cells[0].textContent),
            })),
          }
        })
        expect(section.tables.flatMap(table => table.fields)).toContain('md5')
        expect(section.tables.every(table => table.headers.length >= 2 && table.headers.every(Boolean))).toBeTruthy()
      }

      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        tables: [...document.querySelectorAll('.table-scroll')].map(element => ({
          overflow: getComputedStyle(element).overflowX,
          rows: element.querySelectorAll('tbody tr').length,
          columns: element.querySelectorAll('thead th').length,
        })),
        code: [...document.querySelectorAll('.code-block pre')].map(element => getComputedStyle(element).overflowX),
      }))
      expect(layout.overflow).toBeLessThanOrEqual(1)
      expect(layout.tables.every(table => table.columns >= 2)).toBeTruthy()
      expect(layout.tables.every(table => table.overflow === 'auto' && table.rows > 0)).toBeTruthy()
      expect(layout.code.every(overflow => overflow === 'auto')).toBeTruthy()
      if (width === 390) {
        const table = page.locator('.table-scroll').filter({ hasText: 'events[].completeness' })
        await table.evaluate(element => element.scrollLeft = element.scrollWidth)
        expect(await table.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
      }

      // Exercise the existing local search UI with API names in each language;
      // no runtime search endpoint is available on this static HTTP server.
      await page.locator('.search-trigger').click()
      const input = page.locator('.search-dialog input')
      for (const query of ['VTSE41', 'VYSE52', ...titles]) {
        await input.fill(query)
        await expect(page.locator(`#search-results a[href="${prefix}/docs/open-api"]`)).toBeVisible()
      }
      await input.fill('all_eew exclude')
      await expect(page.locator(`#search-results a[href="${prefix}/docs/websocket"]`)).toBeVisible()
      await page.locator('.search-dialog header button').click()

      const wsResponse = await page.goto(`${prefix}/docs/websocket/`, { waitUntil: 'networkidle' })
      expect(wsResponse?.ok()).toBeTruthy()
      for (const [endpoint, command] of [['jma_tsunami', 'query_jmatsunami'], ['jma_special_eq', 'query_jmaspecialeq']]) {
        const row = page.getByRole('row').filter({ hasText: `wss://ws-api.wolfx.jp/${endpoint}` })
        await expect(row.getByRole('cell').nth(2)).toHaveText(command)
      }
      const exclusions = page.locator('.code-block pre').filter({ hasText: 'all_eew?exclude=' })
      await expect(exclusions.first()).toContainText('wss://ws-api.wolfx.jp/all_eew?exclude=')
      await expect(page.locator('main')).toContainText('HTTP 400')
      await expect(page.locator('main')).not.toContainText('wss://ws-api.wolfx.jp/jma_earthquake_detail')
      expect(problems).toEqual([])
    })
  }
}
