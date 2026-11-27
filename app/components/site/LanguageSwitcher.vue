<script setup lang="ts">
import type { WolfxLocale } from '~/types/site'

const { locales } = useI18n()
const route = useRoute()
const error = useError()
const { localize, localizeWolfxMc, unlocalize } = usePublicPath()
const { displayLocale, isWolfxMc, tr } = useSiteContext()
// Keep the switcher inert until Vue can handle selection.
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

const localeCode: Record<WolfxLocale, string> = {
  ja: 'JA',
  zh: '简',
  en: 'EN',
}

const activeLocale = computed(() => locales.value.find(item => item.code === displayLocale.value))
const activeLocaleCode = computed(() => localeCode[displayLocale.value])

function translatedPath(target: WolfxLocale) {
  if (error.value)
    return localize('/', target)
  const path = unlocalize(route.path)
  return isWolfxMc.value
    ? localizeWolfxMc(path, target)
    : localize(path, target)
}

async function changeLanguage(event: Event) {
  const target = (event.target as HTMLSelectElement).value as WolfxLocale
  writeLocalePreference(target)
  await navigateTo(`${translatedPath(target)}${route.fullPath.slice(route.path.length)}`)
}
</script>

<template>
  <label
    class="language-select"
    :title="activeLocale?.name"
    :inert="!mounted"
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
        v-for="item in locales"
        :key="item.code"
        :value="item.code"
        :lang="item.language"
      >
        {{ item.name }}
      </option>
    </select>
  </label>
  <nav
    class="language-links"
    :aria-label="tr('language.label')"
  >
    <a
      v-for="item in locales"
      :key="item.code"
      :href="translatedPath(item.code)"
      :lang="item.language"
      :hreflang="item.language"
      :aria-current="item.code === displayLocale ? 'page' : undefined"
    >{{ item.name }}</a>
  </nav>
</template>
