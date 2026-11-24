// Workers Assets resolves HTML using extensionless paths. Keep the published
// entry points of the standalone tools and the localized home pages intact.
const publicHtml = new Map([
  ['/zh/', '/zh'],
  ['/en/', '/en'],
  ['/geiger/', '/geiger'],
  ['/geiger/index.html', '/geiger'],
  ['/ipleak.html', '/ipleak'],
])

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    const asset = publicHtml.get(url.pathname)
    if (asset) {
      url.pathname = asset
      return env.ASSETS.fetch(new Request(url, request))
    }

    // The asset-first router has already served matching files. Fetch the
    // generated error page under its own cache policy, even for missing JS.
    // Conditional headers for a missing resource do not apply to this body.
    const method = request.method === 'HEAD' ? 'HEAD' : 'GET'
    const errorPage = await env.ASSETS.fetch(new Request(new URL('/404', url), { method }))
    return new Response(errorPage.body, { status: 404, headers: errorPage.headers })
  },
} satisfies ExportedHandler<Env>
