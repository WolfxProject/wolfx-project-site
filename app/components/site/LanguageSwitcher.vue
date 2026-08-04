<script setup lang="ts">
import type { WolfxLocale } from '~/types/site'

const { locale, locales, t } = useI18n()
const route = useRoute()
const { localize, unlocalize } = usePublicPath()

async function changeLanguage(event: Event) {
  const target = (event.target as HTMLSelectElement).value as WolfxLocale
  if (import.meta.client)
    localStorage.setItem('wolfx-locale', target)
  await navigateTo(localize(unlocalize(route.path), target))
}
</script>

<template>
  <label class="language-select">
    <span class="sr-only">{{ t('language.label') }}</span>
    <UIcon name="i-lucide-languages" />
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
