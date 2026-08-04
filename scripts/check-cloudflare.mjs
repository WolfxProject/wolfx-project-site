import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const redirects = JSON.parse(await fs.readFile(path.join(root, 'data/legacy-redirects.json'), 'utf8'))
const baseUrl = (process.env.CF_TEST_BASE_URL || 'http://127.0.0.1:8787').replace(/\/$/, '')
const failures = []

async function checkRedirect(source, target) {
  const query = 'release=check&lang=%E6%97%A5%E6%9C%AC%E8%AA%9E'
  const response = await fetch(`${baseUrl}${source}?${query}`, { redirect: 'manual' })
  const expected = `${baseUrl}${target}?${query}`
  if (response.status !== 301)
    failures.push(`${source}: expected 301, received ${response.status}`)
  if (response.headers.get('location') !== expected)
    failures.push(`${source}: expected Location ${expected}, received ${response.headers.get('location')}`)
  if ((await response.text()).length)
    failures.push(`${source}: redirect response unexpectedly contains a body`)
}

for (const [source, target] of Object.entries(redirects))
  await checkRedirect(source, target)

for (const source of ['/apidoc/', '/apidoc.html/', '/wsapi_ja/']) {
  const target = redirects[source.slice(0, -1)]
  await checkRedirect(source, target)
}

for (const route of ['/', '/zh/', '/en/', '/donate', '/zh/donate', '/en/donate', '/zh/docs/open-api', '/search-index.json']) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' })
  if (response.status !== 200)
    failures.push(`${route}: expected 200, received ${response.status}`)
}

const missing = await fetch(`${baseUrl}/nonexistent-path`, { redirect: 'manual' })
if (missing.status !== 404)
  failures.push(`/nonexistent-path: expected 404, received ${missing.status}`)

if (failures.length) {
  console.error(failures.map(message => `FAIL ${message}`).join('\n'))
  process.exit(1)
}
console.log(`PASS ${Object.keys(redirects).length} Cloudflare redirects, trailing slashes, query strings, assets, and 404 behavior.`)
