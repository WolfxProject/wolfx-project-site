import type { WolfxLocale } from '~/types/site'

export function useSiteContext() {
  const route = useRoute()
  const { locale } = useI18n()
  const { localize, unlocalize } = usePublicPath()

  const isWolfxMc = computed(() => {
    const path = unlocalize(route.path)
    return path === '/mc' || path.startsWith('/mc/')
  })

  const displayLocale = computed<WolfxLocale>(() => isWolfxMc.value && locale.value === 'ja'
    ? 'zh'
    : locale.value as WolfxLocale)

  function sitePath(path: string) {
    return localize(path, displayLocale.value)
  }

  return {
    displayLocale,
    isWolfxMc,
    sitePath,
  }
}
