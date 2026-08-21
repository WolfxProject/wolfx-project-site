const baseUrl = (process.env.MC_STATIC_TEST_BASE_URL || 'http://127.0.0.1:8790').replace(/\/$/, '')
const failures = []

async function request(route, options = {}) {
  return fetch(`${baseUrl}${route}`, { redirect: 'manual', ...options })
}

async function checkStatus(route, expected, options = {}) {
  const response = await request(route, options)
  if (response.status !== expected)
    failures.push(`${options.method ?? 'GET'} ${route}: expected ${expected}, received ${response.status}`)
  return response
}

for (const route of ['/', '/rules', '/join', '/vote', '/zh/', '/zh/rules', '/zh/join', '/zh/vote', '/en/', '/en/rules', '/en/vote', '/robots.txt', '/sitemap.xml', '/search-index.json', '/images/logo.png', '/zh/mc/_payload.json', '/zh/mc/rules/_payload.json', '/en/mc/vote/_payload.json'])
  await checkStatus(route, 200)

const home = await checkStatus('/', 200)
const homeBody = await home.text()
if (!homeBody.includes('data-site="wolfxmc"') || !homeBody.includes('https://mc.wolfx.jp/'))
  failures.push('GET /: response is missing WolfxMC identity or canonical URL')
if (!homeBody.includes('首页') || homeBody.includes('nav.home') || homeBody.includes('mc.overview'))
  failures.push('GET /: unprefixed Chinese default is missing translated UI messages')
const nuxtAsset = homeBody.match(/(?:src|href)="(\/_nuxt\/[^"?]+)/)?.[1]
if (!nuxtAsset)
  failures.push('GET /: could not discover a generated /_nuxt asset')
else
  await checkStatus(nuxtAsset, 200)

for (const [source, target] of [
  ['/rules.html', '/rules'],
  ['/join.html', '/join'],
  ['/vote.html', '/vote'],
  ['/rules/', '/rules'],
  ['/zh', '/zh/'],
  ['/en', '/en/'],
]) {
  const query = 'release=check&lang=%E4%B8%AD%E6%96%87'
  const response = await checkStatus(`${source}?${query}`, 301)
  const location = response.headers.get('location')
  if (!location || new URL(location, baseUrl).pathname !== target || new URL(location, baseUrl).search !== `?${query}`)
    failures.push(`GET ${source}: expected Location ${target}?${query}, received ${location}`)
}

const head = await checkStatus('/rules', 200, { method: 'HEAD' })
if ((await head.text()).length)
  failures.push('HEAD /rules: response unexpectedly contains a body')

await checkStatus('/en/join', 404)
await checkStatus('/nonexistent-path', 404)

if (failures.length) {
  console.error(failures.map(message => `FAIL ${message}`).join('\n'))
  process.exit(1)
}
console.log('PASS WolfxMC Nginx/static pages, locale routes, legacy redirects, query strings, assets, HEAD, and 404 behavior.')
