import { expect, test } from '@playwright/test'

const baseOrigin = (process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4381').replace(/\/$/, '')
const statusJsonPath = '/ws_clients.json'
const statusImagePaths = new Set([
  '/status/nginx_request-day.png',
  '/status/nginx_request-week.png',
  '/status/if_eth0-day.png',
  '/status/if_eth0-week.png',
])
const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+Xw0YAAAAAElFTkSuQmCC', 'base64')
const donationAddresses = [
  'bc1qqrlqfhf3enhjexf5hl068el0rctv07zupcld23',
  'bc1pf47954hraeuyg6k088rt9wy9u49jjvpz70luw4ythamtd5l7dhxqzf70z5',
  '0x5f72A4a28D765E53e6F2a2C69a7CBD83172df2AA',
]

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
]

const contentPaths = [
  '/',
  '/projects',
  '/donate',
  '/docs/open-api',
  '/docs/websocket',
  '/docs/seisjs-api',
  '/legal/privacy',
  '/legal/terms',
]
const allContentRoutes = contentPaths.flatMap(path => [
  path,
  `/zh${path}`,
  `/en${path}`,
]).map(path => path.replace(/\/$/, '') || '/')

const representativeLayoutRoutes = [
  '/', '/zh/', '/en/',
  '/donate', '/zh/donate', '/en/donate',
  '/docs/open-api/', '/zh/docs/open-api/', '/en/docs/open-api/',
  '/docs/websocket/', '/docs/seisjs-api/',
  '/legal/privacy/', '/legal/terms/',
  '/projects/', '/404.html',
]

const initialLoadRoutes = [
  '/', '/zh/', '/en/',
  '/donate', '/zh/donate', '/en/donate',
  '/docs/open-api/', '/zh/docs/open-api/', '/en/docs/open-api/',
  '/legal/privacy/', '/zh/legal/privacy/', '/en/legal/privacy/',
  '/legal/terms/', '/zh/legal/terms/', '/en/legal/terms/',
  '/404.html',
]

function isAllowedStatusRequest(url) {
  if (url.origin !== 'https://api.wolfx.jp')
    return false
  if (url.pathname === statusJsonPath)
    return url.search === ''
  if (!statusImagePaths.has(url.pathname))
    return false
  const entries = [...url.searchParams.entries()]
  return entries.length === 1 && entries[0][0] === 'ts' && /^\d+$/.test(entries[0][1])
}

async function mockApiStatus(page, options = {}) {
  const {
    statusCode = 200,
    statusBody = { client_counts: 1234, update_at: '2026-08-04 21:30:00' },
    failedImagePath,
  } = options

  await page.route('https://api.wolfx.jp/**', async (route) => {
    const url = new URL(route.request().url())
    if (!isAllowedStatusRequest(url)) {
      await route.abort('blockedbyclient')
      return
    }
    if (url.pathname === statusJsonPath) {
      const body = typeof statusBody === 'function' ? statusBody() : statusBody
      await route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' },
        body: JSON.stringify(body),
      })
      return
    }
    const shouldFail = url.pathname === failedImagePath
    await route.fulfill({
      status: shouldFail ? 500 : 200,
      contentType: shouldFail ? 'text/plain' : 'image/png',
      body: shouldFail ? 'chart unavailable' : transparentPng,
    })
  })
}

test.beforeEach(async ({ page }) => {
  await mockApiStatus(page)
})

async function revealStatusCharts(panel) {
  await expect(panel).toBeAttached()
  const images = panel.locator('img')
  await expect(images).toHaveCount(4)
  for (let index = 0; index < 4; index++)
    await images.nth(index).scrollIntoViewIfNeeded()
  return images
}

