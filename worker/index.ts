export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname.endsWith('.html')) {
      url.pathname = '/.not-found'
      return env.ASSETS.fetch(new Request(url, request))
    }
    if ((request.method === 'GET' || request.method === 'HEAD') && (url.pathname === '/zh/' || url.pathname === '/en/')) {
      url.pathname = url.pathname.slice(0, -1)
      return env.ASSETS.fetch(new Request(url, request))
    }
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
