interface LocaleRouteLocation {
  path: string
  fullPath: string
}

export function useLocaleRedirect() {
  const { localize, localizeWolfxMc, unlocalize } = usePublicPath()

  function localeRedirectTarget(to: LocaleRouteLocation): string | undefined {
    const publicPath = unlocalize(to.path)

    // A locale removed by unlocalize() means the visitor chose an explicit URL.
    if (publicPath !== to.path)
      return undefined

    const targetLocale = resolvePreferredLocale()
    const isWolfxMc = publicPath === '/mc' || publicPath.startsWith('/mc/')
    const targetPath = isWolfxMc
      ? localizeWolfxMc(publicPath, targetLocale)
      : localize(publicPath, targetLocale)

    if (targetPath === to.path)
      return undefined

    return `${targetPath}${to.fullPath.slice(to.path.length)}`
  }

  return { localeRedirectTarget }
}