test('critical pages make no unexpected third-party requests', async ({ page }) => {
  const externalRequests = new Set()
  const apiRequests = new Set()
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.origin === 'https://api.wolfx.jp' && isAllowedStatusRequest(url))
      apiRequests.add(url.pathname)
    else if (url.origin !== baseOrigin)
      externalRequests.add(url.href)
  })

  for (const route of initialLoadRoutes) {
    const response = await page.goto(route, { waitUntil: 'networkidle' })
    if (route === '/404.html')
      expect([200, 404], route).toContain(response?.status())
    else
      expect(response?.ok(), route).toBeTruthy()
    if (route.includes('/docs/open-api/')) {
      const panel = page.locator('[data-api-status-panel]')
      await revealStatusCharts(panel)
      await expect.poll(() => apiRequests.size).toBe(5)
    }
  }
  expect([...externalRequests]).toEqual([])
  expect([...apiRequests].sort()).toEqual([statusJsonPath, ...statusImagePaths].sort())
})

test('all 24 content pages preserve the shared layout and typography invariants', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1366, height: 768 })

  for (const route of allContentRoutes) {
    const response = await page.goto(route, { waitUntil: 'networkidle' })
    expect(response?.ok(), route).toBeTruthy()
    await expect(page.locator('h1'), `${route}: h1 count`).toHaveCount(1)

    const metrics = await page.evaluate(() => {
      const root = document.documentElement
      const header = document.querySelector('.site-header')
      const main = document.querySelector('.site-shell main')
      const footer = document.querySelector('.site-footer')
      const h1 = document.querySelector('h1')
      const h2Sizes = [...document.querySelectorAll('h2')].map(element => Number.parseFloat(getComputedStyle(element).fontSize))
      const h1Rect = h1?.getBoundingClientRect()
      const mainRect = main?.getBoundingClientRect()
      const footerRect = footer?.getBoundingClientRect()
      return {
        overflow: root.scrollWidth - root.clientWidth,
        maxH2: Math.max(0, ...h2Sizes),
        h1Left: h1Rect?.left ?? 0,
        h1Right: h1Rect?.right ?? root.clientWidth,
        mainBottom: mainRect?.bottom ?? 0,
        footerTop: footerRect?.top ?? Number.POSITIVE_INFINITY,
        scrollPaddingTop: Number.parseFloat(getComputedStyle(root).scrollPaddingTop),
        headerHeight: header?.getBoundingClientRect().height ?? 0,
      }
    })

    expect(metrics.overflow, `${route}: page overflow`).toBeLessThanOrEqual(1)
    expect(metrics.maxH2, `${route}: h2 size`).toBeLessThanOrEqual(40)
    expect(metrics.h1Left, `${route}: h1 left edge`).toBeGreaterThanOrEqual(8)
    expect(metrics.h1Right, `${route}: h1 right edge`).toBeLessThanOrEqual(1358)
    expect(metrics.mainBottom, `${route}: footer overlap`).toBeLessThanOrEqual(metrics.footerTop + 1)
    expect(metrics.scrollPaddingTop, `${route}: anchor offset`).toBeGreaterThanOrEqual(metrics.headerHeight)

    const tables = page.locator('table')
    await expect(page.locator('.table-scroll > table'), `${route}: table wrapper`).toHaveCount(await tables.count())
    const tableWrappers = page.locator('.table-scroll')
    for (let index = 0; index < await tableWrappers.count(); index++)
      expect(await tableWrappers.nth(index).evaluate(element => getComputedStyle(element).overflowX), `${route}: table scrolling`).toBe('auto')
  }
})

