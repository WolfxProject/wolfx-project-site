import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

const locales = [
  { locale: 'ja', prefix: '', tocLabel: 'このページの目次' },
  { locale: 'zh', prefix: '/zh', tocLabel: '本页目录' },
  { locale: 'en', prefix: '/en', tocLabel: 'On this page' },
]

// The same policy assertions apply to every translation. These guards check the
// published clauses; interpretation of new uses still requires human review.
const dataUseRules = {
  ja: {
    heading: '通常の情報利用と独立したデータ再提供',
    ordinary: [
      /合理的な範囲で受信、複製、処理、変換、キャッシュ、保存、表示又は伝達/,
      /独立したデータ再提供に該当しない限り、運営者の個別許諾を要しない/,
      /営利性、Wolfx Project APIへの直接接続の有無、自己のサーバーの利用や内部処理・保存の有無、最終利用者への提供手段によって、この取扱いが変わるものではありません/,
      /自己のバックエンドと当該サービスを利用するクライアントとの間の伝送も、それ自体では独立したデータ再提供に当たりません/,
    ],
    independent: [
      /第三者が利用者の最終利用者向け情報サービスから独立して取得し、自己の他の製品、アプリ、システム又は事業に利用・組込みできるデータ源/,
      /データ供給サービス又はこれらと実質的に同等の機能/,
      /事前の明示的許諾なく、この独立したデータ再提供を行い、又は第三者にそのための再利用・再許諾の権限を与えてはなりません/,
    ],
    substance: [
      /実質的な機能および用途に基づき判断/,
      /データ形式、インターフェースの名称、通信方式、サーバー経由の有無、認証・アクセス制限又は有償・無償の別のみで決まるものではありません/,
      /形式変換、項目名の変更、簡易な加工、アクセス制限又は自己のアプリやウェブサイトへの組込みによって、事前の許諾が不要になるものではありません/,
    ],
    permission: /許諾の範囲を超える独立したデータ再提供、再販売又は再許諾には、別途明示的な同意が必要/,
    safeguards: /個別許諾を受けた者は、第三者による許諾範囲外[\s\S]*合理的な技術的措置[\s\S]*技術的に絶対に不可能であることまで求めるものではありません/,
    existing: /既に有効に付与された個別許諾[\s\S]*遡及的に自動撤回されるものではありません/,
    priority: /個別説明の優先適用によっても、第六条の無償提供、出典表示および独立したデータ再提供に関する義務が緩和されることはありません/,
    forwarding: /追加の遅延や障害[\s\S]*通常の情報利用と独立したデータ再提供の区分および第七条/,
    upstream: /通常の情報利用および個別許諾は、第三者の許諾に代わるものでも[\s\S]*内部保存、最終利用者への表示および第三者への提供[\s\S]*必要な権利者の許諾なく、上流の原電文その他の制限対象データを公開再配布してはならず/,
    websocket: /通常の情報利用は、自己のサーバーを介した処理・伝達を含め、個別許諾を要しません[\s\S]*独立したデータ再提供には事前の明示的許諾が必要/,
    obsolete: /限定的な再配布に当たり|この説明は、そのような転送を許諾するものではなく|無許可のデータ再配布/,
  },
  zh: {
    heading: '正常信息利用与独立数据再提供',
    ordinary: [
      /在合理范围内接收、复制、处理、转换、缓存、保存、展示或传递/,
      /只要不构成下文定义的独立数据再提供，即属于无须取得运营者个别许可/,
      /不因是否具有商业性质、是否直接连接 Wolfx Project API、是否使用自身服务器或进行内部处理及保存、采用何种最终用户信息提供方式而改变/,
      /自身后端与使用该服务的客户端之间的传输，本身也不构成独立数据再提供/,
    ],
    independent: [
      /第三方脱离使用方面向最终用户的信息服务而独立获取，并用于或集成到第三方自身其他产品、App、系统或业务的数据源/,
      /数据供应服务或具有实质相同功能/,
      /未经 Wolfx Project 运营者事先明确许可，不得实施此类独立数据再提供，也不得向第三方授予为此目的再利用或继续转授权的权限/,
    ],
    substance: [
      /根据提供行为的实质功能及用途判断/,
      /不能仅凭数据格式、接口名称、通信方式、是否经服务器中转、身份认证及访问限制或是否收费来决定/,
      /格式转换、字段改名、简单加工、访问限制或嵌入自身 App、网站而免除事先取得许可的要求/,
    ],
    permission: /超出许可范围的独立数据再提供、再销售或继续转授权，须另行取得明确同意/,
    safeguards: /取得个别许可的主体须采取[\s\S]*合理技术措施[\s\S]*并非保证第三方在技术上绝对不可能访问/,
    existing: /已有的有效个别许可[\s\S]*不因本条款修订本身而被自动追溯撤销/,
    priority: /专项说明的优先适用不减轻第六条关于免费提供功能、来源标注及独立数据再提供的义务/,
    forwarding: /额外延迟及故障风险[\s\S]*正常信息利用与独立数据再提供的区分，以及第七条/,
    upstream: /正常信息利用及个别许可均不能替代第三方许可[\s\S]*内部保存、向最终用户展示及向第三方提供[\s\S]*未经相关权利人必要许可，不得公开再分发上游原始电文或其他受限制数据/,
    websocket: /正常信息利用，包括通过自身服务器处理和传递信息，无须取得个别许可[\s\S]*独立数据再提供须事先取得明确许可/,
    obsolete: /则属于受限再分发|本说明不构成对这类转发的许可|禁止未经许可的数据再分发/,
  },
  en: {
    heading: 'Ordinary Information Use and Independent Data Provision',
    ordinary: [
      /Reasonable reception, copying, processing, conversion, caching, storage, display, or transmission/,
      /ordinary information use requiring no individual permission[\s\S]*provided it does not constitute independent data provision/,
      /does not depend on commercial status, direct connection to a Wolfx Project API, the use of the User's own servers or internal processing and storage, or the means of delivering information to end users/,
      /Transmission between the User's own backend and clients using that service does not in itself constitute independent data provision/,
    ],
    independent: [
      /third parties can obtain data independently of the User's information service for end users and use or integrate it into their other products, apps, systems, or businesses/,
      /a data source, data supply service, or something with a substantially equivalent function/,
      /Without prior express permission from the Wolfx Project operator, Users must not engage in independent data provision or grant third parties rights to reuse or sublicense data for that purpose/,
    ],
    substance: [
      /determined by its substantive function and purpose/,
      /rather than solely by data format, interface name, communication method, server routing, authentication or access restrictions, or whether a fee is charged/,
      /format conversion, field renaming, simple processing, access restrictions, or incorporation into the User's own app or website do not remove the requirement for prior permission/,
    ],
    permission: /Independent data provision, resale, or sublicensing beyond the authorized scope requires separate express consent/,
    safeguards: /Entities holding individual permission must take reasonable technical measures[\s\S]*does not require a guarantee that third-party access is technically impossible/,
    existing: /Existing valid individual permissions[\s\S]*not automatically revoked retroactively merely by this revision/,
    priority: /This priority does not relax the obligations in Section 6 concerning free access to features, attribution, or independent data provision/,
    forwarding: /additional delays and failures[\s\S]*distinction between ordinary information use and independent data provision in Section 6[\s\S]*Section 7/,
    upstream: /Neither ordinary information use allowed under Section 6 nor individual permission under that Section replaces third-party permission[\s\S]*Internal storage, display to end users, and provision to third parties[\s\S]*must not publicly redistribute original upstream messages or other restricted data without the necessary permission/,
    websocket: /Ordinary information use[\s\S]*including processing and transmission through your own servers, requires no individual permission[\s\S]*Independent data provision[\s\S]*requires prior express permission/,
    obsolete: /constitutes limited redistribution|This statement does not authorize such forwarding|Unauthorized data redistribution/,
  },
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
  test(`${locale} data-use boundary distinguishes end-user services from independent supply`, async ({ page }) => {
    const rules = dataUseRules[locale]
    await page.goto(`${prefix}/legal/terms`, { waitUntil: 'networkidle' })
    const body = await page.locator('.legal-document .markdown-content').innerText()
    const paragraphs = await page.getByRole('heading', { level: 3, name: rules.heading, exact: true }).evaluate((heading) => {
      const result = []
      for (let node = heading.nextElementSibling; node && !/^H[23]$/.test(node.tagName); node = node.nextElementSibling) {
        if (node.tagName === 'P')
          result.push(node.textContent)
      }
      return result
    })
    for (const [index, patterns] of [rules.ordinary, rules.independent, rules.substance].entries()) {
      for (const pattern of patterns)
        expect(paragraphs[index], `${locale}: boundary paragraph ${index + 1}`).toMatch(pattern)
    }
    for (const [name, pattern] of Object.entries({
      permission: rules.permission,
      safeguards: rules.safeguards,
      existing: rules.existing,
      priority: rules.priority,
      forwarding: rules.forwarding,
      upstream: rules.upstream,
    }))
      expect(body, `${locale}: ${name}`).toMatch(pattern)
    expect(body).not.toMatch(rules.obsolete)

    await page.goto(`${prefix}/docs/websocket`, { waitUntil: 'networkidle' })
    const notice = page.locator('.markdown-content li').filter({ has: page.locator(`a[href="${prefix}/legal/terms"]`) })
    await expect(notice).toHaveCount(1)
    expect(await notice.innerText()).toMatch(rules.websocket)
    expect(await page.locator('main').innerText()).not.toMatch(rules.obsolete)
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
