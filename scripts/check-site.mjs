import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

const localLucideIcons = require('@iconify-json/lucide/icons.json').icons

const outputRoot = path.join(root, '.output/public')
const locales = [
  { locale: 'ja', prefix: '', htmlLang: 'ja-JP' },
  { locale: 'zh', prefix: 'zh', htmlLang: 'zh-CN' },
  { locale: 'en', prefix: 'en', htmlLang: 'en-US' },
]
const routePages = [
  { file: 'index.md', route: '', layout: 'landing' },
  { file: 'projects.md', route: 'projects', layout: 'landing' },
  { file: 'donate.md', route: 'donate', layout: 'landing' },
  { file: 'docs/open-api.md', route: 'docs/open-api', layout: 'docs' },
  { file: 'docs/websocket.md', route: 'docs/websocket', layout: 'docs' },
  { file: 'docs/seisjs-api.md', route: 'docs/seisjs-api', layout: 'docs' },
  { file: 'legal/privacy.md', route: 'legal/privacy', layout: 'legal' },
  { file: 'legal/terms.md', route: 'legal/terms', layout: 'legal' },
]
const requiredEndpoints = [
  'https://api.wolfx.jp/jma_eew.json',
  'wss://ws-api.wolfx.jp/jma_eew',
  'wss://ws-api.wolfx.jp/all_eew',
  'https://api.wolfx.jp/seis_list.json',
  'wss://seisjs.wolfx.jp/all_seis',
]
const apiStatusResources = [
  'https://api.wolfx.jp/ws_clients.json',
  'https://api.wolfx.jp/status/nginx_request-day.png',
  'https://api.wolfx.jp/status/nginx_request-week.png',
  'https://api.wolfx.jp/status/if_eth0-day.png',
  'https://api.wolfx.jp/status/if_eth0-week.png',
]
const apiStatusPages = {
  ja: { heading: '## API ステータス', invocation: '::api-status-panel{locale="ja"}' },
  zh: { heading: '## API 状态', invocation: '::api-status-panel{locale="zh"}' },
  en: { heading: '## API Status', invocation: '::api-status-panel{locale="en"}' },
}
const failures = []
const donationValues = {
  bitcoinSegwit: 'bc1qqrlqfhf3enhjexf5hl068el0rctv07zupcld23',
  bitcoinTaproot: 'bc1pf47954hraeuyg6k088rt9wy9u49jjvpz70luw4ythamtd5l7dhxqzf70z5',
  ethereum: '0x5f72A4a28D765E53e6F2a2C69a7CBD83172df2AA',
  afdian: 'https://ifdian.net/a/wolfx',
}

async function exists(file) {
  try {
    await fs.access(file)
    return true
  }
  catch {
    return false
  }
}

function fail(message) {
  failures.push(message)
}

async function sourceFiles(directory) {
  const excludedDirectories = new Set(['.git', '.nuxt', '.output', '.wrangler', 'node_modules', 'test-results'])
  const files = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name))
      continue
    const file = path.join(directory, entry.name)
    if (entry.isDirectory())
      files.push(...await sourceFiles(file))
    else if (entry.isFile() && /\.(?:vue|md|ts|mts|cts|js|mjs|cjs|json)$/.test(entry.name))
      files.push(file)
  }
  return files
}

function sourcePosition(text, offset) {
  const before = text.slice(0, offset)
  const line = (before.match(/\n/g) ?? []).length + 1
  const lastBreak = before.lastIndexOf('\n')
  return { line, column: offset - lastBreak }
}