test('API Status renders localized live data and accessible charts in all languages', async ({ page }) => {
  const cases = [
    {
      route: '/docs/open-api/',
      heading: 'API ステータス',
      clients: 'アクティブな WebSocket クライアント',
      updated: 'データ更新日時',
      alts: ['Nginx リクエスト — 日間', 'Nginx リクエスト — 週間', 'ネットワークトラフィック — 日間', 'ネットワークトラフィック — 週間'],
    },
    {
      route: '/zh/docs/open-api/',
      heading: 'API 状态',
      clients: '活跃 WebSocket 客户端',
      updated: '数据更新时间',
      alts: ['Nginx 请求量 — 每日', 'Nginx 请求量 — 每周', '网络流量 — 每日', '网络流量 — 每周'],
    },
    {
      route: '/en/docs/open-api/',
      heading: 'API Status',
      clients: 'Active WebSocket clients',
      updated: 'Count data updated at',
      alts: ['Nginx Requests — Daily', 'Nginx Requests — Weekly', 'Network Traffic — Daily', 'Network Traffic — Weekly'],
    },
  ]

  for (const item of cases) {
    await page.goto(item.route, { waitUntil: 'networkidle' })
    const panel = page.locator('[data-api-status-panel]')
    await expect(page.getByRole('heading', { name: item.heading, exact: true })).toBeVisible()
    await expect(panel.getByText(item.clients, { exact: true })).toBeVisible()
    await expect(panel.getByText('1,234', { exact: true })).toBeVisible()
    await expect(panel.getByText(item.updated, { exact: true })).toBeVisible()
    await expect(panel.getByText('2026-08-04 21:30:00', { exact: true })).toBeVisible()
    const images = await revealStatusCharts(panel)
    await expect(images.last()).toBeVisible()
    expect(await images.evaluateAll(elements => elements.map(image => image.getAttribute('alt')))).toEqual(item.alts)
    await expect(page.getByRole('heading', { name: 'Doc version: v20260729', exact: true })).toBeAttached()
    const timestamps = await images.evaluateAll(elements => elements.map(image => new URL(image.src).searchParams.get('ts')))
    expect(new Set(timestamps).size).toBe(1)
  }
})

test('API Status refreshes once on demand with a new shared chart timestamp', async ({ page }) => {
  await page.unroute('https://api.wolfx.jp/**')
  let requestCount = 0
  await mockApiStatus(page, {
    statusBody: () => ({
      client_counts: ++requestCount === 1 ? 1234 : 5678,
      update_at: requestCount === 1 ? '2026-08-04 21:30:00' : '2026-08-04 21:31:00',
    }),
  })

  await page.goto('/en/docs/open-api/', { waitUntil: 'networkidle' })
  const panel = page.locator('[data-api-status-panel]')
  await expect(panel.getByText('1,234', { exact: true })).toBeVisible()
  await revealStatusCharts(panel)
  const initialTimestamp = new URL(await panel.locator('img').first().getAttribute('src')).searchParams.get('ts')
  await panel.getByRole('button', { name: 'Refresh', exact: true }).click()
  await expect(panel.getByRole('button', { name: 'Refreshing', exact: true })).toBeDisabled()
  await expect(panel.getByText('5,678', { exact: true })).toBeVisible()
  const refreshedSources = await panel.locator('img').evaluateAll(elements => elements.map(image => image.src))
  const refreshedTimestamps = new Set(refreshedSources.map(source => new URL(source).searchParams.get('ts')))
  expect(refreshedTimestamps.size).toBe(1)
  expect([...refreshedTimestamps][0]).not.toBe(initialTimestamp)
  expect(requestCount).toBe(2)
})

test('API Status handles JSON and individual chart failures without hiding the document', async ({ page }) => {
  await page.unroute('https://api.wolfx.jp/**')
  await mockApiStatus(page, { statusCode: 500, failedImagePath: '/status/nginx_request-week.png' })
  await page.goto('/zh/docs/open-api/', { waitUntil: 'domcontentloaded' })
  const panel = page.locator('[data-api-status-panel]')
  await expect(panel.getByText('无法获取状态', { exact: true })).toBeVisible()
  const failedChart = panel.locator('.api-status-panel__chart').nth(1)
  await failedChart.scrollIntoViewIfNeeded()
  await expect(failedChart.getByText('无法加载图表', { exact: true })).toBeVisible()
  await expect(panel.locator('img')).toHaveCount(3)
  await expect(page.getByRole('heading', { name: 'Doc version: v20260729', exact: true })).toBeAttached()
})

