import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { visit } from 'unist-util-visit'
import { parsePage } from '../../scripts/content-markdown.mjs'

const locales = [
  { locale: 'ja', prefix: '', tocLabel: 'このページの目次' },
  { locale: 'zh', prefix: '/zh', tocLabel: '本页目录' },
  { locale: 'en', prefix: '/en', tocLabel: 'On this page' },
]

// Guard the policy boundaries, not complete sentences or a fixed section count.
// These checks do not replace a human review of the translations.
const dataUseRules = {
  ja: {
    scope: /対象はこの API のデータに限り/,
    permission: /第三者が[^。]*独立して利用できるデータ源[\s\S]*事前の明示的な許諾が必要/,
    endUsers: /表示・通知[\s\S]*バックエンド[\s\S]*個別の許諾を要しません/,
    commercial: /商用・非商用を問わず利用/,
    unofficial: /独立した非公式プロジェクト/,
    safety: [/公式の警報や避難情報に代わるものではありません/, /公的機関の最新情報/, /唯一の情報源/],
    protection: [/レート制限[^\n]*回避/, /アクセス[^。\n]*制限・停止/],
    rights: /必要な第三者の許諾に代わったりするものではありません/,
    existing: /既存の有効な個別許諾[\s\S]*撤回又は拡張されることはありません/,
    obsolete: /通常の情報利用と独立したデータ再提供|支払状況にかかわらず/,
  },
  zh: {
    scope: /此项限制仅针对该 API 的数据/,
    permission: /第三方[\s\S]*独立使用的数据源[\s\S]*事先取得运营者的明确授权/,
    endUsers: /向最终用户展示、通知[\s\S]*后台处理[\s\S]*无须取得个别授权/,
    commercial: /商业及非商业用途/,
    unofficial: /独立的非官方项目/,
    safety: [/不能替代官方警报或避难信息/, /官方机构的最新信息/, /唯一信息来源/],
    protection: [/绕过速率限制/, /限制或暂停/],
    rights: /不能替代必要的第三方许可/,
    existing: /已有的有效个别授权[\s\S]*不会仅因本次修订而被撤销或扩大/,
    obsolete: /正常信息利用与独立数据再提供|必须向所有用户完整、及时、免费开放/,
  },
  en: {
    scope: /restriction applies only to this API's data/,
    permission: /third parties can use independently[\s\S]*prior express permission/,
    endUsers: /end users[\s\S]*backend processing[\s\S]*require no individual permission/,
    commercial: /commercial or noncommercial purposes/,
    unofficial: /independent, unofficial project/,
    safety: [/do not replace official warnings or evacuation information/, /latest information from official authorities/, /sole source for decisions involving life or safety/],
    protection: [/Bypassing rate limits/, /restrict or suspend access/],
    rights: /do not change those rights or terms, or replace necessary third-party permission/,
    existing: /Existing valid individual permissions[\s\S]*neither revokes nor expands/,
    obsolete: /Ordinary Information Use and Independent Data Provision|fully and promptly available to all users free of charge/,
  },
}

function plainText(node) {
  if (node.type === 'break') return ' '
  return node.value ?? (node.children ?? []).map(plainText).join('')
}

async function readLegalPage(locale, document) {
  const source = await readFile(new URL(`../../content/${locale}/legal/${document}.md`, import.meta.url), 'utf8')
  const { data, tree } = parsePage(source)
  const titles = tree.children.filter(node => node.type === 'heading' && node.depth === 2).map(plainText)
  const paragraphs = []
  visit(tree, 'paragraph', (node) => {
    paragraphs.push(plainText(node).replace(/\s+/g, ' ').trim())
  })
  return { data, titles, paragraphs }
}

