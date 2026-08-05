<script setup lang="ts">
import type { WolfxLocale } from '~/types/site'

const { locale, locales, t } = useI18n()
const route = useRoute()
const { localize, unlocalize } = usePublicPath()

const localeCode: Record<WolfxLocale, string> = {
  ja: 'JA',
  zh: '简',
  en: 'EN',
}

const activeLocale = computed(() => locales.value.find(item => item.code === locale.value))
const activeLocaleCode = computed(() => localeCode[locale.value as WolfxLocale])

async function changeLanguage(event: Event) {
  const target = (event.target as HTMLSelectElement).value as WolfxLocale
  if (import.meta.client)
    localStorage.setItem('wolfx-locale', target)
  await navigateTo(localize(unlocalize(route.path), target))
}
</script>

<template>
  <label
    class="language-select"
    :title="activeLocale?.name"
  >
    <span class="sr-only">{{ t('language.label') }}</span>
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
      :value="locale"
      :aria-label="t('language.label')"
      @change="changeLanguage"
    >
      <option
        v-for="item in locales"
        :key="item.code"
        :value="item.code"
      >
        {{ item.name }}
      </option>
    </select>
  </label>
</template>