test('API Status has no hydration warnings, duplicate status requests, or dark/mobile overflow', async ({ page }) => {
  const problems = []
  const statusRequests = []
  page.on('console', (message) => {
    const text = message.text()
    const isRelevantWarning = message.type() === 'warning'
      && (/hydration/i.test(text) || /\[Vue warn\]/i.test(text) || /unhandled/i.test(text))
    if (message.type() === 'error' || isRelevantWarning)
      problems.push(text)
  })
  page.on('pageerror', error => problems.push(error.message))
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.origin === 'https://api.wolfx.jp' && url.pathname === statusJsonPath)
      statusRequests.push(url.href)
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  for (const route of ['/docs/open-api', '/zh/docs/open-api', '/en/docs/open-api']) {
    await page.goto(route, { waitUntil: 'networkidle' })
    const panel = page.locator('[data-api-status-panel]')
    await revealStatusCharts(panel)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, route).toBeLessThanOrEqual(1)
    const colors = await panel.evaluate((element) => {
      const style = getComputedStyle(element)
      return { color: style.color, background: style.backgroundColor }
    })
    expect(colors.color).not.toBe(colors.background)
  }
  expect(statusRequests).toHaveLength(3)
  expect(problems).toEqual([])
})

test('static search works in Japanese, Chinese, and English after navigation and reload', async ({ page }) => {
  const cases = [
    { route: '/', query: '緊急地震速報', pathPrefix: '/docs/' },
    { route: '/zh/', query: '地震预警', pathPrefix: '/zh/docs/' },
    { route: '/en/', query: 'earthquake', pathPrefix: '/en/docs/' },
  ]

  for (const item of cases) {
    await page.goto(item.route)
    await page.locator('.search-trigger').click()
    const input = page.locator('.search-dialog input[role="combobox"]')
    await input.fill(item.query)
    const firstResult = page.locator('#search-results a').first()
    await expect(firstResult).toBeVisible()
    await expect(firstResult).toHaveAttribute('href', new RegExp(`^${item.pathPrefix}`))
    await input.press('ArrowDown')
    await expect(input).toHaveAttribute('aria-activedescendant', /^search-result-\d+$/)
    await input.press('ArrowUp')
    await expect(input).toHaveAttribute('aria-activedescendant', 'search-result-0')
    await firstResult.click()
    await expect(page).toHaveURL(new RegExp(item.pathPrefix))
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('.search-trigger')).toBeVisible()
    await page.locator('.search-trigger').click()
    await expect(page.locator('.search-dialog input[role="combobox"]')).toBeFocused()
    await page.getByRole('button', { name: /閉じる|关闭|Close/ }).click()
  }
})

test('Donate pages preserve addresses, copy with localized feedback, and expose a safe Afdian link', async ({ page }) => {
  await page.addInitScript(() => {
    window.__copiedDonationAddresses = []
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async value => window.__copiedDonationAddresses.push(value),
      },
    })
  })

  const cases = [
    { route: '/donate', title: 'Wolfx Project への寄付', copied: 'コピーしました' },
    { route: '/zh/donate', title: '支持 Wolfx Project', copied: '已复制' },
    { route: '/en/donate', title: 'Wolfx Donate', copied: 'Copied' },
  ]

  for (const item of cases) {
    await page.goto(item.route, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: item.title, exact: true })).toBeVisible()
    const cards = page.locator('[data-donation-address]')
    await expect(cards).toHaveCount(3)
    const displayedAddresses = await cards.locator('code').allTextContents()
    expect(displayedAddresses).toEqual(donationAddresses)
    for (let index = 0; index < donationAddresses.length; index++) {
      const address = cards.nth(index).locator('code')
      await expect(address).toHaveAttribute('tabindex', '0')
      await cards.nth(index).getByRole('button').click()
      await expect(cards.nth(index).locator('.copy-button__label')).toHaveText(item.copied)
    }
    expect(await page.evaluate(() => window.__copiedDonationAddresses)).toEqual(donationAddresses)
    const afdian = page.locator('a[href="https://ifdian.net/a/wolfx"]')
    await expect(afdian).toHaveAttribute('target', '_blank')
    await expect(afdian).toHaveAttribute('rel', 'noopener noreferrer')
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('[data-donation-address]')).toHaveCount(3)
  }
})

