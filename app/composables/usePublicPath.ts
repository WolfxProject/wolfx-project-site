import type { WolfxLocale } from '~/types/site'

export function usePublicPath() {
  function localize(path: string, targetLocale?: WolfxLocale) {
    if (!path.startsWith('/') || path.startsWith('//'))
      return path

    const locale = targetLocale ?? useI18n().locale.value as WolfxLocale
    const cleanPath = path.replace(/^\/(?:ja|zh|en)(?=\/|$)/, '') || '/'
    if (locale === 'ja')
      return cleanPath
    return `/${locale}${cleanPath === '/' ? '/' : cleanPath}`
  }

  function localizeWolfxMc(path: string, targetLocale: WolfxLocale, explicitChinese = false) {
    if (!path.startsWith('/') || path.startsWith('//'))
      return path

    const cleanPath = path.replace(/^\/(?:ja|zh|en)(?=\/|$)/, '') || '/'
    if (targetLocale === 'zh')
      return explicitChinese ? `/zh${cleanPath}` : cleanPath
    return `/${targetLocale}${cleanPath}`
  }

  function unlocalize(path: string) {
    return path.replace(/^\/(?:ja|zh|en)(?=\/|$)/, '') || '/'
  }

  return { localize, localizeWolfxMc, unlocalize }
}
