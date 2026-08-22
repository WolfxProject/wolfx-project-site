import type { WolfxLocale } from '~/types/site'

export function useSiteContext() {
  const route = useRoute()
  const { locale } = useI18n()
  const { localize, unlocalize } = usePublicPath()

  const isWolfxMc = computed(() => {
    const path = unlocalize(route.path)
    return path === '/mc' || path.startsWith('/mc/')
  })

  const displayLocale = computed<WolfxLocale>(() => {
    if (!isWolfxMc.value)
      return locale.value as WolfxLocale
    if (/^\/ja(?:\/|$)/.test(route.path))
      return 'ja'
    if (/^\/en(?:\/|$)/.test(route.path))
      return 'en'
    return 'zh'
  })

  function sitePath(path: string) {
    return localize(path, displayLocale.value)
  }

  return {
    displayLocale,
    isWolfxMc,
    sitePath,
  }
}