test('Donate copy failures are localized and announced without alert dialogs', async ({ page }) => {
  await page.addInitScript(() => {
    window.alert = () => {
      throw new Error('alert() must not be used')
    }
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new Error('mock clipboard denial') } },
    })
  })
  const cases = [
    { route: '/donate', failed: 'コピーできませんでした' },
    { route: '/zh/donate', failed: '复制失败' },
    { route: '/en/donate', failed: 'Copy failed' },
  ]
  for (const item of cases) {
    await page.goto(item.route)
    const firstCard = page.locator('[data-donation-address]').first()
    await firstCard.getByRole('button').click()
    await expect(firstCard.locator('.copy-button__label')).toHaveText(item.failed)
    await expect(firstCard.locator('[aria-live="polite"]')).toHaveText(item.failed)
  }
})

test('Donate pages make no third-party requests and have no hydration or icon warnings', async ({ page }) => {
  const problems = []
  const externalRequests = []
  page.on('console', (message) => {
    const text = message.text()
    if (message.type() === 'error' || (message.type() === 'warning' && /hydration|\[Vue warn\]|failed to load icon|unhandled/i.test(text)))
      problems.push(text)
  })
  page.on('pageerror', error => problems.push(error.message))
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.origin !== baseOrigin)
      externalRequests.push(url.href)
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  for (const route of ['/donate', '/zh/donate', '/en/donate']) {
    await page.goto(route, { waitUntil: 'networkidle' })
    const layout = await page.evaluate(() => {
      const rect = selector => document.querySelector(selector)?.getBoundingClientRect()
      const fontSize = selector => Number.parseFloat(getComputedStyle(document.querySelector(selector)).fontSize)
      const reading = rect('.content-section--reading')
      const card = rect('[data-donation-address]')
      const external = rect('.content-prose > .external-link')
      const thanks = rect('.content-section--reading > p:last-child')
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        heroFontSize: fontSize('.page-intro h1'),
        sectionFontSize: fontSize('.content-section--reading > h2'),
        readingLeft: reading.left,
        readingRight: reading.right,
        cardLeft: card.left,
        cardRight: card.right,
        externalLeft: external.left,
        externalRight: external.right,
        thanksLeft: thanks.left,
        thanksRight: thanks.right,
      }
    })
    expect(layout.overflow, route).toBeLessThanOrEqual(1)
    expect(layout.sectionFontSize, `${route}: section title hierarchy`).toBeLessThan(layout.heroFontSize * 0.65)
    expect(Math.abs(layout.cardLeft - layout.readingLeft), `${route}: card left edge`).toBeLessThanOrEqual(1)
    expect(Math.abs(layout.cardRight - layout.readingRight), `${route}: card right edge`).toBeLessThanOrEqual(1)
    expect(Math.abs(layout.externalLeft - layout.readingLeft), `${route}: Afdian left edge`).toBeLessThanOrEqual(1)
    expect(Math.abs(layout.externalRight - layout.readingRight), `${route}: Afdian right edge`).toBeLessThanOrEqual(1)
    expect(Math.abs(layout.thanksLeft - layout.readingLeft), `${route}: closing copy left edge`).toBeLessThanOrEqual(1)
    expect(Math.abs(layout.thanksRight - layout.readingRight), `${route}: closing copy right edge`).toBeLessThanOrEqual(1)
    const cardColors = await page.locator('[data-donation-address]').first().evaluate((element) => {
      const style = getComputedStyle(element)
      return { color: style.color, background: style.backgroundColor }
    })
    expect(cardColors.color).not.toBe(cardColors.background)
  }
  expect(externalRequests).toEqual([])
  expect(problems).toEqual([])
})

