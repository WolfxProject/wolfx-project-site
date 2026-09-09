import { expect, test } from '@playwright/test'

async function configureLocale(page, { languages, language, storedLocale }) {
  await page.addInitScript(({ languages, language, storedLocale }) => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => languages,
    })
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      get: () => language,
    })
    if (sessionStorage.getItem('__locale-test-initialized') === null) {
      if (storedLocale === null)
        localStorage.removeItem('wolfx-locale')
      else
        localStorage.setItem('wolfx-locale', storedLocale)
      sessionStorage.setItem('__locale-test-initialized', 'true')
    }
  }, { languages, language, storedLocale })
}

async function expectStablePath(page, path) {
  const normalizePath = value => value === '/' ? value : value.replace(/\/$/, '')
  await expect.poll(() => normalizePath(new URL(page.url()).pathname)).toBe(normalizePath(path))
  await page.waitForTimeout(100)
  expect(normalizePath(new URL(page.url()).pathname)).toBe(normalizePath(path))
}

const mainSiteCases = [
  {
    name: 'Japanese browser keeps the unprefixed home page',
    languages: ['ja-JP'],
    language: 'ja-JP',
    storedLocale: null,
    route: '/',
    expected: '/',
  },
  {
    name: 'Chinese browser selects the Chinese home page',
    languages: ['zh-CN'],
    language: 'zh-CN',
    storedLocale: null,
    route: '/',
    expected: '/zh/',
  },
  {
    name: 'English browser selects the English home page',
    languages: ['en-US'],
    language: 'en-US',
    storedLocale: null,
    route: '/',
    expected: '/en/',
  },
  {
    name: 'navigator.languages uses the first supported language',
    languages: ['fr-FR', 'zh-CN', 'en-US'],
    language: 'fr-FR',
    storedLocale: null,
    route: '/',
    expected: '/zh/',
  },
  {
    name: 'navigator.languages can fall through to English',
    languages: ['fr-FR', 'en-US'],
    language: 'fr-FR',
    storedLocale: null,
    route: '/',
    expected: '/en/',
  },
  {
    name: 'unsupported browser languages fall back to Japanese',
    languages: ['ko-KR'],
    language: 'en-US',
    storedLocale: null,
    route: '/',
    expected: '/',
  },
  {
    name: 'navigator.language is used when navigator.languages is empty',
    languages: [],
    language: 'zh-SG',
    storedLocale: null,
    route: '/',
    expected: '/zh/',
  },
  {
    name: 'stored English overrides a Chinese browser',
    languages: ['zh-CN'],
    language: 'zh-CN',
    storedLocale: 'en',
    route: '/',
    expected: '/en/',
  },
  {
    name: 'stored Chinese localizes an unprefixed content route',
    languages: ['ja-JP'],
    language: 'ja-JP',
    storedLocale: 'zh',
    route: '/projects',
    expected: '/zh/projects',
  },
  {
    name: 'stored Japanese keeps an unprefixed content route',
    languages: ['zh-CN'],
    language: 'zh-CN',
    storedLocale: 'ja',
    route: '/projects',
    expected: '/projects',
  },
  {
    name: 'an explicit Chinese URL is not overridden',
    languages: ['ja-JP'],
    language: 'ja-JP',
    storedLocale: 'en',
    route: '/zh/projects',
    expected: '/zh/projects',
  },
  {
    name: 'an invalid stored locale falls back to browser detection',
    languages: ['zh-Hans-CN'],
    language: 'zh-Hans-CN',
    storedLocale: 'abc',
    route: '/',
    expected: '/zh/',
  },
]

for (const scenario of mainSiteCases) {
  test(scenario.name, async ({ page }) => {
    const problems = []
    page.on('console', (message) => {
      if (message.type() === 'error' || /hydration|\[Vue warn\]|unhandled/i.test(message.text()))
        problems.push(message.text())
    })
    page.on('pageerror', error => problems.push(error.message))
    await configureLocale(page, scenario)
    await page.goto(scenario.route, { waitUntil: 'domcontentloaded' })
    expect(await page.evaluate(() => ({
      languages: navigator.languages,
      language: navigator.language,
      storedLocale: localStorage.getItem('wolfx-locale'),
    }))).toEqual({
      languages: scenario.languages,
      language: scenario.language,
      storedLocale: scenario.storedLocale,
    })
    await expectStablePath(page, scenario.expected)
    expect(problems).toEqual([])
    if (scenario.storedLocale === null)
      expect(await page.evaluate(() => localStorage.getItem('wolfx-locale'))).toBeNull()
  })
}