for (const file of await sourceFiles(root)) {
  const source = await fs.readFile(file, 'utf8')
  const relative = path.relative(root, file)
  for (const match of source.matchAll(/\b(?:i-)?lucide(?::|-)([a-z0-9][a-z0-9-]*)\b/g)) {
    const name = match[1]
    if (localLucideIcons[name])
      continue
    const position = sourcePosition(source, match.index)
    fail(`${relative}:${position.line}:${position.column}: unknown local Lucide icon ${match[0]}`)
  }
  for (const match of source.matchAll(/(?:i-)?lucide(?::|-)\$\{/g)) {
    const position = sourcePosition(source, match.index)
    fail(`${relative}:${position.line}:${position.column}: dynamically constructed Lucide icon cannot be verified`)
  }
}

const mainStyles = await fs.readFile(path.join(root, 'app/assets/css/main.css'), 'utf8')
for (const token of [
  '--wolfx-site-max-width',
  '--wolfx-reading-max-width',
  '--wolfx-page-gutter',
  '--wolfx-display-title-size',
  '--wolfx-page-title-size',
  '--wolfx-section-title-size',
]) {
  if (!mainStyles.includes(`${token}:`))
    fail(`Shared layout token is missing from main.css: ${token}`)
}
for (const selector of [
  '.landing-layout .content-body > .donation-address',
  '.landing-layout .content-body > .donation-address + h2',
]) {
  if (mainStyles.includes(selector))
    fail(`main.css still relies on fragile generated Donate markup: ${selector}`)
}

function publicRoute(prefix, route) {
  return `/${[prefix, route].filter(Boolean).join('/')}`.replace(/\/$/, '') || '/'
}

function outputFileForRoute(route) {
  return route === '/'
    ? path.join(outputRoot, 'index.html')
    : path.join(outputRoot, route.slice(1), 'index.html')
}

function canonicalForRoute(route) {
  return route === '/zh' || route === '/en' ? `${route}/` : route
}

function extractAttribute(html, pattern) {
  return html.match(pattern)?.[1]
}

function tsString(value) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}'`
}

