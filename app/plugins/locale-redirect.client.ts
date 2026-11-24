export default defineNuxtPlugin((nuxtApp) => {
  const locale = readLocalePreference()
  if (!locale || nuxtApp.payload.error)
    return

  const { pathname, search, hash } = window.location
  const { localize, localizeWolfxMc, unlocalize } = usePublicPath()
  if (unlocalize(pathname) !== pathname)
    return

  const target = pathname === '/mc' || pathname.startsWith('/mc/')
    ? localizeWolfxMc(pathname, locale)
    : localize(pathname, locale)
  if (target !== pathname)
    window.location.replace(`${target}${search}${hash}`)
})
