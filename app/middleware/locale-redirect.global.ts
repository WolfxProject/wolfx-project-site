export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server)
    return

  const { localeRedirectTarget } = useLocaleRedirect()
  const target = localeRedirectTarget(to)
  if (target)
    return navigateTo(target, { replace: true })
})
