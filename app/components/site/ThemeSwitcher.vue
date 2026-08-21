<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()
const { displayLocale } = useSiteContext()
const modes = ['system', 'light', 'dark'] as const

const icon = computed(() => ({
  system: 'i-lucide-monitor-cog',
  light: 'i-lucide-sun',
  dark: 'i-lucide-moon',
}[colorMode.preference] ?? 'i-lucide-monitor-cog'))

function tr(key: string) {
  return t(key, {}, { locale: displayLocale.value })
}

function cycleTheme() {
  const current = modes.indexOf(colorMode.preference as typeof modes[number])
  colorMode.preference = modes[(current + 1) % modes.length] ?? 'system'
}
</script>

<template>
  <button
    class="icon-button"
    type="button"
    :aria-label="`${tr('theme.label')}: ${tr(`theme.${colorMode.preference}`)}`"
    :title="tr(`theme.${colorMode.preference}`)"
    @click="cycleTheme"
  >
    <UIcon :name="icon" />
  </button>
</template>
