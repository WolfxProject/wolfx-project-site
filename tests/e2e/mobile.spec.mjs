import { expect, test } from '@playwright/test'

const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+Xw0YAAAAAElFTkSuQmCC', 'base64')

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

const viewportMatrix = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 13/14', width: 390, height: 844 },
  { name: 'iPhone 15 Pro Max', width: 430, height: 932 },
  { name: 'iPhone landscape', width: 844, height: 390 },
  { name: 'iPad mini', width: 768, height: 1024 },
  { name: 'iPad Air', width: 820, height: 1180 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'iPad landscape', width: 1180, height: 820 },
  { name: 'Desktop', width: 1366, height: 768 },
  { name: 'Wide Desktop', width: 1920, height: 1080 },
]

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('wolfx-locale', 'ja'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('https://api.wolfx.jp/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/ws_clients.json') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' },
        body: JSON.stringify({ client_counts: 1234, update_at: '2026-08-04 21:30:00' }),
      })
      return
    }
    await route.fulfill({ status: 200, contentType: 'image/png', body: transparentPng })
  })
})

function overlap(first, second) {
  return Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left))
    * Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top))
}

test('all 24 content pages keep the mobile document flow inside the viewport', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 390, height: 844 })

  for (const route of allContentRoutes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response?.ok(), route).toBeTruthy()
    await expect(page.locator('h1'), `${route}: h1 count`).toHaveCount(1)

    const geometry = await page.evaluate(() => {
      const root = document.documentElement
      const header = document.querySelector('.site-header')?.getBoundingClientRect()
      const h1 = document.querySelector('h1')?.getBoundingClientRect()
      const main = document.querySelector('main')?.getBoundingClientRect()
      const footer = document.querySelector('.site-footer')?.getBoundingClientRect()
      return {
        overflow: root.scrollWidth - root.clientWidth,
        headerBottom: header?.bottom ?? 0,
        h1Top: h1?.top ?? 0,
        h1Left: h1?.left ?? 0,
        h1Right: h1?.right ?? root.clientWidth,
        mainBottom: main?.bottom ?? 0,
        footerTop: footer?.top ?? Number.POSITIVE_INFINITY,
      }
    })

    expect(geometry.overflow, `${route}: page overflow`).toBeLessThanOrEqual(1)
    expect(geometry.h1Top, `${route}: header overlap`).toBeGreaterThanOrEqual(geometry.headerBottom)
    expect(geometry.h1Left, `${route}: h1 left edge`).toBeGreaterThanOrEqual(8)
    expect(geometry.h1Right, `${route}: h1 right edge`).toBeLessThanOrEqual(382)
    expect(geometry.mainBottom, `${route}: footer overlap`).toBeLessThanOrEqual(geometry.footerTop + 1)
    // Finish hydrating this document before navigating away from its static directory URL.
    await expect(page.locator('.language-select select'), route).toBeEnabled()
  }
})

