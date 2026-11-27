import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { collectSitemap } from '@nuxtjs/sitemap/utils'
import { parse } from 'parse5'
import { parseConfigFileTextToJson } from 'typescript'
import { wolfxMc } from '../data/wolfxmc.ts'
import { checkJmaDocs } from './check-jma-docs.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const retiredMinecraftAddress = ['mc', 'wolfx', 'jp'].join('.')

const localLucideCollection = require('@iconify-json/lucide/icons.json')

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
  { file: 'legal/privacy.md', route: 'legal/privacy', layout: 'legal' },
  { file: 'legal/terms.md', route: 'legal/terms', layout: 'legal' },
]
const wolfxMcRouteFamilies = ['/mc', '/mc/rules', '/mc/join', '/mc/vote']
const wolfxMcPages = wolfxMcRouteFamilies.flatMap(path => [
  { route: path, canonical: path, locale: 'zh', htmlLang: 'zh-CN' },
  { route: `/zh${path}`, canonical: path, locale: 'zh', htmlLang: 'zh-CN' },
  { route: `/ja${path}`, canonical: `/ja${path}`, locale: 'ja', htmlLang: 'ja-JP' },
  { route: `/en${path}`, canonical: `/en${path}`, locale: 'en', htmlLang: 'en-US' },
])
const wolfxMcAlternates = ['zh-CN', 'ja', 'en', 'x-default']
const retiredRoutes = [
  '/docs/seisjs-api', '/zh/docs/seisjs-api', '/en/docs/seisjs-api',
  '/apidoc', '/apidoc.html', '/apidoc_zh', '/apidoc_zh.html', '/apidoc_en', '/apidoc_en.html',
  '/wsapi', '/wsapi.html', '/wsapi_ja', '/wsapi_zh', '/wsapi_zh.html', '/wsapi_en', '/wsapi_en.html',
  '/seisapi', '/seisapi.html', '/seisapi_zh', '/seisapi_zh.html', '/seisapi_en', '/seisapi_en.html',
  '/privacy_policy', '/privacy_policy.html', '/privacy_policy_zh', '/privacy_policy_zh.html',
  '/privacy_policy_en', '/privacy_policy_en.html', '/tos', '/tos.html', '/tos_zh', '/tos_zh.html',
  '/tos_en', '/tos_en.html', '/donate.html', '/mc/rules.html', '/mc/join.html', '/mc/vote.html',
]
const retiredArchitectureFiles = [
  'data/legacy-redirects.json',
  'data/site-identities.ts',
  'deploy/nginx-redirects.conf',
  'deploy/nginx-wolfxmc.conf',
  'deploy/nginx-wolfxmc-redirects.conf',
  'public/mc-robots.txt',
  'public/mc-sitemap.xml',
  'scripts/check-wolfxmc-static.mjs',
  'scripts/generate-redirects.mjs',
  'scripts/prepare-cloudflare-assets.mjs',
  'worker/generated-redirects.ts',
]
const requiredEndpoints = [
  'https://api.wolfx.jp/jma_eew.json',
  'wss://ws-api.wolfx.jp/jma_eew',
  'wss://ws-api.wolfx.jp/all_eew',
]
const apiStatusResources = [
  'https://api.wolfx.jp/ws_clients.json',
  'https://api.wolfx.jp/status/nginx_request-day.png',
  'https://api.wolfx.jp/status/nginx_request-week.png',
  'https://api.wolfx.jp/status/if_eth0-day.png',
  'https://api.wolfx.jp/status/if_eth0-week.png',
]
const failures = []
try {
  await checkJmaDocs(root)
}
catch (error) {
  failures.push(`API documentation: ${error instanceof Error ? error.message : String(error)}`)
}
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
  const excludedDirectories = new Set(['.git', '.nuxt', '.output', '.wrangler', '.data', '.cache', 'node_modules', 'test-results', 'playwright-report'])
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

