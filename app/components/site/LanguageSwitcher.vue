<script setup lang="ts">
import type { WolfxLocale } from '~/types/site'

const { locales, t } = useI18n()
const route = useRoute()
const { localize, localizeWolfxMc, unlocalize } = usePublicPath()
const { displayLocale, isWolfxMc } = useSiteContext()

const localeCode: Record<WolfxLocale, string> = {
  ja: 'JA',
  zh: '简',
  en: 'EN',
}

const visibleLocales = computed(() => {
  if (!isWolfxMc.value)
    return locales.value
  return locales.value
})
const activeLocale = computed(() => visibleLocales.value.find(item => item.code === displayLocale.value))
const activeLocaleCode = computed(() => localeCode[displayLocale.value])

function tr(key: string) {
  return t(key, {}, { locale: displayLocale.value })
}

async function changeLanguage(event: Event) {
  const target = (event.target as HTMLSelectElement).value as WolfxLocale
  if (import.meta.client)
    localStorage.setItem('wolfx-locale', target)
  const path = unlocalize(route.path)
  const targetPath = isWolfxMc.value
    ? localizeWolfxMc(path, target)
    : localize(path, target)
  if (isWolfxMc.value) {
    if (import.meta.client)
      window.location.assign(targetPath)
    return
  }
  await navigateTo(targetPath)
}
</script>

<template>
  <label
    class="language-select"
    :title="activeLocale?.name"
  >
    <span class="sr-only">{{ tr('language.label') }}</span>
    <UIcon name="i-lucide-languages" />
    <span
      class="language-select__code"
      aria-hidden="true"
    >{{ activeLocaleCode }}</span>
    <span
      class="language-select__name"
      aria-hidden="true"
    >{{ activeLocale?.name }}</span>
    <select
      :value="displayLocale"
      :aria-label="tr('language.label')"
      @change="changeLanguage"
    >
      <option
        v-for="item in visibleLocales"
        :key="item.code"
        :value="item.code"
      >
        {{ item.name }}
      </option>
    </select>
  </label>
</template>