const wolfxMcCases = [
  { name: 'Chinese browser keeps unprefixed WolfxMC', languages: ['zh-CN'], language: 'zh-CN', storedLocale: null, route: '/mc', expected: '/mc' },
  { name: 'Japanese browser localizes WolfxMC', languages: ['ja-JP'], language: 'ja-JP', storedLocale: null, route: '/mc', expected: '/ja/mc' },
  { name: 'English browser localizes WolfxMC', languages: ['en-US'], language: 'en-US', storedLocale: null, route: '/mc', expected: '/en/mc' },
  { name: 'stored English localizes a WolfxMC child route', languages: ['zh-CN'], language: 'zh-CN', storedLocale: 'en', route: '/mc/rules', expected: '/en/mc/rules' },
  { name: 'stored Japanese localizes WolfxMC', languages: ['zh-CN'], language: 'zh-CN', storedLocale: 'ja', route: '/mc', expected: '/ja/mc' },
  { name: 'stored Chinese keeps unprefixed WolfxMC', languages: ['en-US'], language: 'en-US', storedLocale: 'zh', route: '/mc', expected: '/mc' },
  { name: 'an explicit WolfxMC locale is not overridden', languages: ['zh-CN'], language: 'zh-CN', storedLocale: 'en', route: '/ja/mc', expected: '/ja/mc' },
]

for (const scenario of wolfxMcCases) {
  test(scenario.name, async ({ page }) => {
    await configureLocale(page, scenario)
    await page.goto(scenario.route, { waitUntil: 'domcontentloaded' })
    await expectStablePath(page, scenario.expected)
  })
}

test('automatic redirects preserve query and hash without persisting browser detection', async ({ page }) => {
  await configureLocale(page, {
    languages: ['en-GB'],
    language: 'en-GB',
    storedLocale: null,
  })
  await page.goto('/projects?foo=1#bar', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/en\/projects\/?\?foo=1#bar$/)
  expect(await page.evaluate(() => localStorage.getItem('wolfx-locale'))).toBeNull()
})

test('unavailable locale storage does not prevent browser detection', async ({ page }) => {
  await configureLocale(page, {
    languages: ['en-US'],
    language: 'en-US',
    storedLocale: null,
  })
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem
    Storage.prototype.getItem = function (key) {
      if (key === 'wolfx-locale')
        throw new DOMException('Storage unavailable', 'SecurityError')
      return getItem.call(this, key)
    }
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expectStablePath(page, '/en/')
})

test('manual choices persist, preserve location details, and control later entries', async ({ page }) => {
  await configureLocale(page, {
    languages: ['zh-CN'],
    language: 'zh-CN',
    storedLocale: null,
  })
  await page.goto('/zh/projects?foo=1#bar', { waitUntil: 'networkidle' })
  const language = page.locator('.language-select select')

  await language.selectOption('en')
  await expect(page).toHaveURL(/\/en\/projects\/?\?foo=1#bar$/)
  expect(await page.evaluate(() => localStorage.getItem('wolfx-locale'))).toBe('en')

  await page.goto('/projects?again=1', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/en\/projects\/?\?again=1$/)

  await language.selectOption('zh')
  await expect(page).toHaveURL(/\/zh\/projects\/?\?again=1$/)
  expect(await page.evaluate(() => localStorage.getItem('wolfx-locale'))).toBe('zh')

  await page.goto('/projects', { waitUntil: 'domcontentloaded' })
  await expectStablePath(page, '/zh/projects')

  await language.selectOption('ja')
  await expectStablePath(page, '/projects')
  expect(await page.evaluate(() => localStorage.getItem('wolfx-locale'))).toBe('ja')
})
