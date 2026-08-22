const base = process.env.CLOUDFLARE_TEST_BASE_URL ?? 'http://127.0.0.1:8787'
const failures = []

async function request(route, method = 'GET') {
  return fetch(new URL(route, base), { method, redirect: 'manual' })
}

async function checkStatus(route, status, method = 'GET') {
  const response = await request(route, method)
  if (response.status !== status)
    failures.push(`${method} ${route}: expected ${status}, received ${response.status}`)
  return response
}

for (const route of [
  '/', '/projects', '/donate', '/zh/', '/en/', '/zh/docs/open-api',
  '/mc', '/mc/rules', '/mc/join', '/mc/vote',
  '/zh/mc', '/zh/mc/rules', '/zh/mc/join', '/zh/mc/vote',
  '/ja/mc', '/ja/mc/rules', '/ja/mc/join', '/ja/mc/vote',
  '/en/mc', '/en/mc/rules', '/en/mc/join', '/en/mc/vote',
  '/robots.txt', '/sitemap.xml', '/search-index.json', '/images/logo.png',
  '/zh/mc/_payload.json', '/ja/mc/rules/_payload.json', '/en/mc/vote/_payload.json',
])
  await checkStatus(route, 200)

const home = await checkStatus('/', 200)
const homeBody = await home.text()
if (!homeBody.includes('data-site="main"') || !homeBody.includes('https://wolfx.jp/'))
  failures.push('/: generated response is missing the main-site identity or canonical URL')

const mc = await checkStatus('/mc?source=cloudflare', 200)
const mcBody = await mc.text()
if (!mcBody.includes('data-site="wolfxmc"')
  || !mcBody.includes('https://wolfx.jp/mc')
  || !mcBody.includes('<code>Wolfx.jp</code>')
  || !mcBody.includes('<code>mc.wolfx.jp</code>')
  || mcBody.includes('https://mc.wolfx.jp'))
  failures.push('/mc: generated response has the wrong site identity or canonical URL')
if (!mcBody.includes('首页') || mcBody.includes('nav.home') || mcBody.includes('mc.overview'))
  failures.push('/mc: unprefixed Chinese default is missing translated UI messages')
const nuxtAsset = mcBody.match(/(?:src|href)="(\/_nuxt\/[^"?]+)/)?.[1]
if (!nuxtAsset)
  failures.push('/mc: could not discover a generated /_nuxt asset')
else
  await checkStatus(nuxtAsset, 200)

const head = await checkStatus('/mc/rules', 200, 'HEAD')
if ((await head.text()).length)
  failures.push('HEAD /mc/rules: response unexpectedly contains a body')

for (const route of [
  '/apidoc', '/apidoc.html', '/wsapi', '/seisapi.html',
  '/privacy_policy', '/privacy_policy.html', '/tos.html', '/donate.html',
  '/mc/rules.html', '/mc/join.html', '/mc/vote.html',
  '/nonexistent-path',
]) {
  const response = await checkStatus(route, 404)
  if (response.headers.has('location'))
    failures.push(`${route}: retired or missing route unexpectedly redirects to ${response.headers.get('location')}`)
}

if (failures.length) {
  console.error(failures.map(message => `FAIL ${message}`).join('\n'))
  process.exit(1)
}

console.log('PASS canonical Cloudflare Workers Assets routes, assets, query strings, HEAD, and retired/missing-route 404 behavior.')
