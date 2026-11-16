import { createHash } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { jmaSections } from '../../scripts/check-jma-docs.mjs'

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
      for (const title of jmaSections[locale]) {
        const heading = page.locator('h2').filter({ hasText: title })
        await expect(heading).toHaveCount(1)
        const anchor = heading.locator('a')
        const href = await anchor.getAttribute('href')
        expect(href).toMatch(/^#.+/)
        await anchor.click()
        await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe(decodeURIComponent(href))
        expect(await heading.evaluate(element => element.getBoundingClientRect().top
          >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1)).toBeTruthy()
      }

      // Assert the rendered code blocks are parseable JSON, with matching hashes
      // and intact zero-based references, rather than just searching HTML strings.
      const jsonBlocks = page.locator('.code-block').filter({ has: page.locator('.code-block__header', { hasText: /^json$/ }) }).locator('pre')
      await expect(jsonBlocks).toHaveCount(3)
      for (let i = 0; i < 3; i++) {
        const { md5, ...body } = JSON.parse(await jsonBlocks.nth(i).innerText())
        expect(md5).toBe(createHash('md5').update(JSON.stringify(body)).digest('hex'))
        expect(body).not.toHaveProperty('type')
        if (i === 0)
          expect(body.events[0].reports[0].hypocenter).toBe(0)
        else if (i === 1)
          expect([body.status, body.trusted, body.validUntil]).toEqual(['unknown', false, null])
        else
          expect(body.reports[0].appendix).toBe(0)
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
      expect(layout.tables.filter(table => table.columns === 3).length).toBeGreaterThanOrEqual(8)
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
      for (const query of ['VTSE41', 'VYSE52', ...jmaSections[locale]]) {
        await input.fill(query)
        await expect(page.locator(`#search-results a[href="${prefix}/docs/open-api"]`)).toBeVisible()
      }
      await page.locator('.search-dialog header button').click()

      const wsResponse = await page.goto(`${prefix}/docs/websocket/`, { waitUntil: 'networkidle' })
      expect(wsResponse?.ok()).toBeTruthy()
      for (const token of ['wss://ws-api.wolfx.jp/jma_tsunami', 'wss://ws-api.wolfx.jp/jma_special_eq', 'query_jmatsunami', 'query_jmaspecialeq'])
        await expect(page.locator('.code-block pre').filter({ hasText: token })).toHaveCount(1)
      await expect(page.locator('main')).toContainText('validUntil')
      await expect(page.locator('main')).not.toContainText('wss://ws-api.wolfx.jp/jma_earthquake_detail')
      expect(problems).toEqual([])
    })
  }
}
