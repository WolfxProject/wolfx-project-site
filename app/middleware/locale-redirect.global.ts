export default defineNuxtRouteMiddleware((to) => {
  // Directory-based static servers append a slash. Normalize before hydration:
  // a catch-all route otherwise gains an extra empty slug segment, changing
  // NuxtLink active classes, document pagination, and client-side SEO URLs.
  const path = /^\/(?:zh|en)\/$/.test(to.path)
    ? to.path
    : to.path.replace(/\/+$/, '') || '/'
  if (path !== to.path)
    return navigateTo({ path, query: to.query, hash: to.hash }, { replace: true })

  if (import.meta.server)
    return

  const { localeRedirectTarget } = useLocaleRedirect()
  const target = localeRedirectTarget(to)
  if (target)
    return navigateTo(target, { replace: true })
})
