import { legacyRedirects } from './generated-redirects'

function redirectTarget(pathname: string) {
  const normalized = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname
  return legacyRedirects[normalized]
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'GET' || request.method === 'HEAD') {
      const target = redirectTarget(url.pathname)
      if (target) {
        const location = new URL(target, url.origin)
        location.search = url.search
        return new Response(null, {
          status: 301,
          headers: { location: location.toString() },
        })
      }

      // These are the only canonical page URLs that intentionally retain a
      // trailing slash. Workers Assets otherwise uses drop-trailing-slash so
      // every content route matches the canonical URLs emitted by Nuxt.
      if (url.pathname === '/zh/' || url.pathname === '/en/') {
        const assetUrl = new URL(url)
        assetUrl.pathname = url.pathname.slice(0, -1)
        return env.ASSETS.fetch(new Request(assetUrl, request))
      }
    }
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
