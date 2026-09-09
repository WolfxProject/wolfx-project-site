export default defineNuxtPlugin(() => {
  const { localeRedirectTarget } = useLocaleRedirect()
  const path = window.location.pathname
  const target = localeRedirectTarget({
    path,
    fullPath: `${path}${window.location.search}${window.location.hash}`,
  })

  if (target)
    window.location.replace(target)
})
