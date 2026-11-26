import { expect, test } from '@playwright/test'

const languages = { zh: 'zh-CN', en: 'en-US' }
const suffix = '?ref=home&tag=a&tag=b#main-content'

async function expectHome(page, locale) {
  await expect(page.locator('html')).toHaveAttribute('lang', languages[locale])
  await expect(page.locator('.hero-section h1')).toHaveText('Wolfx Project')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://wolfx.jp/${locale}`)
  for (const [language, path] of [['ja', '/'], ['zh-CN', '/zh'], ['en', '/en'], ['x-default', '/']])
    await expect(page.locator(`link[rel="alternate"][hreflang="${language}"]`)).toHaveAttribute('href', `https://wolfx.jp${path}`)
}

test('localized home survives direct entry, reload, language switching and history', async ({ page, baseURL }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' || /hydration|\[Vue warn\]/i.test(message.text()))
      problems.push(`${message.location().url} ${message.text()}`)
  })
  page.on('response', (response) => {
    if (response.url().startsWith(baseURL) && response.status() >= 400)
      problems.push(`${response.status()} ${response.url()}`)
  })
  const language = page.locator('.language-select select')
  const url = locale => new URL(`/${locale}${suffix}`, baseURL).href
  const preloaded = page.waitForResponse(response => new URL(response.url()).pathname === '/zh/_payload.json')
  for (const locale of Object.keys(languages)) {
    const response = await page.goto(`/${locale}/${suffix}`, { waitUntil: 'networkidle' })
    expect(response.status()).toBe(200)
    await expectHome(page, locale)
    await expect(language).toBeEnabled()
    await expect(page).toHaveURL(url(locale))
    if (locale === 'zh') {
      const payload = await preloaded
      const { pathname, search } = new URL(payload.url())
      expect(payload.status()).toBe(200)
      await expect(page.locator(`link[rel="preload"][href="${pathname}${search}"]`)).toHaveAttribute('as', 'fetch')
    }
    const reload = await page.reload({ waitUntil: 'networkidle' })
    expect([200, 304]).toContain(reload.status())
    if (reload.status() === 304) {
      const original = await response.allHeaders()
      expect(original.etag || original['last-modified']).toBeTruthy()
    }
    await expect(language).toBeEnabled()
    await expectHome(page, locale)
    await expect(page).toHaveURL(url(locale))

    // Playwright disables the browser's HTTP cache while request routing is active.
    await page.context().route('**/*', route => route.continue())
    const uncached = await page.reload({ waitUntil: 'networkidle' })
    expect(uncached.status()).toBe(200)
    await expectHome(page, locale)
    await expect(page).toHaveURL(url(locale))
    await page.context().unroute('**/*')
  }

  let documents = 0
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.resourceType() === 'document')
      documents++
  })
  await language.selectOption('zh')
  await expect(page).toHaveURL(url('zh'))
  await expectHome(page, 'zh')
  await page.goBack()
  await expect(page).toHaveURL(url('en'))
  await expectHome(page, 'en')
  await page.goForward()
  await expect(page).toHaveURL(url('zh'))
  await expectHome(page, 'zh')
  expect(documents).toBe(0)
  expect(problems).toEqual([])
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('localized home HTML and language links work before hydration', async ({ page }) => {
    for (const locale of Object.keys(languages)) {
      expect((await page.goto(`/${locale}/${suffix}`)).status()).toBe(200)
      await expectHome(page, locale)
      expect(new URL(page.url()).search + new URL(page.url()).hash).toBe(suffix)
      const other = locale === 'zh' ? 'en' : 'zh'
      const link = page.locator(`.language-links a[hreflang="${languages[other]}"]`)
      await expect(link).toHaveAttribute('href', `/${other}`)
      await link.click()
      await expectHome(page, other)
    }
  })
})
