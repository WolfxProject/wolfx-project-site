export type SiteLocale = 'ja' | 'zh' | 'en'

export const MAIN_SITE_ORIGIN = 'https://wolfx.jp'
export const WOLFX_MC_ORIGIN = 'https://mc.wolfx.jp'
export const WOLFX_MC_HOSTNAME = 'mc.wolfx.jp'

interface SplitPath {
  locale: SiteLocale
  localPath: string
}

function normalizePath(pathname: string) {
  if (!pathname.startsWith('/'))
    return `/${pathname}`
  return pathname || '/'
}

export function splitLocalePath(pathname: string): SplitPath {
  const normalized = normalizePath(pathname)
  const match = normalized.match(/^\/(zh|en)(?=\/|$)/)
  if (!match)
    return { locale: 'ja', localPath: normalized }

  return {
    locale: match[1] as SiteLocale,
    localPath: normalized.slice(match[0].length) || '/',
  }
}

function localePrefix(locale: SiteLocale) {
  return locale === 'ja' ? '' : `/${locale}`
}

export function isWolfxMcInternalPath(pathname: string) {
  const { localPath } = splitLocalePath(pathname)
  return localPath === '/mc' || localPath.startsWith('/mc/')
}

export function toWolfxMcInternalPath(pathname: string) {
  const normalized = normalizePath(pathname)
  if (isWolfxMcInternalPath(normalized))
    return normalized.replace(/\/$/, '') || '/'

  const { locale, localPath } = splitLocalePath(normalized)
  const suffix = localPath === '/' ? '' : localPath
  return `${localePrefix(locale)}/mc${suffix}`
}

export function toWolfxMcPublicPath(pathname: string, targetLocale?: SiteLocale) {
  const { locale: pathLocale, localPath } = splitLocalePath(pathname)
  const locale = targetLocale ?? pathLocale
  const suffix = localPath === '/mc'
    ? '/'
    : localPath.startsWith('/mc/')
      ? localPath.slice(3)
      : localPath
  const prefix = localePrefix(locale)

  if (suffix === '/')
    return prefix ? `${prefix}/` : '/'
  return `${prefix}${suffix}`
}

export function wolfxMcUrl(pathname: string, targetLocale?: SiteLocale) {
  return new URL(toWolfxMcPublicPath(pathname, targetLocale), WOLFX_MC_ORIGIN).toString()
}