test('header, hero, and breakpoint geometry stay stable across the device matrix', async ({ page }) => {
  test.setTimeout(120_000)

  for (const viewport of viewportMatrix) {
    await page.setViewportSize(viewport)
    for (const route of ['/', '/zh/', '/en/']) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      const geometry = await page.evaluate(() => {
        const rect = element => element.getBoundingClientRect().toJSON()
        const root = document.documentElement
        const header = document.querySelector('.site-header')
        const inner = document.querySelector('.site-header__inner')
        const brand = document.querySelector('.brand')
        const actions = [...document.querySelectorAll('.header-actions > button, .header-actions > label')]
          .filter(element => getComputedStyle(element).display !== 'none')
        const controls = [brand, ...actions].map(rect)
        const icons = actions.flatMap(element => [...element.querySelectorAll('.iconify')]).map((element) => {
          const style = getComputedStyle(element)
          const box = element.getBoundingClientRect()
          return { display: style.display, width: box.width, height: box.height, mask: style.maskImage }
        })
        const h1 = document.querySelector('.hero-section h1').getBoundingClientRect()
        const main = document.querySelector('main').getBoundingClientRect()
        const heroButtons = [...document.querySelectorAll('.hero-section__actions a')].map(rect)
        return {
          overflow: root.scrollWidth - root.clientWidth,
          headerOverflow: header.scrollWidth - header.clientWidth,
          inner: rect(inner),
          header: rect(header),
          main: main.toJSON(),
          controls,
          icons,
          h1: h1.toJSON(),
          heroCopy: rect(document.querySelector('.hero-section__copy')),
          heroWave: rect(document.querySelector('.hero-section__wave')),
          heroButtons,
          desktopNavVisible: getComputedStyle(document.querySelector('.desktop-nav')).display !== 'none',
          menuVisible: getComputedStyle(document.querySelector('.mobile-menu-button')).display !== 'none',
        }
      })

      expect(geometry.overflow, `${viewport.name} ${route}: page overflow`).toBeLessThanOrEqual(1)
      expect(geometry.headerOverflow, `${viewport.name} ${route}: header overflow`).toBeLessThanOrEqual(1)
      expect(geometry.main.top, `${viewport.name} ${route}: document flow`).toBeGreaterThanOrEqual(geometry.header.bottom - 1)
      expect(geometry.h1.left, `${viewport.name} ${route}: h1 left`).toBeGreaterThanOrEqual(0)
      expect(geometry.h1.right, `${viewport.name} ${route}: h1 right`).toBeLessThanOrEqual(viewport.width)
      expect(geometry.icons.every(icon => icon.display !== 'none' && icon.width > 0 && icon.height > 0 && icon.mask !== 'none'), `${viewport.name} ${route}: visible icons`).toBeTruthy()
      expect(geometry.controls.every(control => control.left >= 0 && control.right <= viewport.width), `${viewport.name} ${route}: controls in viewport`).toBeTruthy()
      expect(geometry.controls.every(control => control.width >= 44 && control.height >= 44), `${viewport.name} ${route}: touch targets`).toBeTruthy()
      for (let index = 0; index < geometry.controls.length; index++) {
        for (let other = index + 1; other < geometry.controls.length; other++)
          expect(overlap(geometry.controls[index], geometry.controls[other]), `${viewport.name} ${route}: control overlap`).toBe(0)
      }
      expect(geometry.heroButtons.every(button => button.left >= 0 && button.right <= viewport.width), `${viewport.name} ${route}: hero actions`).toBeTruthy()

      if (viewport.width <= 1000) {
        expect(geometry.heroWave.width, `${viewport.name} ${route}: hidden decorative wave`).toBe(0)
        expect(geometry.controls, `${viewport.name} ${route}: five header controls`).toHaveLength(5)
        expect(geometry.desktopNavVisible, `${viewport.name} ${route}: desktop navigation`).toBeFalsy()
        expect(geometry.menuVisible, `${viewport.name} ${route}: menu button`).toBeTruthy()
      }
      else {
        expect(geometry.heroWave.width, `${viewport.name} ${route}: visible decorative wave`).toBeGreaterThan(0)
        expect(geometry.heroWave.left, `${viewport.name} ${route}: wave clear of hero copy`).toBeGreaterThan(geometry.heroCopy.right)
        expect(geometry.heroWave.right, `${viewport.name} ${route}: wave in viewport`).toBeLessThanOrEqual(viewport.width)
        expect(geometry.desktopNavVisible, `${viewport.name} ${route}: desktop navigation`).toBeTruthy()
        expect(geometry.menuVisible, `${viewport.name} ${route}: menu button`).toBeFalsy()
      }

      // Measure the static layout first, then let the router finish mounting before the next visit.
      await expect(page.locator('.language-select select'), `${viewport.name} ${route}`).toBeEnabled()
    }
  }
})

