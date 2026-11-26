const mainPaths = ['', '/projects', '/donate', '/docs/open-api', '/docs/websocket', '/legal/privacy', '/legal/terms']
const gamePaths = ['/mc', '/mc/rules', '/mc/join', '/mc/vote']
const pages = [
  ...['', '/zh', '/en'].flatMap(prefix => mainPaths.map(path => prefix + path || '/')),
  ...['', '/zh', '/ja', '/en'].flatMap(prefix => gamePaths.map(path => prefix + path)),
]

export async function checkStaticDelivery(base, server) {
  const failures = []
  function expect(ok, message) {
    if (!ok)
      failures.push(message)
  }

  async function request(route, status = 200, init) {
    const response = await fetch(new URL(route, base), { redirect: 'manual', signal: AbortSignal.timeout(15_000), ...init })
    expect(response.status === status, `${init?.method ?? 'GET'} ${route}: expected ${status}, received ${response.status}`)
    return response
  }

  function checkRevalidation(response, path) {
    const cache = response.headers.get('cache-control') ?? ''
    expect(/\bno-cache\b|\bmax-age=0\b/.test(cache) && !/immutable/.test(cache), `${path}: expected a revalidating cache policy, received "${cache}"`)
    expect((cache.match(/\b(?:no-cache|max-age=\d+)\b/g) ?? []).length === 1, `${path}: expected a single cache policy`)
  }

  const query = '?source=delivery&view=full'
  const build = await (await request('/_nuxt/builds/latest.json')).json()
  expect(typeof build.id === 'string' && build.id, 'Missing current build ID')
  const bundles = new Set()
  for (const path of pages) {
    const response = await request(path + query)
    const html = await response.text()
    const canonical = path.replace(/^\/zh(?=\/mc(?:\/|$))/, '')
    expect(html.includes(`<link rel="canonical" href="https://wolfx.jp${canonical}"`) && html.includes('markdown-content'), `${path}: incorrect generated page or canonical URL`)
    expect(/text\/html/.test(response.headers.get('content-type')), `${path}: incorrect HTML content type`)
    checkRevalidation(response, path)
    const head = await request(path + query, 200, { method: 'HEAD' })
    expect(head.headers.get('content-type') === response.headers.get('content-type') && await head.text() === '', `HEAD ${path}: expected empty HTML response`)
    const payloadPath = `${path === '/' ? '' : path}/_payload.json?_b=${build.id}`
    expect(html.includes(`data-src="${payloadPath}"`) && html.includes(`href="${payloadPath}"`), `${path}: payload and preload must match the published build`)
    const payload = await request(payloadPath)
    checkRevalidation(payload, payloadPath)
    expect(/application\/json/.test(payload.headers.get('content-type')), `${path}: incorrect payload type`)
    const data = await payload.json()
    const locale = path.match(/^\/(zh|ja|en)(?:\/|$)/)?.[1] ?? (path.startsWith('/mc') ? 'zh' : 'ja')
    const slug = path.replace(/^\/(zh|ja|en)(?:\/|$)/, '/').slice(1)
    const key = `content-page:/${locale}${slug ? `/${slug}` : ''}`
    expect(data[data[0].buildId] === build.id && data.some(item => item && Object.hasOwn(item, key)), `${path}: payload belongs to another page or build`)
    if (path !== '/') {
      const slash = `${path}/${query}`
      const redirects = server === 'Cloudflare'
      for (const method of ['GET', 'HEAD']) {
        const raw = await request(slash, redirects ? 307 : 200, { method, headers: { 'Accept': 'text/html', 'Cache-Control': 'no-cache' } })
        expect(raw.headers.get('location') === (redirects ? path + query : null), `${method} ${slash}: unexpected redirect target`)
        if (method === 'HEAD') expect(await raw.text() === '', `HEAD ${slash}: unexpected body`)
        else if (!redirects) expect(await raw.text() === html, `${slash}: wrong directory index`)
        else await raw.body?.cancel()
      }
      const final = await request(slash, 200, { redirect: 'follow' })
      expect(final.url === new URL(redirects ? path + query : slash, base).href && await final.text() === html, `${slash}: wrong final URL or page after navigation`)
      if (path === '/zh' || path === '/en') {
        for (const headers of [{ 'Accept': 'application/json', 'Sec-Purpose': 'prefetch' }, { 'Accept': 'text/html', 'Sec-Fetch-Mode': 'navigate', 'Accept-Language': 'ja' }]) {
          const repeat = await request(slash, redirects ? 307 : 200, { headers })
          expect(repeat.headers.get('location') === (redirects ? path + query : null), `${slash}: request headers changed the route`)
          if (redirects) await repeat.body?.cancel()
          else expect(await repeat.text() === html, `${slash}: request headers changed the page`)
        }
      }
    }
    for (const match of html.matchAll(/(?:src|href)="(\/_nuxt\/[^"/?]+\.(?:css|js))(?:\?[^"]*)?"/g))
      bundles.add(match[1])
    if (path === '/')
      expect(html.includes('data-site="main"'), '/: missing main site identity')
    if (path === '/mc') {
      expect(html.includes('data-site="wolfxmc"') && (html.match(/<code>wolfx\.jp<\/code>/g) ?? []).length === 1, '/mc: incorrect site or game address')
      expect(html.includes('首页') && !/nav\.home|mc\.overview/.test(html), '/mc: missing Chinese UI messages')
    }
  }

  for (const extension of ['.js', '.css'])
    expect([...bundles].some(path => path.endsWith(extension)), `/: missing generated ${extension} bundle`)
  for (const path of bundles) {
    const bundle = await request(path)
    const mime = path.endsWith('.css') ? /text\/css/ : /(?:application|text)\/javascript/
    expect(mime.test(bundle.headers.get('content-type')) && /^[^<]/.test((await bundle.text()).trim()), `${path}: expected a non-empty JS or CSS asset`)
    const response = await request(path, 200, { method: 'HEAD' })
    const cache = response.headers.get('cache-control') ?? ''
    expect(/\bimmutable\b/.test(cache) && /\bmax-age=31536000\b/.test(cache) && (cache.match(/max-age=/g) ?? []).length === 1, `${path}: incorrect immutable bundle policy "${cache}"`)
    const etag = response.headers.get('etag')
    expect(etag, `${path}: missing bundle ETag`)
    if (etag) {
      const cached = await request(path, 304, { headers: { 'If-None-Match': etag } })
      expect(cached.headers.get('cache-control') === cache && await cached.text() === '', `${path}: 304 lost the bundle cache policy or contains a body`)
    }
  }

  const js = [...bundles].find(path => path.endsWith('.js'))
  if (js) {
    const rejected = await request(js, 405, { method: 'POST' })
    expect(rejected.headers.get('allow') === 'GET, HEAD', `${js}: incorrect methods on a rejected POST`)
    if (server === 'Nginx') checkRevalidation(rejected, `${js} (405)`)
    // Workers Assets applies _headers by path. A POST response needs a matching
    // Content-Location to be reusable for GET or HEAD (RFC 9110, section 9.3.3).
    const location = rejected.headers.get('content-location')
    expect(!location || new URL(location, rejected.url).href !== rejected.url, `${js}: rejected POST identifies the bundle as its representation`)
    await rejected.body?.cancel()
  }
  if (server === 'Nginx' && js) {
    for (const headers of [{ 'If-Match': '"old-build"' }, { 'If-Unmodified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT' }]) {
      const precondition = await request(js, 412, { headers })
      checkRevalidation(precondition, `${js} (412)`)
      await precondition.body?.cancel()
    }
    const partial = await request(js, 206, { headers: { Range: 'bytes=0-7' } })
    const range = /^bytes 0-7\/(\d+)$/.exec(partial.headers.get('content-range') ?? '')
    expect(range && (await partial.arrayBuffer()).byteLength === 8, `${js}: invalid partial response`)
    checkRevalidation(partial, `${js} (206)`)
    if (range) {
      for (const method of ['GET', 'HEAD']) {
        const invalid = await request(js, 416, { method, headers: { Range: `bytes=${range[1]}-` } })
        expect(invalid.headers.get('content-range') === `bytes */${range[1]}`, `${js}: 416 must report the file size`)
        checkRevalidation(invalid, `${method} ${js} (416)`)
        expect(invalid.headers.get('access-control-allow-origin') === '*' && invalid.headers.get('cross-origin-resource-policy') === 'cross-origin' && invalid.headers.get('allow') === 'GET, HEAD', `${js}: incorrect headers on 416`)
        if (method === 'HEAD') expect(await invalid.text() === '', `${js}: 416 HEAD must be empty`)
        else await invalid.body?.cancel()
      }
    }
  }

  const assets = [
    ['/robots.txt', /text\/plain/],
    ['/sitemap.xml', /(?:application|text)\/xml/],
    ['/search-index.json', /application\/json/],
    ['/_nuxt/builds/latest.json', /application\/json/],
    ['/images/logo.png', /image\/png/],
    ['/examples/jma_tsunami/warning.json', /application\/json/],
    ['/zh/mc/_payload.json', /application\/json/],
    ['/ja/mc/rules/_payload.json', /application\/json/],
    ['/en/mc/vote/_payload.json', /application\/json/],
    ['/geiger/ui.css', /text\/css/],
    ['/geiger/main.js', /(?:application|text)\/javascript/],
  ]
  for (const [path, type] of assets) {
    const response = await request(path, 200, { method: 'HEAD' })
    expect(type.test(response.headers.get('content-type')), `${path}: incorrect asset content type`)
    expect(response.headers.get('access-control-allow-origin') === '*' && response.headers.get('cross-origin-resource-policy') === 'cross-origin', `${path}: missing public asset headers`)
    checkRevalidation(response, path)
  }

  for (const path of ['/mc/rules', '/en', '/zh', '/ipleak.html', '/geiger', '/geiger/', '/geiger/index.html']) {
    const html = await request(`${path}?source=delivery`)
    const body = await html.text()
    expect(/text\/html/.test(html.headers.get('content-type')) && /<html[\s>]/i.test(body), `${path}: expected HTML`)
    if (path.startsWith('/geiger'))
      expect(body.includes('/geiger/main.js'), `${path}: expected the station dashboard`)
    if (path === '/ipleak.html')
      expect(body.includes('RTCPeerConnection'), `${path}: expected the network diagnostic tool`)
    const head = await request(path, 200, { method: 'HEAD' })
    const etag = head.headers.get('etag')
    expect(etag && head.headers.get('content-type') === html.headers.get('content-type') && await head.text() === '', `HEAD ${path}: incorrect entity headers or body`)
    if (etag) {
      const conditional = await request(path, 304, { headers: { 'If-None-Match': etag } })
      expect(await conditional.text() === '', `${path}: 304 response contains a body`)
    }
  }

  for (const path of [
    ...['', '/zh', '/en'].flatMap(prefix => ['', '/', '.html', '/index', '/index/', '/index.html', '/_payload.json'].map(suffix => `${prefix}/docs/seisjs-api${suffix}`)),
    '/apidoc', '/apidoc.html', '/wsapi', '/seisapi.html', '/privacy_policy', '/privacy_policy.html', '/tos.html', '/donate.html',
    '/mc/rules.html', '/mc/join.html', '/mc/vote.html', '/mc/index.html', '/_headers', '/200', '/404', '/404.html',
    '/ipleak', '/ipleak/', '/en/index', '/404/index', '/nonexistent-path', '/_nuxt/missing-bundle.js',
  ]) {
    const response = await request(`${path}?source=delivery`, 404)
    const html = await response.text()
    expect(!response.headers.has('location'), `${path}: missing route unexpectedly redirects`)
    const head = await request(path, 404, { method: 'HEAD' })
    expect(!head.headers.has('location') && /text\/html/.test(head.headers.get('content-type')) && await head.text() === '', `HEAD ${path}: expected an empty 404 HTML response`)
    checkRevalidation(response, `${path} (404)`)
    expect(/<h1(?:\s[^>]*)?>[^<]+<\/h1>/.test(html) && /<a\b[^>]*href="\/"/.test(html), `${path}: missing a readable error heading or home link`)
    expect(/<meta name="robots" content="[^"]*noindex/.test(html), `${path}: missing robots noindex`)
    if (path === '/nonexistent-path') {
      for (const home of ['/', '/zh', '/en'])
        expect(html.includes(`href="${home}"`), `${path}: no static link to ${home}`)
      expect(!/<script\b[^>]*type="module"/.test(html), `${path}: the shared fallback must work without hydrating at the requested URL`)
    }
  }

  for (const [method, path, status] of [
    ['POST', '/en', 405], ['POST', '/en/', 405], ['POST', '/ipleak.html', 405], ['OPTIONS', '/images/logo.png', 405],
    ['POST', '/ipleak', 404], ['POST', '/donate.html', 404],
  ]) {
    const response = await request(path, status, { method })
    if (status === 405)
      expect(response.headers.get('allow') === 'GET, HEAD', `${method} ${path}: missing supported methods`)
    await response.body?.cancel()
  }

  const missingAsset = await request('/_nuxt/missing-bundle.js', 404, { method: 'HEAD' })
  const errorTag = missingAsset.headers.get('etag')
  if (errorTag) {
    const conditional = await request('/_nuxt/missing-bundle.js', 404, { headers: { 'If-None-Match': errorTag } })
    await conditional.body?.cancel()
  }

  if (failures.length)
    throw new Error(`${server}:\n${failures.map(message => `FAIL ${message}`).join('\n')}`)

  console.log(`PASS ${server}: ${pages.length} page routes, standalone tools, assets, query strings, conditional GET, HEAD, cache policies, and 404s.`)
}
