import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

const locales = [
  { locale: 'ja', prefix: '', tocLabel: 'このページの目次' },
  { locale: 'zh', prefix: '/zh', tocLabel: '本页目录' },
  { locale: 'en', prefix: '/en', tocLabel: 'On this page' },
]

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('wolfx-locale', 'ja'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

function watchProblems(page) {
  const problems = []
  page.on('console', (message) => {
    if (message.type() === 'error' || /hydration|\[Vue warn\]|unhandled/i.test(message.text()))
      problems.push(message.text())
  })
  page.on('pageerror', error => problems.push(error.message))
  return problems
}

async function expectHeadingInView(page, id) {
  await expect.poll(() => page.evaluate((headingId) => {
    const heading = document.getElementById(headingId).getBoundingClientRect()
    const header = document.querySelector('.site-header').getBoundingClientRect()
    return heading.top >= header.bottom && heading.bottom < innerHeight
  }, id)).toBe(true)
}

for (const { locale, prefix, tocLabel } of locales) {
  for (const document of ['terms', 'privacy']) {
    const route = `${prefix}/legal/${document}`

    test(`${locale} ${document} TOC follows real headings, scrolls, and preserves history and SEO`, async ({ page }) => {
      const problems = watchProblems(page)
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
      await page.goto(`${route}?source=legal-toc`, { waitUntil: 'networkidle' })

      const toc = page.getByRole('navigation', { name: tocLabel, exact: true })
      await expect(toc).toBeVisible()
      const headings = await page.locator('.legal-document .markdown-content > h2').evaluateAll((elements, isTerms) =>
        elements.slice(isTerms ? 1 : 0).map(element => ({
          id: element.id,
          text: element.textContent.replace(/^#\s*/, '').trim(),
        })), document === 'terms')
      expect(headings).toHaveLength(document === 'terms' ? 15 : 13)
      expect(await toc.locator('a').allTextContents()).toEqual(headings.map(heading => heading.text))
      expect(await toc.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href'))))
        .toEqual(headings.map(heading => `#${heading.id}`))
      await expect(page.locator('.docs-sidebar-wrap, .docs-mobile-nav')).toHaveCount(0)

      const geometry = await page.locator('.legal-main').evaluate((element) => {
        const box = element.getBoundingClientRect()
        return { width: box.width, center: (box.left + box.right) / 2, viewport: document.documentElement.clientWidth }
      })
      expect(geometry.width).toBe(900)
      expect(Math.abs(geometry.center - geometry.viewport / 2)).toBeLessThanOrEqual(1)

      const markdown = await readFile(new URL(`../../content/${locale}/legal/${document}.md`, import.meta.url), 'utf8')
      const title = markdown.match(/^title: "(.*)"$/m)[1]
      const description = markdown.match(/^description: "(.*)"$/m)[1]
      const updated = markdown.match(/^updated: (.*)$/m)[1]
      await expect(page.locator('h1')).toHaveText(title)
      await expect(page).toHaveTitle(title)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description)
      await expect(page.locator('.legal-updated time')).toHaveAttribute('datetime', updated)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://wolfx.jp${route}`)
      for (const alternate of locales) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${alternate.locale === 'zh' ? 'zh-CN' : alternate.locale}"]`))
          .toHaveAttribute('href', `https://wolfx.jp${alternate.prefix}/legal/${document}`)
      }
      await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', `https://wolfx.jp/legal/${document}`)

      await page.evaluate(() => {
        window.__legalDocument = 'retained'
      })
      await toc.locator('a').nth(5).click()
      expect(decodeURIComponent(new URL(page.url()).hash)).toBe(`#${headings[5].id}`)
      expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe(route)
      expect(new URL(page.url()).search).toBe('?source=legal-toc')
      await expectHeadingInView(page, headings[5].id)
      expect(await page.evaluate(() => scrollY)).toBeGreaterThan(500)

      const sticky = await page.locator('.legal-toc-wrap').evaluate((element) => {
        const box = element.getBoundingClientRect()
        return {
          position: getComputedStyle(element).position,
          overflow: getComputedStyle(element).overflowY,
          top: box.top,
          bottom: box.bottom,
          expectedTop: Number.parseFloat(getComputedStyle(element).top),
          headerBottom: document.querySelector('.site-header').getBoundingClientRect().bottom,
          viewport: innerHeight,
        }
      })
      expect(sticky.position).toBe('sticky')
      expect(sticky.overflow).toBe('auto')
      expect(Math.abs(sticky.top - sticky.expectedTop)).toBeLessThanOrEqual(1)
      expect(sticky.top).toBeGreaterThanOrEqual(sticky.headerBottom)
      expect(sticky.bottom).toBeLessThanOrEqual(sticky.viewport)

      await toc.locator('a').nth(8).click()
      await expectHeadingInView(page, headings[8].id)
      await page.goBack()
      expect(decodeURIComponent(new URL(page.url()).hash)).toBe(`#${headings[5].id}`)
      await expectHeadingInView(page, headings[5].id)
      await page.goForward()
      await expectHeadingInView(page, headings[8].id)
      expect(await page.evaluate(() => window.__legalDocument)).toBe('retained')

      await page.reload({ waitUntil: 'networkidle' })
      await expectHeadingInView(page, headings[8].id)
      await expect(toc).toBeVisible()
      expect(problems).toEqual([])
    })

    test(`${locale} ${document} keeps centered reading width, safe areas, and dark responsive layout`, async ({ page }) => {
      const problems = watchProblems(page)
      await page.addInitScript(() => localStorage.setItem('wolfx-color-mode', 'dark'))
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(route, { waitUntil: 'networkidle' })
      await expect(page.locator('html')).toHaveClass(/dark/)
      await expect(page.locator('.header-actions > .icon-button .i-lucide\\:moon')).toBeVisible()

      for (const width of [360, 768, 1024, 1366, 1499, 1500, 1920]) {
        await page.setViewportSize({ width, height: 768 })
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const toc = page.locator('.legal-toc-wrap')
        if (width < 1500)
          await expect(toc).toBeHidden()
        else
          await expect(toc).toBeVisible()

        const geometry = await page.locator('.legal-main').evaluate((element) => {
          const box = element.getBoundingClientRect()
          const root = document.documentElement
          const style = getComputedStyle(element)
          const bodyStyle = getComputedStyle(document.body)
          return {
            overflow: root.scrollWidth - root.clientWidth,
            width: box.width,
            center: (box.left + box.right) / 2,
            viewport: root.clientWidth,
            color: style.color,
            background: bodyStyle.backgroundColor,
          }
        })
        expect(geometry.overflow, `${width}: horizontal overflow`).toBeLessThanOrEqual(1)
        expect(Math.abs(geometry.center - geometry.viewport / 2), `${width}: centered text`).toBeLessThanOrEqual(1)
        const expectedWidth = Math.min(900, width - 2 * Math.min(32, Math.max(16, width * 0.04)))
        expect(Math.abs(geometry.width - expectedWidth), `${width}: reading width`).toBeLessThanOrEqual(1)
        expect(geometry.color).not.toBe(geometry.background)
      }

      await page.setViewportSize({ width: 1920, height: 400 })
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      const toc = page.locator('.legal-toc-wrap')
      const scroll = await toc.evaluate((element) => {
        element.scrollTop = element.scrollHeight
        const box = element.getBoundingClientRect()
        return { scrollTop: element.scrollTop, bottom: box.bottom, viewport: innerHeight }
      })
      expect(scroll.scrollTop).toBeGreaterThan(0)
      expect(scroll.bottom).toBeLessThanOrEqual(scroll.viewport)
      await toc.locator('a').last().click()
      const lastId = await toc.locator('a').last().getAttribute('href')
      await expectHeadingInView(page, lastId.slice(1))

      await page.setViewportSize({ width: 844, height: 390 })
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      await page.evaluate(() => {
        const root = document.documentElement
        root.style.setProperty('--wolfx-safe-left', '47px')
        root.style.setProperty('--wolfx-safe-right', '47px')
        root.style.setProperty('--wolfx-safe-top', '20px')
      })
      await expect.poll(() => page.locator('.legal-grid').evaluate(element => getComputedStyle(element).paddingLeft)).toBe('15px')
      const safeArea = await page.evaluate(() => {
        const box = document.querySelector('.legal-main').getBoundingClientRect()
        return { left: box.left, right: box.right, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }
      })
      expect(safeArea.left).toBeGreaterThanOrEqual(47)
      expect(safeArea.right).toBeLessThanOrEqual(844 - 47)
      expect(safeArea.overflow).toBeLessThanOrEqual(1)
      expect(problems).toEqual([])
    })
  }
}

for (const document of ['terms', 'privacy']) {
  test(`${document} language switching refreshes the real TOC and keeps query strings`, async ({ page }) => {
    const problems = watchProblems(page)
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(`/legal/${document}?source=language-switch`, { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      window.__legalDocument = 'retained'
    })

    for (const { locale, prefix, tocLabel } of [locales[1], locales[2], locales[0]]) {
      await page.locator('.language-select select').selectOption(locale)
      await expect.poll(() => new URL(page.url()).pathname.replace(/\/$/, '')).toBe(`${prefix}/legal/${document}`)
      expect(new URL(page.url()).search).toBe('?source=language-switch')
      const toc = page.getByRole('navigation', { name: tocLabel, exact: true })
      await expect(toc.locator('a')).toHaveCount(document === 'terms' ? 15 : 13)
      const section = page.locator('.legal-document .markdown-content > h2').nth(document === 'terms' ? 1 : 0)
      const id = await section.getAttribute('id')
      await expect(toc.locator('a').first()).toHaveAttribute('href', `#${id}`)
      await toc.locator('a').first().click()
      await expectHeadingInView(page, id)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://wolfx.jp${prefix}/legal/${document}`)
    }
    expect(await page.evaluate(() => window.__legalDocument)).toBe('retained')
    expect(problems).toEqual([])
  })
}
