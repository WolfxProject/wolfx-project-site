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
        expect(geometry.controls, `${viewport.name} ${route}: five header controls`).toHaveLength(5)
        expect(geometry.desktopNavVisible, `${viewport.name} ${route}: desktop navigation`).toBeFalsy()
        expect(geometry.menuVisible, `${viewport.name} ${route}: menu button`).toBeTruthy()
      }
      else {
        expect(geometry.desktopNavVisible, `${viewport.name} ${route}: desktop navigation`).toBeTruthy()
        expect(geometry.menuVisible, `${viewport.name} ${route}: menu button`).toBeFalsy()
      }
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
  await expect(page.locator('html')).toHaveClass(/has-modal-open/)
  const menuBox = await menu.boundingBox()
  const menuPanelBox = await menu.locator('.mobile-navigation__panel').boundingBox()
  expect(menuBox).toMatchObject({ x: 0, y: 0, width: 390, height: 844 })
  expect(menuPanelBox.y).toBeGreaterThanOrEqual(0)
  expect(menuPanelBox.x + menuPanelBox.width).toBeLessThanOrEqual(390)
  expect(menuPanelBox.y + menuPanelBox.height).toBeLessThanOrEqual(844)
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(menuButton).toBeFocused()
  await expect(page.locator('html')).not.toHaveClass(/has-modal-open/)

  const searchButton = page.locator('.search-trigger')
  await searchButton.click()
  const search = page.locator('.search-dialog')
  const searchPanel = search.locator('.search-panel')
  await expect(search.locator('input')).toBeFocused()
  await expect(page.locator('html')).toHaveClass(/has-modal-open/)
  const searchBox = await searchPanel.boundingBox()
  expect(searchBox.y).toBeGreaterThanOrEqual(0)
  expect(searchBox.x).toBeGreaterThanOrEqual(0)
  expect(searchBox.x + searchBox.width).toBeLessThanOrEqual(390)
  expect(searchBox.y + searchBox.height).toBeLessThanOrEqual(844)
  expect(await search.locator('input').evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16)
  await search.getByRole('button').click()
  await expect(searchButton).toBeFocused()
  await expect(page.locator('html')).not.toHaveClass(/has-modal-open/)
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
      const header = element.querySelector('.code-block__header').getBoundingClientRect()
      return {
        width: element.getBoundingClientRect().width,
        preOverflow: getComputedStyle(pre).overflowX,
        preClientWidth: pre.clientWidth,
        preScrollWidth: pre.scrollWidth,
        copyBottom: copy.bottom,
        headerBottom: header.bottom,
      }
    })
    expect(metrics.width).toBeLessThanOrEqual(358)
    expect(metrics.preOverflow).toBe('auto')
    expect(metrics.preScrollWidth).toBeGreaterThanOrEqual(metrics.preClientWidth)
    expect(metrics.copyBottom).toBeLessThanOrEqual(metrics.headerBottom + 1)
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

  const firstAnchor = page.locator('.anchored-heading > a').first()
  await firstAnchor.click()
  const anchorGeometry = await firstAnchor.locator('..').evaluate(element => ({
    top: element.getBoundingClientRect().top,
    headerBottom: document.querySelector('.site-header').getBoundingClientRect().bottom,
  }))
  expect(anchorGeometry.top).toBeGreaterThanOrEqual(anchorGeometry.headerBottom)

  await page.evaluate(() => window.scrollTo(0, 1200))
  const backToTop = page.locator('.back-to-top')
  await expect(backToTop).toBeVisible()
  const floatingBox = await backToTop.boundingBox()
  expect(floatingBox.x).toBeGreaterThanOrEqual(0)
  expect(floatingBox.x + floatingBox.width).toBeLessThanOrEqual(390)
  expect(floatingBox.y + floatingBox.height).toBeLessThanOrEqual(844)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect(backToTop).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
})

test('404 and missing routes preserve mobile-safe layout', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  for (const route of ['/404.html', '/this-route-does-not-exist']) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect([200, 404]).toContain(response?.status())
    await expect(page.locator('h1')).toHaveCount(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), route).toBeLessThanOrEqual(1)
  }
})
