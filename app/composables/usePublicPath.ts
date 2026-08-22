import type { WolfxLocale } from '~/types/site'

export function usePublicPath() {
  const { locale } = useI18n()

  function localize(path: string, targetLocale: WolfxLocale = locale.value as WolfxLocale) {
    if (!path.startsWith('/') || path.startsWith('//'))
      return path

    const cleanPath = path.replace(/^\/(?:ja|zh|en)(?=\/|$)/, '') || '/'
    if (targetLocale === 'ja')
      return cleanPath
    return `/${targetLocale}${cleanPath === '/' ? '/' : cleanPath}`
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
