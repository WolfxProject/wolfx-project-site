import type { WolfxLocale } from '~/types/site'

const localeStorageKey = 'wolfx-locale'

function asWolfxLocale(value: string | null): WolfxLocale | undefined {
  if (value === 'ja' || value === 'zh' || value === 'en')
    return value
  return undefined
}

export function readLocalePreference(): WolfxLocale | undefined {
  if (!import.meta.client)
    return undefined

  try {
    return asWolfxLocale(localStorage.getItem(localeStorageKey))
  }
  catch {
    return undefined
  }
}

export function writeLocalePreference(locale: WolfxLocale) {
  if (!import.meta.client)
    return

  try {
    localStorage.setItem(localeStorageKey, locale)
  }
  catch {
    // Language navigation must still work when storage is unavailable.
  }
}
