import type { WolfxLocale } from '~/types/site'

const localeStorageKey = 'wolfx-locale'
const fallbackLocale: WolfxLocale = 'ja'

function asWolfxLocale(value: string | null): WolfxLocale | undefined {
  if (value === 'ja' || value === 'zh' || value === 'en')
    return value
  return undefined
}

function localeFromLanguageTag(languageTag: string): WolfxLocale | undefined {
  const language = languageTag.trim().toLowerCase().split(/[-_]/, 1)[0]
  return asWolfxLocale(language ?? null)
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

export function detectBrowserLocale(): WolfxLocale {
  if (!import.meta.client)
    return fallbackLocale

  let languageTags: readonly string[] = []
  try {
    if (navigator.languages?.length)
      languageTags = navigator.languages
  }
  catch {
    // Fall through to navigator.language when languages is unavailable.
  }

  if (!languageTags.length) {
    try {
      if (navigator.language)
        languageTags = [navigator.language]
    }
    catch {
      return fallbackLocale
    }
  }

  for (const languageTag of languageTags) {
    const locale = localeFromLanguageTag(languageTag)
    if (locale)
      return locale
  }
  return fallbackLocale
}

export function resolvePreferredLocale(): WolfxLocale {
  return readLocalePreference() ?? detectBrowserLocale()
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