function hasLocalLucideIcon(name) {
  const visited = new Set()
  while (name && !visited.has(name)) {
    if (localLucideCollection.icons[name])
      return true
    visited.add(name)
    name = localLucideCollection.aliases?.[name]?.parent
  }
  return false
}

for (const file of await sourceFiles(root)) {
  const source = await fs.readFile(file, 'utf8')
  const relative = path.relative(root, file)
  for (const match of source.matchAll(/\b(?:i-)?lucide(?::|-)([a-z0-9][a-z0-9-]*)\b/g)) {
    const name = match[1]
    if (hasLocalLucideIcon(name))
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

function extractAttribute(html, pattern) {
  return html.match(pattern)?.[1]
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
        if (!markdown.includes(`::api-status-panel{locale="${locale.locale}"}`))
          fail(`${locale.locale}: Open API is missing its localized API Status panel`)
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

for (const locale of locales) {
  for (const family of wolfxMcRouteFamilies) {
    const relative = family === '/mc' ? 'mc/index' : family.slice(1)
    markdownFiles.push(path.join(root, 'content', locale.locale, `${relative}.md`))
  }
}
const contentPaths = new Set([
  ...locales.flatMap(locale => routePages.map(page => publicRoute(locale.prefix, page.route))),
  ...wolfxMcPages.map(page => page.route),
])
for (const file of markdownFiles) {
  if (!await exists(file)) {
    fail(`Missing ${path.relative(root, file)}`)
    continue
  }
  const markdown = await fs.readFile(file, 'utf8')
  for (const match of markdown.matchAll(/\[[^\]]*\]\((\/[^)]+)\)/g)) {
    const href = new URL(match[1], 'https://wolfx.jp')
    if (href.origin !== 'https://wolfx.jp' || contentPaths.has(href.pathname.replace(/\/$/, '') || '/'))
      continue
    if (!(await fs.stat(path.join(root, 'public', decodeURIComponent(href.pathname))).catch(() => null))?.isFile())
      fail(`${path.relative(root, file)}: unresolved internal link ${href.pathname}`)
  }
}

for (const file of retiredArchitectureFiles) {
  if (await exists(path.join(root, file)))
    fail(`Retired multi-host or redirect artifact still exists: ${file}`)
}

for (const relative of ['worker/index.ts', 'wrangler.jsonc', 'deploy/nginx-cache.conf']) {
  const source = await fs.readFile(path.join(root, relative), 'utf8')
  if (source.includes(retiredMinecraftAddress))
    fail(`${relative}: retired Minecraft address must not be used for website routing`)
}

const wrangler = parseConfigFileTextToJson('wrangler.jsonc', await fs.readFile(path.join(root, 'wrangler.jsonc'), 'utf8'))
if (wrangler.error || wrangler.config?.workers_dev !== false || wrangler.config?.preview_urls !== false)
  fail('Wrangler must disable its public workers.dev and version preview URLs for this single-host site')

if (wolfxMc.serverAddress !== 'wolfx.jp')
  fail('WolfxMC data must define the unified lowercase Minecraft address')
if (wolfxMc.statusAddress !== wolfxMc.serverAddress)
  fail('WolfxMC status must use the published Minecraft address')
if (!wolfxMc.currentCoreVersion?.trim())
  fail('WolfxMC data must specify the current server core version')

const minecraftStatusSource = await fs.readFile(path.join(root, 'app/composables/useMinecraftStatus.ts'), 'utf8')
if (!minecraftStatusSource.includes(`new URL('https://mcapi.us/server/status')`) || !minecraftStatusSource.includes(`endpoint.searchParams.set('ip', wolfxMc.statusAddress)`))
  fail('Minecraft status lookup must query mcapi.us with the centralized status address')

for (const locale of ['ja', 'zh', 'en']) {
  const projects = await fs.readFile(path.join(root, `content/${locale}/projects.md`), 'utf8')
  if (/Wolfx Survival|WolfxMC|href="\/(?:zh\/|en\/)?mc"/.test(projects))
    fail(`${locale}: Projects must not promote WolfxMC`)
  const privacy = await fs.readFile(path.join(root, `content/${locale}/legal/privacy.md`), 'utf8')
  if (!privacy.includes('mcapi.us'))
    fail(`${locale}: privacy policy is missing the direct mcapi.us disclosure`)
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
  if (index.length !== markdownFiles.length)
    fail(`Expected one search entry for each of ${markdownFiles.length} content pages, found ${index.length}`)
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
    if (!entry.path?.startsWith('/') || entry.path?.startsWith('//') || entry.path?.includes('.md'))
      fail(`${label}: invalid public path ${entry.path}`)
    if (!contentPaths.has(entry.path))
      fail(`${label}: unpublished page URL ${entry.path}`)
    if (paths.has(entry.path))
      fail(`${label}: duplicate path ${entry.path}`)
    paths.add(entry.path)
    if (/<(?:div|script|style|table)\b[^>]*>|^---$|\n#{1,6}\s|```/.test(entry.text))
      fail(`${label}: text contains markup or frontmatter noise`)
    const contentRoute = /^\/(?:(?:ja|zh|en)\/)?mc$/.test(entry.path) ? `${entry.path}/index` : entry.path
    const expectedContent = contentRoute === '/'
      ? path.join(root, 'content/ja/index.md')
      : path.join(root, 'content', entry.locale, `${contentRoute.replace(/^\/(ja|zh|en)(?=\/|$)/, '').replace(/^\//, '') || 'index'}.md`)
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
  for (const { locale, prefix } of locales) {
    for (const [route, term] of [
      ['docs/websocket', 'query_jmaeew'],
      ['docs/open-api', 'https://api.wolfx.jp/jma_eew.json'],
      ['projects', 'Seismic Stations Viewer'],
    ]) {
      const entry = index.find(entry => entry.path === publicRoute(prefix, route))
      if (!entry?.text.includes(term))
        fail(`Static search is missing ${term} in ${locale}/${route}`)
    }
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
  for (const [locale, term, expectedPath] of [
    ['ja', 'Wolfx Survival', '/ja/mc'],
    ['zh', 'Wolfx Survival', '/mc'],
    ['en', 'Wolfx Survival', '/en/mc'],
  ]) {
    const found = index.some(entry => entry.locale === locale && entry.path === expectedPath
      && `${entry.title} ${(entry.headings ?? []).join(' ')} ${entry.text}`.includes(term))
    if (!found)
      fail(`Static search has no ${locale} WolfxMC result at ${expectedPath}`)
  }
}

if (!await exists(outputRoot)) {
  fail('Missing .output/public; run pnpm generate')
}
else {
  const build = JSON.parse(await fs.readFile(path.join(outputRoot, '../nitro.json'), 'utf8'))
  if (build.preset !== 'static' || await exists(path.join(outputRoot, '../server/index.mjs')))
    fail('Expected a static Nitro build. Check the Workers Builds command and preset.')
  const builtIndex = await fs.readFile(path.join(outputRoot, 'search-index.json'), 'utf8').catch(() => '')
  if (builtIndex !== await fs.readFile(sourceIndexFile, 'utf8'))
    fail('Generated search-index.json differs from public/search-index.json')
  const dump = await fs.readFile(path.join(outputRoot, '__nuxt_content/pages/sql_dump.txt'), 'utf8')
  const contentSql = gunzipSync(Buffer.from(dump, 'base64')).toString('utf8')
  if (contentSql.includes('docs/seisjs-api'))
    fail('The browser content database contains the retired guide')
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
      if (!new RegExp(`<html[^>]+lang="${locale.htmlLang}"`).test(html))
        fail(`${route}: expected html lang ${locale.htmlLang}`)
      if (!html.includes(`<link rel="canonical" href="https://wolfx.jp${route}"`))
        fail(`${route}: wrong canonical URL`)
      for (const [hreflang, prefix] of [['ja', ''], ['zh-CN', 'zh'], ['en', 'en'], ['x-default', '']]) {
        if (!html.includes(`hreflang="${hreflang}" href="https://wolfx.jp${publicRoute(prefix, page.route)}"`))
          fail(`${route}: incorrect hreflang ${hreflang}`)
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
      else if (page.file === 'projects.md' && /Wolfx Survival|WolfxMC/.test(html)) {
        fail(`${route}: generated Projects page still promotes WolfxMC`)
      }
      else if (page.layout === 'landing' && !/("@type":"(?:WebSite|CollectionPage)")/.test(html)) {
        fail(`${route}: landing page has wrong JSON-LD type`)
      }
    }
  }

  for (const page of wolfxMcPages) {
    const file = outputFileForRoute(page.route)
    generatedPages.push({ file, route: page.route })
    if (!await exists(file)) {
      fail(`Missing generated WolfxMC route ${page.route}`)
      continue
    }
    const html = await fs.readFile(file, 'utf8')
    if (!new RegExp(`<html[^>]+lang="${page.htmlLang}"`).test(html))
      fail(`${page.route}: expected html lang ${page.htmlLang}`)
    if (!html.includes('data-site="wolfxmc"'))
      fail(`${page.route}: missing WolfxMC site identity`)
    if (!html.includes(`<link rel="canonical" href="https://wolfx.jp${page.canonical}"`))
      fail(`${page.route}: wrong WolfxMC canonical URL`)
    for (const hreflang of wolfxMcAlternates) {
      if (!html.includes(`hreflang="${hreflang}"`))
        fail(`${page.route}: missing hreflang ${hreflang}`)
    }
    const canonicalChinesePath = page.route.replace(/^\/(?:ja|zh|en)(?=\/)/, '')
    if (!html.includes(`hreflang="x-default" href="https://wolfx.jp${canonicalChinesePath}"`))
      fail(`${page.route}: WolfxMC x-default does not point to the preferred Chinese route`)
    if ((html.match(/<h1(?:\s|>)/g) ?? []).length !== 1)
      fail(`${page.route}: expected exactly one h1`)
    if (!html.includes('property="og:url"') || !html.includes('name="twitter:card"'))
      fail(`${page.route}: missing social metadata`)
    if (!html.includes(`"url":"https://wolfx.jp${page.canonical}"`))
      fail(`${page.route}: structured data uses the wrong public URL`)
    if (/web\.archive\.org|minecraft\.min\.js/i.test(html))
      fail(`${page.route}: contains an archive or retired live-status script`)
    if (/<script\b[^>]+src=["'][^"']*mcapi\.us/i.test(html))
      fail(`${page.route}: loads mcapi.us as a third-party script`)
    if (/map size \(at capture\)|地图大小（归档时）|マップサイズ（保存時）/i.test(html))
      fail(`${page.route}: exposes the retired world/map storage statistic`)
    if (/Recovered from|archived page|archive capture|归档页面|アーカイブ|Wayback|復元した/i.test(html))
      fail(`${page.route}: exposes visitor-facing archive or recovery wording`)
    if (html.includes(retiredMinecraftAddress))
      fail(`${page.route}: contains the retired Minecraft address`)
    if (/(?:^|\/)mc(?:\/join)?$/.test(page.route)) {
      if ((html.match(/<code>wolfx\.jp<\/code>/g) ?? []).length !== 1)
        fail(`${page.route}: page does not expose exactly one unified Minecraft address`)
    }
    if (page.route === '/mc' || page.route === '/zh/mc' || page.route === '/ja/mc' || page.route === '/en/mc') {
      if (!html.includes(`>${wolfxMc.currentCoreVersion}<`))
        fail(`${page.route}: homepage does not expose current server core ${wolfxMc.currentCoreVersion}`)
    }
  }

  for (const required of ['404.html', 'robots.txt', 'sitemap.xml', 'sitemap_index.xml', '__sitemap__/ja-JP.xml', '__sitemap__/zh-CN.xml', '__sitemap__/en-US.xml', 'search-index.json']) {
    if (!await exists(path.join(outputRoot, required)))
      fail(`Missing generated ${required}`)
  }
  if (await exists(path.join(outputRoot, 'sitemap.xml', 'index.html')))
    fail('Obsolete sitemap.xml/index.html redirect exists')
  if (await exists(path.join(outputRoot, 'api/search')))
    fail('Obsolete prerendered /api/search still exists')

  for (const source of retiredRoutes) {
    const relative = source.slice(1)
    const file = source.endsWith('.html')
      ? path.join(outputRoot, relative)
      : path.join(outputRoot, relative, 'index.html')
    if (await exists(file))
      fail(`Retired route is still present in generated output: ${source}`)
  }

  const localeSitemapFiles = ['ja-JP', 'zh-CN', 'en-US'].map(locale => `__sitemap__/${locale}.xml`)
  const sitemapFiles = ['sitemap.xml', 'sitemap_index.xml', ...localeSitemapFiles]
  const sitemapContents = new Map(await Promise.all(sitemapFiles.map(async file => [file, await fs.readFile(path.join(outputRoot, file), 'utf8')])))
  const indexXml = sitemapContents.get('sitemap_index.xml')
  if (sitemapContents.get('sitemap.xml') !== indexXml)
    fail('Both public sitemap index URLs must serve the same XML')
  const index = await collectSitemap(indexXml)
  if (index._tag !== 'document' || index.document._tag !== 'index'
    || index.document.entries.length !== localeSitemapFiles.length
    || !localeSitemapFiles.every(file => index.document.entries.some(entry => entry.loc === `https://wolfx.jp/${file}`)))
    fail('The sitemap index must link to all three published language sitemaps')
  const sitemapText = [...sitemapContents.values()].join('\n')
  if (sitemapText.includes(retiredMinecraftAddress))
    fail('Sitemap exposes the retired Minecraft address')
  for (const forbidden of [...retiredRoutes, '/api/search', '/search-index.json', '/404']) {
    if (sitemapText.includes(`<loc>https://wolfx.jp${forbidden}</loc>`))
      fail(`Sitemap contains forbidden route ${forbidden}`)
  }
  for (const locale of locales) {
    const file = `__sitemap__/${locale.htmlLang}.xml`
    const parsed = await collectSitemap(sitemapContents.get(file))
    if (parsed._tag !== 'document' || parsed.document._tag !== 'urlset') {
      fail(`${file} is not a sitemap urlset`)
      continue
    }
    const entries = new Map(parsed.document.entries.map(entry => [entry.loc, entry]))
    const families = [
      ...routePages.map(page => ({ route: page.route, mc: false })),
      ...wolfxMcRouteFamilies.map(route => ({ route: route.slice(1), mc: true })),
    ]
    if (parsed.document.entries.length !== families.length)
      fail(`${file}: expected ${families.length} canonical pages`)
    for (const family of families) {
      const paths = new Map(locales.map((language) => {
        const prefix = family.mc ? (language.locale === 'zh' ? '' : language.locale) : language.prefix
        return [language.htmlLang, `https://wolfx.jp${publicRoute(prefix, family.route)}`]
      }))
      const address = paths.get(locale.htmlLang)
      const entry = entries.get(address)
      if (!entry) {
        fail(`${file}: missing canonical URL ${address}`)
        continue
      }
      paths.set('x-default', paths.get(family.mc ? 'zh-CN' : 'ja-JP'))
      const alternatesByLanguage = new Map([...paths].map(([lang, url]) =>
        [lang === 'ja-JP' || lang === 'en-US' ? lang.slice(0, 2) : lang, url]))
      const alternatives = entry.extensions?.alternatives ?? []
      if (alternatives.length !== paths.size || !alternatives.every(alt => alternatesByLanguage.get(alt.hreflang) === alt.href)
        || new Set(alternatives.map(alt => alt.hreflang)).size !== paths.size)
        fail(`${file}: incorrect language alternatives for ${address}`)
    }
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

  // Walk actual anchors and resource tags, including links rendered by MDC and Vue.
  const pagesByPath = new Map()
  for (const { file, route } of generatedPages) {
    if (!await exists(file))
      continue
    const ids = new Set()
    const links = []
    let payloadAttributes
    function visit(node) {
      const attrs = Object.fromEntries((node.attrs ?? []).map(attr => [attr.name, attr.value]))
      if (attrs.id)
        ids.add(attrs.id)
      if (node.tagName === 'script' && attrs.id === '__NUXT_DATA__')
        payloadAttributes = attrs
      const href = node.tagName === 'a' || node.tagName === 'link' ? attrs.href : attrs.src
      if (href)
        links.push(new URL(href, `https://wolfx.jp${route}`))
      node.childNodes?.forEach(visit)
    }
    visit(parse(await fs.readFile(file, 'utf8')))
    const payloadPath = `${route === '/' ? '' : route}/_payload.json`
    if (payloadAttributes?.['data-ssr'] !== 'true' || payloadAttributes['data-src']?.split('?')[0] !== payloadPath)
      fail(`${route}: generated HTML does not reference its SSR payload`)
    const payload = await fs.readFile(path.join(path.dirname(file), '_payload.json'), 'utf8')
      .then(JSON.parse).catch(() => null)
    if (!payload || typeof payload !== 'object' || !Object.keys(payload).length)
      fail(`${route}: missing or invalid generated SSR payload`)
    pagesByPath.set(route, { ids, links })
  }
  for (const [route, { links }] of pagesByPath) {
    for (const href of links) {
      if (href.origin !== 'https://wolfx.jp')
        continue
      const target = pagesByPath.get(href.pathname.replace(/\/$/, '') || '/')
      if (target) {
        if (href.hash && !target.ids.has(decodeURIComponent(href.hash.slice(1))))
          fail(`${route}: broken fragment ${href.pathname}${href.hash}`)
      }
      else if (!(await fs.stat(path.join(outputRoot, decodeURIComponent(href.pathname))).catch(() => null))?.isFile()) {
        fail(`${route}: missing generated resource ${href.pathname}`)
      }
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
    if (/(?:^|\/)500(?:\.html|\/index\.html)$/.test(relative) || /(?:^|\/)docs\/seisjs-api(?:[./]|$)/.test(relative))
      fail(`Unexpected error page or retired document in static output: ${relative}`)
    if (file.endsWith('.md'))
      fail(`Generated output contains source Markdown: ${relative}`)
    if (!/\.(?:html|json|js|css|xml|txt)$/.test(file))
      continue
    const text = await fs.readFile(file, 'utf8')
    if (file.endsWith('.html') && /<title>500 · Wolfx Project<\/title>/i.test(text))
      fail(`${relative}: generated a server-error document`)
    if (text.includes('/docs/seisjs-api') || /\\u002Fdocs\\u002Fseisjs-api/i.test(text))
      fail(`${relative}: contains a retired documentation URL`)
    if (text.includes(root) || /(?:\/Users\/[^/]+\/[^"'\s]*wolfx|[A-Z]:\\Users\\[^\\]+\\[^"'\s]*wolfx)/i.test(text))
      fail(`${relative}: contains an internal project file path`)
    if (!relative.startsWith('_nuxt/') && /localhost|127\.0\.0\.1:\d{2,5}/i.test(text))
      fail(`${relative}: contains localhost or a development port`)
    if (/(?:CF_API_TOKEN|CLOUDFLARE_API_TOKEN|(?:^|[^A-Za-z])sk-[A-Za-z0-9_-]{20,})/.test(text))
      fail(`${relative}: contains a private token pattern`)
    if (text.includes(`https://${retiredMinecraftAddress}`))
      fail(`${relative}: contains the retired Minecraft address as an HTTP website origin`)
  }
}

if (failures.length) {
  console.error(failures.map(message => `FAIL ${message}`).join('\n'))
  process.exit(1)
}
console.log(`PASS ${locales.length * routePages.length} primary pages, ${wolfxMcPages.length} WolfxMC pages, ${retiredRoutes.length} retired-route absences, static search, API endpoints, SEO, sitemaps, privacy resources, and generated output.`)
