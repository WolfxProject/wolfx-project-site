import { expect, test } from '@playwright/test'

const mcStatusEndpoint = 'https://mcapi.us/server/status?ip=Wolfx.jp'
const mcStatusRoute = 'https://mcapi.us/server/status?*'
const defaultStatus = {
  status: 'success',
  online: true,
  players: { now: 3, max: 100 },
}

const mcRoutes = [
  '/mc', '/mc/rules', '/mc/join', '/mc/vote',
  '/zh/mc', '/zh/mc/rules', '/zh/mc/join', '/zh/mc/vote',
  '/en/mc', '/en/mc/rules', '/en/mc/vote',
]

const targetViewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]

async function mockMinecraftStatus(page, body = defaultStatus) {
  const requests = []
  await page.route(mcStatusRoute, async (route) => {
    requests.push(route.request().url())
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })
  return requests
}

test('all recovered WolfxMC pages render as a responsive static site', async ({ page }) => {
  test.setTimeout(90_000)
  await mockMinecraftStatus(page)
  await page.setViewportSize({ width: 390, height: 844 })

  for (const route of mcRoutes) {
    const response = await page.goto(route, { waitUntil: 'networkidle' })
    expect(response?.ok(), route).toBeTruthy()
    await expect(page.locator('html')).toHaveAttribute('data-site', 'wolfxmc')
    await expect(page.locator('h1'), `${route}: h1 count`).toHaveCount(1)
    await expect(page.locator('.mc-navigation')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), route).toBeLessThanOrEqual(1)
    for (const title of await page.locator('.mc-community-grid strong').all()) {
      const box = await title.boundingBox()
      expect(box?.width ?? 0, `${route}: community label width`).toBeGreaterThan(70)
    }
  }
})

test('WolfxMC remains overflow-free at every target viewport', async ({ page }) => {
  await mockMinecraftStatus(page)
  for (const viewport of targetViewports) {
    await page.setViewportSize(viewport)
    await page.goto('/zh/mc', { waitUntil: 'networkidle' })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
      `${viewport.width}x${viewport.height}`,
    ).toBeLessThanOrEqual(1)
    await expect(page.locator('.mc-hero')).toBeVisible()
    await expect(page.locator('.mc-server-chip')).toBeVisible()
    await expect(page.locator('.mc-community-grid')).toBeVisible()
  }
})

test('WolfxMC metadata uses its public host and only recovered languages', async ({ page }) => {
  await mockMinecraftStatus(page)
  const cases = [
    { route: '/mc', canonical: 'https://mc.wolfx.jp/', lang: 'zh-CN' },
    { route: '/zh/mc/rules', canonical: 'https://mc.wolfx.jp/zh/rules', lang: 'zh-CN' },
    { route: '/en/mc/vote', canonical: 'https://mc.wolfx.jp/en/vote', lang: 'en-US' },
  ]

  for (const item of cases) {
    await page.goto(item.route)
    await expect(page.locator('html')).toHaveAttribute('lang', item.lang)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', item.canonical)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', item.canonical)
    await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang="ja"]')).toHaveCount(0)
    await expect(page.locator('select[aria-label] option')).toHaveCount(2)
  }
})

test('WolfxMC loads only the JSON status endpoint and no archived third-party script', async ({ page }) => {
  const statusRequests = await mockMinecraftStatus(page)
  const external = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.origin !== 'http://127.0.0.1:4381')
      external.push(url.href)
  })

  for (const route of ['/mc', '/mc/rules', '/mc/join', '/mc/vote', '/en/mc/rules'])
    await page.goto(route, { waitUntil: 'networkidle' })

  expect(statusRequests).toEqual([mcStatusEndpoint])
  expect(external).toEqual([mcStatusEndpoint])
  await expect(page.locator('script[src*="mcapi.us"]')).toHaveCount(0)
  expect(await page.locator('body').evaluate(element => element.innerHTML)).not.toMatch(/web\.archive\.org|minecraft\.min\.js/i)
})

test('server address copies with accessible feedback', async ({ page }) => {
  await mockMinecraftStatus(page)
  await page.addInitScript(() => {
    window.__copiedWolfxMcAddress = ''
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async value => (window.__copiedWolfxMcAddress = value) },
    })
  })
  await page.goto('/en/mc')
  const copy = page.locator('.mc-server-chip .copy-button')
  await copy.click()
  await expect(copy).toHaveAttribute('data-state', 'copied')
  await expect(copy).toHaveAccessibleName(/Copied/)
  expect(await page.evaluate(() => window.__copiedWolfxMcAddress)).toBe('Wolfx.jp')
})

