import { legacyRedirects } from './generated-redirects'
import {
  isWolfxMcInternalPath,
  toWolfxMcInternalPath,
  toWolfxMcPublicPath,
  WOLFX_MC_HOSTNAME,
} from '../data/site-identities'

function redirectTarget(pathname: string) {
  const normalized = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname
  return legacyRedirects[normalized]
}

function redirect(location: URL) {
  return new Response(null, {
    status: 301,
    headers: { location: location.toString() },
  })
}

function isSharedAssetPath(pathname: string) {
  return [
    '/_nuxt/',
    '/_i18n/',
    '/__nuxt_content/',
    '/images/',
  ].some(prefix => pathname.startsWith(prefix))
  || pathname === '/search-index.json'
  || /^\/(?:zh\/|en\/)?mc(?:\/[^/]+)*\/_payload\.json$/.test(pathname)
}

function wolfxMcAssetPath(pathname: string) {
  if (pathname === '/robots.txt')
    return '/mc-robots.txt'
  if (pathname === '/sitemap.xml' || pathname === '/sitemap_index.xml')
    return '/mc-sitemap.xml'
  if (isSharedAssetPath(pathname))
    return pathname
  const internalPath = toWolfxMcInternalPath(pathname)
  // Chinese was the archived site's unprefixed default. The shared Nuxt app
  // uses Japanese as its default locale, so mount unprefixed MC requests on
  // the real Chinese locale tree to ensure its lazy-loaded UI messages match.
  return internalPath.startsWith('/mc') ? `/zh${internalPath}` : internalPath
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'GET' || request.method === 'HEAD') {
      const isWolfxMc = url.hostname === WOLFX_MC_HOSTNAME
      const assetPath = isWolfxMc ? wolfxMcAssetPath(url.pathname) : url.pathname
      const redirectPath = isWolfxMc ? toWolfxMcInternalPath(url.pathname) : assetPath
      const target = redirectTarget(redirectPath)
      if (target) {
        const publicTarget = isWolfxMc && isWolfxMcInternalPath(target)
          ? toWolfxMcPublicPath(target)
          : target
        const location = new URL(publicTarget, url.origin)
        location.search = url.search
        return redirect(location)
      }

      if (isWolfxMc) {
        if (url.pathname === '/zh' || url.pathname === '/en') {
          const location = new URL(url)
          location.pathname = `${url.pathname}/`
          return redirect(location)
        }
        if (url.pathname.length > 1 && url.pathname.endsWith('/') && url.pathname !== '/zh/' && url.pathname !== '/en/') {
          const location = new URL(url)
          location.pathname = url.pathname.slice(0, -1)
          return redirect(location)
        }

        const assetUrl = new URL(url)
        assetUrl.pathname = assetPath
        return env.ASSETS.fetch(new Request(assetUrl, request))
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