test('hero, Markdown, component, document, and legal headings keep separate scales', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })

  await page.goto('/donate')
  const donateSizes = await page.evaluate(() => ({
    hero: Number.parseFloat(getComputedStyle(document.querySelector('.page-intro h1')).fontSize),
    section: Number.parseFloat(getComputedStyle(document.querySelector('.content-prose > h2')).fontSize),
    component: Number.parseFloat(getComputedStyle(document.querySelector('.donation-address__heading h2')).fontSize),
  }))
  expect(donateSizes.section).toBeLessThan(donateSizes.hero * 0.65)
  expect(donateSizes.component).toBeLessThan(donateSizes.section)

  await page.goto('/docs/open-api')
  const docsSizes = await page.evaluate(() => ({
    page: Number.parseFloat(getComputedStyle(document.querySelector('.document-header h1')).fontSize),
    section: Number.parseFloat(getComputedStyle(document.querySelector('.prose-document .markdown-content > h2')).fontSize),
  }))
  expect(docsSizes.section).toBeLessThan(docsSizes.page * 0.75)

  await page.goto('/projects')
  const projectSizes = await page.evaluate(() => ({
    page: Number.parseFloat(getComputedStyle(document.querySelector('.page-intro h1')).fontSize),
    component: Number.parseFloat(getComputedStyle(document.querySelector('.project-card h3')).fontSize),
  }))
  expect(projectSizes.component).toBeLessThan(projectSizes.page * 0.6)

  await page.goto('/legal/privacy')
  const legalSizes = await page.evaluate(() => ({
    page: Number.parseFloat(getComputedStyle(document.querySelector('.document-header h1')).fontSize),
    section: Number.parseFloat(getComputedStyle(document.querySelector('.legal-document .markdown-content > h2')).fontSize),
  }))
  expect(legalSizes.section).toBeLessThan(legalSizes.page * 0.75)
})

test('Donate search terms resolve to the matching language pages', async ({ page }) => {
  const cases = [
    { route: '/', query: '寄付', expectedPath: '/donate' },
    { route: '/zh/', query: '捐赠', expectedPath: '/zh/donate' },
    { route: '/en/', query: 'Donate', expectedPath: '/en/donate' },
  ]
  for (const item of cases) {
    await page.goto(item.route)
    await page.locator('.search-trigger').click()
    await page.locator('.search-dialog input[role="combobox"]').fill(item.query)
    const result = page.locator(`#search-results a[href="${item.expectedPath}"]`)
    await expect(result).toBeVisible()
  }
})

for (const viewport of viewports) {
  test(`${viewport.width}x${viewport.height} layout has no page-level overflow`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.setViewportSize(viewport)
    for (const route of representativeLayoutRoutes) {
      await page.goto(route)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, route).toBeLessThanOrEqual(1)
      if (route === '/donate') {
        const geometry = await page.evaluate(() => {
          const reading = document.querySelector('.content-section--reading').getBoundingClientRect()
          const card = document.querySelector('[data-donation-address]').getBoundingClientRect()
          const external = document.querySelector('.content-prose > .external-link').getBoundingClientRect()
          const thanks = document.querySelector('.content-section--reading > p:last-child').getBoundingClientRect()
          const heroSize = Number.parseFloat(getComputedStyle(document.querySelector('.page-intro h1')).fontSize)
          const sectionSize = Number.parseFloat(getComputedStyle(document.querySelector('.content-prose > h2')).fontSize)
          return {
            deltas: [card.left - reading.left, card.right - reading.right, external.left - reading.left, external.right - reading.right, thanks.left - reading.left, thanks.right - reading.right],
            heroSize,
            sectionSize,
          }
        })
        expect(Math.max(...geometry.deltas.map(value => Math.abs(value))), `${viewport.width}: Donate alignment`).toBeLessThanOrEqual(1)
        expect(geometry.sectionSize, `${viewport.width}: Donate title scale`).toBeLessThan(geometry.heroSize * 0.65)
      }
    }

    if (viewport.width < 768) {
      const menu = page.locator('.mobile-menu-button')
      await expect(menu).toBeVisible()
      await menu.click()
      await expect(page.locator('#mobile-navigation')).toBeVisible()
    }
  })
}

test('explicit light and dark themes remain legible and persisted', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.removeItem('wolfx-color-mode'))
  await page.reload()

  const themeButton = page.locator('.header-actions > .icon-button').first()
  for (const theme of ['light', 'dark']) {
    await themeButton.click()
    await expect(page.locator('html')).toHaveClass(new RegExp(`(^|\\s)${theme}(\\s|$)`))
    await page.reload()
    await expect(page.locator('html')).toHaveClass(new RegExp(`(^|\\s)${theme}(\\s|$)`))
    const colors = await page.locator('body').evaluate((element) => {
      const style = getComputedStyle(element)
      return { color: style.color, background: style.backgroundColor }
    })
    expect(colors.color).not.toBe(colors.background)
  }
})