test('mobile navigation and search trap interaction inside the visual viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/open-api', { waitUntil: 'networkidle' })

  const menuButton = page.locator('.mobile-menu-button')
  await menuButton.click()
  const menu = page.locator('.mobile-navigation')
  await expect(menu).toBeVisible()
  await expect(menu.locator('[data-mobile-nav-close]')).toBeFocused()
  await page.keyboard.press('/')
  await expect(page.locator('dialog[open]')).toHaveCount(1)
  await expect(page.locator('.search-dialog')).toBeHidden()
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
  const menuBox = await menu.boundingBox()
  const menuPanelBox = await menu.locator('.mobile-navigation__panel').boundingBox()
  expect(menuBox).toMatchObject({ x: 0, y: 0, width: 390, height: 844 })
  expect(menuPanelBox.y).toBeGreaterThanOrEqual(0)
  expect(menuPanelBox.x + menuPanelBox.width).toBeLessThanOrEqual(390)
  expect(menuPanelBox.y + menuPanelBox.height).toBeLessThanOrEqual(844)
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(menuButton).toBeFocused()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')

  const searchButton = page.locator('.search-trigger')
  await searchButton.click()
  const search = page.locator('.search-dialog')
  const searchPanel = search.locator('.search-panel')
  await expect(search.locator('input')).toBeFocused()
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
  const searchBox = await searchPanel.boundingBox()
  expect(searchBox.y).toBeGreaterThanOrEqual(0)
  expect(searchBox.x).toBeGreaterThanOrEqual(0)
  expect(searchBox.x + searchBox.width).toBeLessThanOrEqual(390)
  expect(searchBox.y + searchBox.height).toBeLessThanOrEqual(844)
  expect(await search.locator('input').evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16)
  await search.getByRole('button').click()
  await expect(searchButton).toBeFocused()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
})

test('tables, code, endpoints, anchors, and floating controls contain their own overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/open-api', { waitUntil: 'networkidle' })

  const tables = page.locator('.table-scroll')
  expect(await tables.count()).toBeGreaterThan(0)
  for (let index = 0; index < await tables.count(); index++) {
    const table = tables.nth(index)
    const metrics = await table.evaluate(element => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      overflowX: getComputedStyle(element).overflowX,
    }))
    expect(metrics.overflowX).toBe('auto')
    expect(metrics.scrollWidth).toBeGreaterThanOrEqual(metrics.clientWidth)
    await table.evaluate(element => element.scrollLeft = element.scrollWidth)
    await expect(table.locator('xpath=..')).toHaveClass(/table-frame--end/)
    const rightEdge = await table.evaluate(element => ({
      container: element.getBoundingClientRect().right,
      table: element.querySelector('table').getBoundingClientRect().right,
    }))
    expect(Math.abs(rightEdge.container - rightEdge.table)).toBeLessThanOrEqual(2)
  }

  const codeBlocks = page.locator('.code-block')
  for (let index = 0; index < await codeBlocks.count(); index++) {
    const block = codeBlocks.nth(index)
    const metrics = await block.evaluate((element) => {
      const pre = element.querySelector('pre')
      const copy = element.querySelector('.copy-button').getBoundingClientRect()
      const header = element.querySelector('.code-block__header')?.getBoundingClientRect()
      return {
        width: element.getBoundingClientRect().width,
        preOverflow: getComputedStyle(pre).overflowX,
        preClientWidth: pre.clientWidth,
        preScrollWidth: pre.scrollWidth,
        copyBottom: copy.bottom,
        headerBottom: header?.bottom,
        copyLeft: copy.left,
        preRight: pre.getBoundingClientRect().right,
      }
    })
    expect(metrics.width).toBeLessThanOrEqual(358)
    expect(metrics.preOverflow).toBe('auto')
    expect(metrics.preScrollWidth).toBeGreaterThanOrEqual(metrics.preClientWidth)
    if (metrics.headerBottom !== undefined)
      expect(metrics.copyBottom).toBeLessThanOrEqual(metrics.headerBottom + 1)
    else
      expect(metrics.copyLeft).toBeGreaterThanOrEqual(metrics.preRight - 1)
  }

  const endpoint = page.locator('.api-endpoint code').first()
  if (await endpoint.count()) {
    const endpointStyle = await endpoint.evaluate((element) => {
      const style = getComputedStyle(element)
      return { whiteSpace: style.whiteSpace, overflow: style.overflow, textOverflow: style.textOverflow }
    })
    expect(endpointStyle.whiteSpace).not.toBe('nowrap')
    expect(endpointStyle.textOverflow).not.toBe('ellipsis')
  }

  await page.evaluate(() => window.scrollTo(0, 1200))
  const backToTop = page.locator('.back-to-top')
  await expect(backToTop).toBeVisible()
  const floatingBox = await backToTop.boundingBox()
  expect(floatingBox.x).toBeGreaterThanOrEqual(0)
  expect(floatingBox.x + floatingBox.width).toBeLessThanOrEqual(390)
  expect(floatingBox.y + floatingBox.height).toBeLessThanOrEqual(844)
  await backToTop.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect(backToTop).toBeHidden()

  const firstAnchor = page.locator('.anchored-heading > a').first()
  await firstAnchor.click()
  const fragment = await firstAnchor.getAttribute('href')
  await expect.poll(() => decodeURIComponent(new URL(page.url()).hash)).toBe(fragment)
  await expect.poll(() => firstAnchor.locator('..').evaluate((heading) => {
    const target = heading.getBoundingClientRect()
    const header = document.querySelector('.site-header').getBoundingClientRect()
    return target.top >= header.bottom && target.bottom <= innerHeight
  })).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
})

