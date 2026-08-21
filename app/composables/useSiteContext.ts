import type { WolfxLocale } from '~/types/site'
import {
  isWolfxMcInternalPath,
  MAIN_SITE_ORIGIN,
  toWolfxMcInternalPath,
  WOLFX_MC_HOSTNAME,
  wolfxMcUrl,
} from '~~/data/site-identities'

export function useSiteContext() {
  const route = useRoute()
  const { locale } = useI18n()
  const { localize } = usePublicPath()

  const isWolfxMc = computed(() => {
    if (isWolfxMcInternalPath(route.path))
      return true
    if (!import.meta.client)
      return false
    return window.location.hostname === WOLFX_MC_HOSTNAME
      || document.documentElement.dataset.site === 'wolfxmc'
  })

  const internalPath = computed(() => isWolfxMc.value
    ? toWolfxMcInternalPath(route.path)
    : route.path)

  const displayLocale = computed<WolfxLocale>(() => isWolfxMc.value && locale.value === 'ja'
    ? 'zh'
    : locale.value as WolfxLocale)

  function mainSiteUrl(path: string) {
    const localized = localize(path, displayLocale.value)
    return isWolfxMc.value
      ? new URL(localized, MAIN_SITE_ORIGIN).toString()
      : localized
  }

  function mcSiteUrl(targetLocale?: WolfxLocale) {
    return wolfxMcUrl(internalPath.value, targetLocale)
  }

  return {
    displayLocale,
    internalPath,
    isWolfxMc,
    mainSiteUrl,
    mcSiteUrl,
  }
}