async function renderedHeadings(page) {
  return page.locator('.legal-document .markdown-content > h2').evaluateAll(elements =>
    elements.map(element => ({ id: element.id, text: element.textContent.replace(/^#\s*/, '').trim() })))
}

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
  test(`${locale} JMA redistribution boundary and documentation links stay scoped`, async ({ page }) => {
    const rules = dataUseRules[locale]
    await page.goto(`${prefix}/legal/terms`, { waitUntil: 'networkidle' })
    const body = await page.locator('.legal-document .markdown-content').innerText()
    const protocol = page.locator('.legal-document code').filter({ hasText: /^jma_eew$/ }).first()
    const clause = await protocol.evaluate((marker) => {
      const article = marker.closest('.markdown-content')
      let heading = marker
      while (heading.parentElement !== article) heading = heading.parentElement
      while (heading && heading.tagName !== 'H2') heading = heading.previousElementSibling
      if (!heading) throw new Error('Missing policy section for jma_eew')
      const paragraphs = []
      for (let node = heading.nextElementSibling; node && node.tagName !== 'H2'; node = node.nextElementSibling)
        paragraphs.push(node.textContent)
      return paragraphs.join('\n')
    })
    for (const pattern of [rules.scope, rules.permission, rules.endUsers, rules.existing])
      expect(clause, `${locale}: JMA-only permission boundary`).toMatch(pattern)
    for (const term of ['Wolfx Project', 'jma_eew', 'HTTP', 'WebSocket', 'all_eew'])
      expect(clause).toContain(term)
    expect(clause).not.toMatch(/jma_tsunami|jma_special_eq|jma_earthquake_detail/)
    for (const pattern of [rules.commercial, rules.unofficial, rules.rights, ...rules.safety, ...rules.protection])
      expect(body).toMatch(pattern)
    expect(body).not.toMatch(rules.obsolete)
    await expect(page.locator(`.legal-document a[href="${prefix}/legal/privacy"]`)).toHaveCount(1)
    await expect(page.locator('.legal-document a[href="mailto:contact@mtf.edu.kg"]')).toHaveCount(1)

    // Keep documentation navigation local; status widgets must not call production.
    await page.route('https://api.wolfx.jp/**', route => route.fulfill({ status: 204 }))
    for (const document of ['websocket', 'open-api']) {
      await page.goto(`${prefix}/docs/${document}`, { waitUntil: 'networkidle' })
      // The current documents link legal pages through the shared footer.
      // They need not duplicate the JMA redistribution clause in their body.
      const footer = page.locator('.site-footer')
      const terms = footer.locator(`a[href="${prefix}/legal/terms"]`)
      await expect(terms).toHaveCount(1)
      await expect(footer.locator(`a[href="${prefix}/legal/privacy"]`)).toHaveCount(1)
      expect(await page.locator('main').innerText()).not.toMatch(rules.obsolete)
      await terms.click()
      await expect.poll(() => new URL(page.url()).pathname.replace(/\/$/, '')).toBe(`${prefix}/legal/terms`)
      await expect(protocol).toBeVisible()
    }
  })

  for (const document of ['terms', 'privacy']) {
    const route = `${prefix}/legal/${document}`

    test(`${locale} ${document} TOC follows real headings, scrolls, and preserves history and SEO`, async ({ page }) => {
      const problems = watchProblems(page)
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
      await page.goto(`${route}?source=legal-toc`, { waitUntil: 'networkidle' })

      const toc = page.getByRole('navigation', { name: tocLabel, exact: true })
      await expect(toc).toBeVisible()
      const source = await readLegalPage(locale, document)
      const headings = await renderedHeadings(page)
      expect(headings.map(heading => heading.text)).toEqual(source.titles)
      const published = (await page.locator('.legal-document .markdown-content').innerText()).replace(/\s+/g, ' ')
      for (const paragraph of source.paragraphs)
        expect(published, `${locale} ${document}: published policy paragraph`).toContain(paragraph)
      expect(headings.length).toBeGreaterThan(1)
      expect(new Set(headings.map(heading => heading.id)).size).toBe(headings.length)
      const firstTarget = Math.floor(headings.length / 3)
      const secondTarget = Math.floor(headings.length * 2 / 3)
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

      const { title, description, updated } = source.data
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
      await toc.locator('a').nth(firstTarget).click()
      expect(decodeURIComponent(new URL(page.url()).hash)).toBe(`#${headings[firstTarget].id}`)
      expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe(route)
      expect(new URL(page.url()).search).toBe('?source=legal-toc')
      await expectHeadingInView(page, headings[firstTarget].id)
      expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0)

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

      await toc.locator('a').nth(secondTarget).click()
      await expectHeadingInView(page, headings[secondTarget].id)
      await page.goBack()
      expect(decodeURIComponent(new URL(page.url()).hash)).toBe(`#${headings[firstTarget].id}`)
      await expectHeadingInView(page, headings[firstTarget].id)
      await page.goForward()
      await expectHeadingInView(page, headings[secondTarget].id)
      expect(await page.evaluate(() => window.__legalDocument)).toBe('retained')

      await page.reload({ waitUntil: 'networkidle' })
      await expectHeadingInView(page, headings[secondTarget].id)
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
        return { scrollTop: element.scrollTop, maxScroll: element.scrollHeight - element.clientHeight, bottom: box.bottom, viewport: innerHeight }
      })
      expect(Math.abs(scroll.scrollTop - scroll.maxScroll)).toBeLessThanOrEqual(1)
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
      const { titles } = await readLegalPage(locale, document)
      await expect(toc.locator('a')).toHaveText(titles)
      expect((await renderedHeadings(page)).map(heading => heading.text)).toEqual(titles)
      const section = page.locator('.legal-document .markdown-content > h2').first()
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