test('404 and missing routes preserve mobile-safe layout', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  for (const route of ['/404.html', '/this-route-does-not-exist']) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    if (route === '/404.html')
      expect([200, 404]).toContain(response?.status())
    else
      expect(response?.status()).toBe(404)
    await expect(page.locator('h1')).toHaveCount(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), route).toBeLessThanOrEqual(1)
  }
})

test('keyboard readers can skip navigation and open a mobile table of contents', async ({ page }) => {
  await page.goto('/en/docs/seisjs-api', { waitUntil: 'networkidle' })
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to main content' })
  await expect(skip).toBeFocused()
  await skip.press('Enter')
  await expect(page.locator('main')).toBeFocused()

  for (const path of ['/en/docs/seisjs-api', '/en/legal/privacy']) {
    await page.goto(path, { waitUntil: 'networkidle' })
    const toc = page.getByRole('navigation', { name: 'On this page', exact: true })
    const links = toc.locator('a')
    await expect(links.first()).toBeHidden()
    await toc.locator('summary').click()
    const fragment = await links.last().getAttribute('href')
    await links.last().click()
    expect(decodeURIComponent(new URL(page.url()).hash)).toBe(fragment)
    await expect.poll(() => page.evaluate((id) => {
      const heading = document.getElementById(id)?.getBoundingClientRect()
      return heading && heading.top >= 0 && heading.top < innerHeight
    }, fragment.slice(1))).toBeTruthy()
  }
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the static 404 links to each localized home page', async ({ page }) => {
    for (const [language, home] of [['ja-JP', '/'], ['zh-CN', '/zh/'], ['en-US', '/en/']]) {
      await page.goto('/404.html')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('404')
      const section = page.locator(`main section[lang="${language}"]`)
      await expect(section.getByRole('heading')).toBeVisible()
      const link = section.getByRole('link')
      await expect(link).toHaveAttribute('href', home)
      await link.click()
      await expect(page.locator('html')).toHaveAttribute('lang', language)
    }
  })

  test('mobile visitors can read, change language, and follow ordinary navigation', async ({ page }) => {
    await page.goto('/mc')
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
    await expect(page.locator('.mc-server-status')).toBeHidden()
    await expect(page.locator('.mc-hero .static-status')).toContainText('JavaScript')
    await expect(page.locator('.mc-hero .static-status')).toBeVisible()
    await page.locator('.language-links a[hreflang="en-US"]').click()
    await expect(page).toHaveURL(/\/en\/mc\/?$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    const docs = page.locator('.desktop-nav a[href="/en/docs/open-api"]')
    await expect(docs).toBeVisible()
    await docs.click()
    await expect(page.locator('.api-status-panel .static-status')).toBeVisible()
    await expect(page.locator('.api-status-panel__summary')).toBeHidden()
    await page.locator('.docs-toc--compact summary').click()
    await expect(page.locator('.docs-toc--compact a').first()).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  })
})