test('WolfxMC is discoverable from Projects and remains readable in dark mode', async ({ page }) => {
  await mockMinecraftStatus(page)
  await page.goto('/projects')
  const project = page.locator('.project-card').filter({ has: page.getByRole('heading', { name: 'Wolfx Survival' }) })
  await expect(project.getByRole('link')).toHaveAttribute('href', 'https://mc.wolfx.jp')

  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/en/mc')
  await expect(page.locator('html')).toHaveClass(/dark/)
  const colors = await page.locator('.mc-hero').evaluate((element) => {
    const style = getComputedStyle(element)
    return { color: style.color, background: style.backgroundColor }
  })
  expect(colors.color).not.toBe(colors.background)
})

test('online status displays the current count without maximum slots or map size', async ({ page }) => {
  const requests = await mockMinecraftStatus(page, {
    status: 'success',
    online: true,
    players: { now: 7, max: 100 },
  })
  await page.goto('/en/mc', { waitUntil: 'networkidle' })

  const status = page.locator('.mc-server-status')
  await expect(status).toHaveAttribute('data-state', 'online')
  await expect(status).toContainText('Online')
  await expect(status).toContainText('7 players online')
  await expect(status).not.toContainText('100')
  await expect(page.locator('.mc-hero__facts > div')).toHaveCount(2)
  await expect(page.locator('.mc-hero')).not.toContainText(/Map size/i)
  expect(requests).toEqual([mcStatusEndpoint])

  await page.waitForTimeout(250)
  expect(requests).toHaveLength(1)
})

test('online status preserves a confirmed zero-player count', async ({ page }) => {
  await mockMinecraftStatus(page, {
    status: 'success',
    online: true,
    players: { now: 0, max: 100 },
  })
  await page.goto('/zh/mc', { waitUntil: 'networkidle' })

  const status = page.locator('.mc-server-status')
  await expect(status).toHaveAttribute('data-state', 'online')
  await expect(status).toContainText('在线')
  await expect(status).toContainText('0 人在线')
})

test('offline status never fabricates a player count', async ({ page }) => {
  await mockMinecraftStatus(page, { status: 'success', online: false })
  await page.goto('/en/mc', { waitUntil: 'networkidle' })

  const status = page.locator('.mc-server-status')
  await expect(status).toHaveAttribute('data-state', 'offline')
  await expect(status).toContainText('Offline')
  await expect(status.locator('.mc-server-status__players')).toHaveCount(0)
})

test('network and HTTP failures are unavailable rather than offline', async ({ page }) => {
  for (const failure of ['network', 'http']) {
    await page.route(mcStatusRoute, async (route) => {
      if (failure === 'network') {
        await route.abort('failed')
        return
      }
      await route.fulfill({ status: 503, body: 'unavailable' })
    })
    await page.goto('/en/mc', { waitUntil: 'networkidle' })

    const status = page.locator('.mc-server-status')
    await expect(status).toHaveAttribute('data-state', 'unknown')
    await expect(status).toContainText('Status unavailable')
    await expect(status).not.toContainText('Offline')
    await page.unroute(mcStatusRoute)
  }
})

test('invalid status responses are unavailable rather than zero or offline', async ({ page }) => {
  for (const body of [
    { status: 'error', online: false },
    { status: 'success', online: true, players: { now: 'not-a-number' } },
  ]) {
    await mockMinecraftStatus(page, body)
    await page.goto('/en/mc', { waitUntil: 'networkidle' })

    const status = page.locator('.mc-server-status')
    await expect(status).toHaveAttribute('data-state', 'unknown')
    await expect(status).toContainText('Status unavailable')
    await expect(status).not.toContainText(/0 players|Offline/)
    await page.unroute(mcStatusRoute)
  }
})

test('loading state is stable while the initial request is pending', async ({ page }) => {
  let requestCount = 0
  let releaseRequest
  const requestGate = new Promise(resolve => (releaseRequest = resolve))
  await page.route(mcStatusRoute, async (route) => {
    requestCount += 1
    await requestGate
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(defaultStatus),
    })
  })

  await page.goto('/en/mc', { waitUntil: 'domcontentloaded' })
  await expect.poll(() => requestCount).toBe(1)
  const status = page.locator('.mc-server-status')
  await expect(status).toHaveAttribute('data-state', 'loading')
  await expect(status).toContainText('Checking status')

  releaseRequest()
  await expect(status).toHaveAttribute('data-state', 'online')
})