const markdownFiles = []
for (const locale of locales) {
  const docs = []
  for (const page of routePages) {
    const file = path.join(root, 'content', locale.locale, page.file)
    markdownFiles.push(file)
    if (!await exists(file)) {
      fail(`Missing content/${locale.locale}/${page.file}`)
      continue
    }
    if (page.layout === 'docs') {
      const markdown = await fs.readFile(file, 'utf8')
      docs.push(markdown)
      if (page.file === 'docs/open-api.md') {
        const expected = apiStatusPages[locale.locale]
        if (!markdown.includes(expected.heading))
          fail(`${locale.locale}: Open API is missing ${expected.heading}`)
        if (!markdown.includes(expected.invocation))
          fail(`${locale.locale}: Open API is missing ${expected.invocation}`)
        if (/<script\b/i.test(markdown))
          fail(`${locale.locale}: Open API contains an inline script`)
        if (/document\.getElementById/i.test(markdown))
          fail(`${locale.locale}: Open API contains legacy DOM manipulation`)
        if (/\bid\s*=\s*["'](?:client_counts|server-status|nginx-day|nginx-week|traffic-day|traffic-week|update_at)["']/i.test(markdown))
          fail(`${locale.locale}: Open API contains a legacy API Status ID`)
        if (/class\s*=\s*["'][^"']*\b(?:container-fluid|container|row|col-(?:sm|md|lg|xl)-\d+)\b/i.test(markdown))
          fail(`${locale.locale}: Open API contains copied Bootstrap status markup`)
      }
    }
    if (page.file === 'donate.md') {
      const markdown = await fs.readFile(file, 'utf8')
      for (const value of Object.values(donationValues)) {
        const occurrences = markdown.split(value).length - 1
        if (occurrences !== 1)
          fail(`${locale.locale}: donate page must contain ${value} exactly once (found ${occurrences})`)
      }
      if ((markdown.match(/::donation-address\{/g) ?? []).length !== 3)
        fail(`${locale.locale}: donate page must contain exactly three donation-address components`)
      if ((markdown.match(/::content-section\{width="reading"\}/g) ?? []).length !== 1)
        fail(`${locale.locale}: donate page must use exactly one explicit reading content section`)
      if (/<script\b|\balert\s*\(|\.copyable\b|\b(?:jquery|bootstrap)\b/i.test(markdown))
        fail(`${locale.locale}: donate page contains legacy script or framework markup`)
    }
  }
  const combined = docs.join('\n')
  for (const endpoint of requiredEndpoints) {
    if (!combined.includes(endpoint))
      fail(`${locale.locale}: missing API endpoint ${endpoint}`)
  }
}

const apiStatusComponentFile = path.join(root, 'app/components/content/ApiStatusPanel.vue')
if (!await exists(apiStatusComponentFile)) {
  fail('Missing app/components/content/ApiStatusPanel.vue')
}
else {
  const component = await fs.readFile(apiStatusComponentFile, 'utf8')
  for (const resource of apiStatusResources) {
    if (!component.includes(resource))
      fail(`API Status component is missing ${resource}`)
  }
  const discoveredStatusResources = [...component.matchAll(/https:\/\/api\.wolfx\.jp\/(?:ws_clients\.json|status\/[A-Za-z0-9_-]+\.png)/g)].map(match => match[0])
  for (const resource of discoveredStatusResources) {
    if (!apiStatusResources.includes(resource))
      fail(`API Status component contains an unexpected Wolfx status resource ${resource}`)
  }
  if (/localhost|127\.0\.0\.1:\d{2,5}|(?:CF_API_TOKEN|CLOUDFLARE_API_TOKEN|(?:^|[^A-Za-z])sk-[A-Za-z0-9_-]{20,})/i.test(component))
    fail('API Status component contains a local address, development port, or token pattern')
}

for (const file of markdownFiles) {
  if (!await exists(file))
    continue
  const markdown = await fs.readFile(file, 'utf8')
  for (const match of markdown.matchAll(/\[[^\]]*\]\((\/[^)]+)\)/g)) {
    const href = match[1].split('#')[0]
    if (!href || href.startsWith('/images'))
      continue
    const unprefixed = href.replace(/^\/(zh|en)(?=\/|$)/, '').replace(/^\//, '') || 'index'
    const targetLocale = href.startsWith('/zh') ? 'zh' : href.startsWith('/en') ? 'en' : 'ja'
    const target = path.join(root, 'content', targetLocale, `${unprefixed}.md`.replace('/index.md', '.md'))
    if (!await exists(target))
      fail(`${path.relative(root, file)}: unresolved internal link ${href}`)
  }
}

const redirectsSource = await fs.readFile(path.join(root, 'data/legacy-redirects.json'), 'utf8')
const redirects = JSON.parse(redirectsSource)
const redirectEntries = Object.entries(redirects)
const rawKeys = [...redirectsSource.matchAll(/^\s*"([^"]+)"\s*:/gm)].map(match => match[1])
if (rawKeys.length !== 32)
  fail(`Expected 32 legacy redirects, found ${rawKeys.length}`)
if (new Set(rawKeys).size !== rawKeys.length)
  fail('Duplicate legacy redirect source')

for (const [source, target] of redirectEntries) {
  if (!source.startsWith('/') || source.includes('?') || source.includes('#'))
    fail(`Invalid redirect source ${source}`)
  if (!target.startsWith('/') || target.startsWith('//') || target.includes('?') || target.includes('#'))
    fail(`Redirect target must be an internal absolute path: ${source} -> ${target}`)
  if (source === target)
    fail(`Redirect source equals target: ${source}`)
  if (redirects[target])
    fail(`Redirect chain detected: ${source} -> ${target} -> ${redirects[target]}`)
}
if (redirects['/donate.html'] !== '/donate')
  fail('Missing /donate.html -> /donate legacy redirect')

const nginxRedirects = await fs.readFile(path.join(root, 'deploy/nginx-redirects.conf'), 'utf8')
const workerRedirects = await fs.readFile(path.join(root, 'worker/generated-redirects.ts'), 'utf8')
if ((nginxRedirects.match(/^location = /gm) ?? []).length !== redirectEntries.length)
  fail('Nginx redirect count is out of sync with data/legacy-redirects.json')
if ((workerRedirects.match(/^ {2}'\//gm) ?? []).length !== redirectEntries.length)
  fail('Worker redirect count is out of sync with data/legacy-redirects.json')
for (const [source, target] of redirectEntries) {
  if (!nginxRedirects.includes(`location = ${source} {\n    return 301 ${target}$is_args$args;`))
    fail(`Nginx redirect mismatch: ${source} -> ${target}`)
  if (!workerRedirects.includes(`  ${tsString(source)}: ${tsString(target)},`))
    fail(`Worker redirect mismatch: ${source} -> ${target}`)
}

const sourceIndexFile = path.join(root, 'public/search-index.json')
if (!await exists(sourceIndexFile)) {
  fail('Missing public/search-index.json; run pnpm search:generate')
}
else {
  let index = []
  try {
    index = JSON.parse(await fs.readFile(sourceIndexFile, 'utf8'))
  }
  catch (error) {
    fail(`Invalid public/search-index.json: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (index.length !== 24)
    fail(`Expected 24 search entries, found ${index.length}`)
  const paths = new Set()
  for (const [position, entry] of index.entries()) {
    const label = `search entry ${position}`
    if (!entry || typeof entry !== 'object') {
      fail(`${label}: must be an object`)
      continue
    }
    for (const field of ['title', 'path', 'locale', 'text']) {
      if (typeof entry[field] !== 'string' || !entry[field].trim())
        fail(`${label}: missing non-empty ${field}`)
    }
    if (!['ja', 'zh', 'en'].includes(entry.locale))
      fail(`${label}: invalid locale ${entry.locale}`)
    if (!entry.path?.startsWith('/') || entry.path?.includes('.md'))
      fail(`${label}: invalid public path ${entry.path}`)
    if (paths.has(entry.path))
      fail(`${label}: duplicate path ${entry.path}`)
    paths.add(entry.path)
    if (/<[^>]+>|^---$|\n#{1,6}\s|```/.test(entry.text))
      fail(`${label}: text contains markup or frontmatter noise`)
    const expectedContent = entry.path === '/'
      ? path.join(root, 'content/ja/index.md')
      : path.join(root, 'content', entry.locale, `${entry.path.replace(/^\/(zh|en)(?=\/|$)/, '').replace(/^\//, '') || 'index'}.md`)
    if (!await exists(expectedContent))
      fail(`${label}: path does not resolve to content (${entry.path})`)
  }
  const searchCases = [
    ['ja', '緊急地震速報'],
    ['zh', '地震预警'],
    ['en', 'earthquake'],
  ]
  for (const [locale, term] of searchCases) {
    const found = index.some(entry => entry.locale === locale && `${entry.title} ${(entry.headings ?? []).join(' ')} ${entry.text}`.toLocaleLowerCase().includes(term.toLocaleLowerCase()))
    if (!found)
      fail(`Static search has no ${locale} result for ${term}`)
  }
  const donationSearchCases = [
    ['ja', '寄付', '/donate'],
    ['zh', '捐赠', '/zh/donate'],
    ['en', 'Donate', '/en/donate'],
  ]
  for (const [locale, term, expectedPath] of donationSearchCases) {
    const found = index.some(entry => entry.locale === locale
      && entry.path === expectedPath
      && `${entry.title} ${(entry.headings ?? []).join(' ')} ${entry.text}`.toLocaleLowerCase().includes(term.toLocaleLowerCase()))
    if (!found)
      fail(`Static search has no ${locale} result for ${term} at ${expectedPath}`)
  }
}

if (!await exists(outputRoot)) {
  fail('Missing .output/public; run pnpm generate')
}
else {
  const generatedPages = []
  for (const locale of locales) {
    for (const page of routePages) {
      const route = publicRoute(locale.prefix, page.route)
      const file = outputFileForRoute(route)
      generatedPages.push({ file, route, locale, layout: page.layout })
      if (!await exists(file)) {
        fail(`Missing generated route ${route}`)
        continue
      }
      const html = await fs.readFile(file, 'utf8')
      const canonicalPath = canonicalForRoute(route)
      if (!new RegExp(`<html[^>]+lang="${locale.htmlLang}"`).test(html))
        fail(`${route}: expected html lang ${locale.htmlLang}`)
      if (!html.includes(`<link rel="canonical" href="https://wolfx.jp${canonicalPath}"`))
        fail(`${route}: wrong canonical URL`)
      for (const hreflang of ['ja', 'zh-CN', 'en', 'x-default']) {
        if (!html.includes(`hreflang="${hreflang}"`))
          fail(`${route}: missing hreflang ${hreflang}`)
      }
      const description = extractAttribute(html, /<meta name="description" content="([^"]+)"/)
      if (!description?.trim())
        fail(`${route}: missing description`)
      for (const meta of ['property="og:title"', 'property="og:description"', 'property="og:url"', 'name="twitter:card"']) {
        if (!html.includes(`<meta ${meta}`))
          fail(`${route}: missing ${meta}`)
      }
      const title = extractAttribute(html, /<title>([^<]+)<\/title>/)
      if (!title?.trim())
        fail(`${route}: missing title`)
      if (/Wolfx Project\s*[·|—-]\s*Wolfx Project/i.test(title ?? ''))
        fail(`${route}: duplicated brand in title (${title})`)
      const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length
      if (h1Count !== 1)
        fail(`${route}: expected exactly one h1, found ${h1Count}`)
      if (!/class="[^"]*\bmarkdown-content\b[^"]*"/.test(html))
        fail(`${route}: generated content is missing the Markdown typography scope`)
      const tableCount = (html.match(/<table(?:\s|>)/g) ?? []).length
      const tableWrapperCount = (html.match(/class="[^"]*\btable-scroll\b[^"]*"/g) ?? []).length
      if (tableCount !== tableWrapperCount)
        fail(`${route}: expected each of ${tableCount} tables to have its own scroll wrapper, found ${tableWrapperCount}`)
      const hasTechArticle = html.includes('"@type":"TechArticle"')
      if (page.layout === 'docs' && !hasTechArticle)
        fail(`${route}: docs page is missing TechArticle JSON-LD`)
      if (page.file === 'docs/open-api.md' && !html.includes('data-api-status-panel'))
        fail(`${route}: generated Open API page is missing the API Status SSR container`)
      if (page.layout === 'legal' && hasTechArticle)
        fail(`${route}: legal page must not use TechArticle JSON-LD`)
      if (page.file === 'donate.md') {
        if (!html.includes('"@type":"WebPage"') || hasTechArticle)
          fail(`${route}: donate page must use WebPage JSON-LD`)
        for (const value of Object.values(donationValues)) {
          if (!html.includes(value))
            fail(`${route}: generated donate page is missing ${value}`)
        }
        if ((html.match(/data-donation-address/g) ?? []).length !== 3)
          fail(`${route}: generated donate page must contain three donation address blocks`)
        if (!/class="[^"]*\bcontent-section\b[^"]*\bcontent-prose\b[^"]*\bcontent-section--reading\b[^"]*\breading-container\b[^"]*"/.test(html))
          fail(`${route}: generated Donate body is missing its shared reading/prose wrapper`)
        if (!html.includes(`href="${donationValues.afdian}"`) || !html.includes('rel="noopener noreferrer"') || !html.includes('target="_blank"'))
          fail(`${route}: generated Afdian link is missing its exact URL or safe external-link attributes`)
      }
      else if (page.layout === 'landing' && !/("@type":"(?:WebSite|CollectionPage)")/.test(html)) {
        fail(`${route}: landing page has wrong JSON-LD type`)
      }
    }
  }

  for (const required of ['404.html', 'robots.txt', 'sitemap_index.xml', '__sitemap__/ja-JP.xml', '__sitemap__/zh-CN.xml', '__sitemap__/en-US.xml', 'search-index.json']) {
    if (!await exists(path.join(outputRoot, required)))
      fail(`Missing generated ${required}`)
  }
  if (await exists(path.join(outputRoot, 'api/search')))
    fail('Obsolete prerendered /api/search still exists')

  for (const [source, target] of redirectEntries) {
    const relative = source.slice(1)
    const file = source.endsWith('.html')
      ? path.join(outputRoot, relative)
      : path.join(outputRoot, relative, 'index.html')
    if (!await exists(file)) {
      fail(`Missing static redirect compatibility page ${source}`)
      continue
    }
    const html = await fs.readFile(file, 'utf8')
    if (!html.includes(`http-equiv="refresh" content="0; url=${target}"`))
      fail(`Static redirect mismatch: ${source} -> ${target}`)
    if (!await exists(outputFileForRoute(target)))
      fail(`Redirect target does not exist in output: ${source} -> ${target}`)
  }

  const assetsIgnoreFile = path.join(outputRoot, '.assetsignore')
  if (await exists(assetsIgnoreFile)) {
    const assetsIgnore = await fs.readFile(assetsIgnoreFile, 'utf8')
    for (const source of Object.keys(redirects)) {
      const expected = source.endsWith('.html') ? source.slice(1) : `${source.slice(1)}/**`
      if (!assetsIgnore.split('\n').includes(expected))
        fail(`Workers Assets exclusion missing for ${source}`)
    }
  }

  const sitemapFiles = ['sitemap_index.xml', '__sitemap__/ja-JP.xml', '__sitemap__/zh-CN.xml', '__sitemap__/en-US.xml']
  const sitemapText = (await Promise.all(sitemapFiles.map(file => fs.readFile(path.join(outputRoot, file), 'utf8')))).join('\n')
  for (const forbidden of [...Object.keys(redirects), '/api/search', '/search-index.json', '/404']) {
    if (sitemapText.includes(`https://wolfx.jp${forbidden}`))
      fail(`Sitemap contains forbidden route ${forbidden}`)
  }
  for (const locale of ['ja-JP', 'zh-CN', 'en-US']) {
    if (!sitemapText.includes(`/__sitemap__/${locale}.xml`) && !sitemapText.includes(`hreflang=`))
      fail(`Sitemap output does not include ${locale}`)
  }
  for (const route of ['/donate', '/zh/donate', '/en/donate']) {
    if (!sitemapText.includes(`https://wolfx.jp${route}`))
      fail(`Sitemap is missing ${route}`)
  }

  const robots = await fs.readFile(path.join(outputRoot, 'robots.txt'), 'utf8')
  if (!/^User-agent:\s*\*$/m.test(robots) || !/^Allow:\s*\/$/m.test(robots) || !robots.includes('https://wolfx.jp/sitemap_index.xml'))
    fail('robots.txt is missing crawler or sitemap directives')

  const forbiddenResourceHosts = /(?:fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net|googletagmanager\.com|google-analytics\.com)/i
  for (const { file, route } of generatedPages) {
    if (!await exists(file))
      continue
    const html = await fs.readFile(file, 'utf8')
    if (/<iframe\b/i.test(html))
      fail(`${route}: generated page contains an iframe`)
    for (const tag of html.matchAll(/<(?:script|link|img)\b[^>]*(?:src|href)="([^"]+)"[^>]*>/gi)) {
      if (forbiddenResourceHosts.test(tag[1]) || /(?:jquery|bootstrap)/i.test(tag[1]))
        fail(`${route}: forbidden third-party resource ${tag[1]}`)
    }
  }

  const outputFiles = []
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name)
      if (entry.isDirectory())
        await walk(file)
      else
        outputFiles.push(file)
    }
  }
  await walk(outputRoot)
  for (const file of outputFiles) {
    const relative = path.relative(outputRoot, file)
    if (file.endsWith('.md'))
      fail(`Generated output contains source Markdown: ${relative}`)
    if (!/\.(?:html|json|js|css|xml|txt)$/.test(file))
      continue
    const text = await fs.readFile(file, 'utf8')
    if (text.includes(root) || /(?:\/Users\/[^/]+\/[^"'\s]*wolfx|[A-Z]:\\Users\\[^\\]+\\[^"'\s]*wolfx)/i.test(text))
      fail(`${relative}: contains an internal project file path`)
    if (!relative.startsWith('_nuxt/') && /localhost|127\.0\.0\.1:\d{2,5}/i.test(text))
      fail(`${relative}: contains localhost or a development port`)
    if (/(?:CF_API_TOKEN|CLOUDFLARE_API_TOKEN|(?:^|[^A-Za-z])sk-[A-Za-z0-9_-]{20,})/.test(text))
      fail(`${relative}: contains a private token pattern`)
  }
}

if (failures.length) {
  console.error(failures.map(message => `FAIL ${message}`).join('\n'))
  process.exit(1)
}
console.log(`PASS ${locales.length * routePages.length} content pages, ${redirectEntries.length} redirects, static search, API endpoints, SEO, sitemaps, privacy resources, and generated output.`)
