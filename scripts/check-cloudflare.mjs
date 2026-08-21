import fs from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const redirects = JSON.parse(await fs.readFile(path.join(root, 'data/legacy-redirects.json'), 'utf8'))
const baseUrl = (process.env.CF_TEST_BASE_URL || 'http://127.0.0.1:8787').replace(/\/$/, '')
const failures = []
const wolfxMcHost = 'mc.wolfx.jp'

async function request(route, options = {}) {
  const { host, ...fetchOptions } = options
  if (!host) {
    return fetch(`${baseUrl}${route}`, {
      redirect: 'manual',
      ...fetchOptions,
    })
  }

  const url = new URL(`${baseUrl}${route}`)
  const transport = url.protocol === 'https:' ? https : http
  return new Promise((resolve, reject) => {
    const request = transport.request(url, {
      method: fetchOptions.method ?? 'GET',
      headers: { ...fetchOptions.headers, host },
    }, (response) => {
      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8')
        resolve({
          status: response.statusCode ?? 0,
          headers: { get: name => response.headers[name.toLowerCase()] ?? null },
          text: async () => body,
        })
      })
    })
    request.on('error', reject)
    request.end()
  })
}

async function checkRedirect(source, target) {
  const query = 'release=check&lang=%E6%97%A5%E6%9C%AC%E8%AA%9E'
  const response = await request(`${source}?${query}`)
  const expected = `${baseUrl}${target}?${query}`
  if (response.status !== 301)
    failures.push(`${source}: expected 301, received ${response.status}`)
  if (response.headers.get('location') !== expected)
    failures.push(`${source}: expected Location ${expected}, received ${response.headers.get('location')}`)
  if ((await response.text()).length)
    failures.push(`${source}: redirect response unexpectedly contains a body`)
}

async function checkWolfxMcRedirect(source, target) {
  const query = 'release=check&lang=%E4%B8%AD%E6%96%87'
  const response = await request(`${source}?${query}`, { host: wolfxMcHost })
  const location = response.headers.get('location')
  if (response.status !== 301)
    failures.push(`mc ${source}: expected 301, received ${response.status}`)
  if (!location || new URL(location).hostname !== wolfxMcHost || new URL(location).pathname !== target || new URL(location).search !== `?${query}`)
    failures.push(`mc ${source}: expected host/path/query ${wolfxMcHost}${target}?${query}, received ${location}`)
  if ((await response.text()).length)
    failures.push(`mc ${source}: redirect response unexpectedly contains a body`)
}

async function checkStatus(route, status, options = {}) {
  const response = await request(route, options)
  if (response.status !== status)
    failures.push(`${options.host ? 'mc ' : ''}${route}: expected ${status}, received ${response.status}`)
  return response
}

for (const [source, target] of Object.entries(redirects))
  await checkRedirect(source, target)

for (const source of ['/apidoc/', '/apidoc.html/', '/wsapi_ja/']) {
  const target = redirects[source.slice(0, -1)]
  await checkRedirect(source, target)
}

for (const route of ['/', '/zh/', '/en/', '/donate', '/zh/donate', '/en/donate', '/zh/docs/open-api', '/search-index.json'])
  await checkStatus(route, 200)

for (const route of ['/', '/rules', '/join', '/vote', '/zh/', '/zh/rules', '/zh/join', '/zh/vote', '/en/', '/en/rules', '/en/vote', '/robots.txt', '/sitemap.xml', '/search-index.json', '/images/logo.png', '/zh/mc/_payload.json', '/zh/mc/rules/_payload.json', '/en/mc/vote/_payload.json']) {
  const response = await checkStatus(route, 200, { host: wolfxMcHost })
  if (route === '/') {
    const body = await response.text()
    if (!body.includes('data-site="wolfxmc"') || !body.includes('https://mc.wolfx.jp/'))
      failures.push('mc /: generated response is missing WolfxMC identity or canonical URL')
    if (!body.includes('首页') || body.includes('nav.home') || body.includes('mc.overview'))
      failures.push('mc /: unprefixed Chinese default is missing translated UI messages')
    const nuxtAsset = body.match(/(?:src|href)="(\/_nuxt\/[^"?]+)/)?.[1]
    if (!nuxtAsset)
      failures.push('mc /: could not discover a generated /_nuxt asset')
    else
      await checkStatus(nuxtAsset, 200, { host: wolfxMcHost })
  }
}

for (const [source, target] of [
  ['/rules.html', '/rules'],
  ['/join.html', '/join'],
  ['/vote.html', '/vote'],
  ['/rules/', '/rules'],
  ['/zh', '/zh/'],
  ['/en', '/en/'],
])
  await checkWolfxMcRedirect(source, target)

const head = await checkStatus('/rules', 200, { host: wolfxMcHost, method: 'HEAD' })
if ((await head.text()).length)
  failures.push('mc /rules: HEAD response unexpectedly contains a body')

await checkStatus('/en/join', 404, { host: wolfxMcHost })
await checkStatus('/nonexistent-path', 404, { host: wolfxMcHost })

const missing = await request('/nonexistent-path')
if (missing.status !== 404)
  failures.push(`/nonexistent-path: expected 404, received ${missing.status}`)

if (failures.length) {
  console.error(failures.map(message => `FAIL ${message}`).join('\n'))
  process.exit(1)
}
console.log(`PASS ${Object.keys(redirects).length} Cloudflare redirects plus primary/WolfxMC host routing, trailing slashes, query strings, assets, HEAD, and 404 behavior.`)
