<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()
const modes = ['system', 'light', 'dark'] as const

const icon = computed(() => ({
  system: 'i-lucide-monitor-cog',
  light: 'i-lucide-sun',
  dark: 'i-lucide-moon',
}[colorMode.preference] ?? 'i-lucide-monitor-cog'))

function cycleTheme() {
  const current = modes.indexOf(colorMode.preference as typeof modes[number])
  colorMode.preference = modes[(current + 1) % modes.length] ?? 'system'
}
</script>

<template>
  <button
    class="icon-button"
    type="button"
    :aria-label="`${t('theme.label')}: ${t(`theme.${colorMode.preference}`)}`"
    :title="t(`theme.${colorMode.preference}`)"
    @click="cycleTheme"
  >
    <UIcon :name="icon" />
  </button>
</template>
