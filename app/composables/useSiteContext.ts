import type { WolfxLocale } from '~/types/site'

export function useSiteContext() {
  const route = useRoute()
  const { t } = useI18n()
  const { localize, unlocalize } = usePublicPath()

  const isWolfxMc = computed(() => {
    const path = unlocalize(route.path)
    return path === '/mc' || path.startsWith('/mc/')
  })

  const displayLocale = computed<WolfxLocale>(() => {
    const prefix = route.path.split('/')[1]
    if (prefix === 'ja' || prefix === 'zh' || prefix === 'en')
      return prefix
    return isWolfxMc.value ? 'zh' : 'ja'
  })

  function sitePath(path: string) {
    return localize(path, displayLocale.value)
  }

  function tr(key: string, values: Record<string, string | number> = {}) {
    return t(key, values, { locale: displayLocale.value })
  }

  return {
    displayLocale,
    isWolfxMc,
    sitePath,
    tr,
  }
}
