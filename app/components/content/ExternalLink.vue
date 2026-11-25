<script setup lang="ts">
defineProps<{ href: string }>()
const { t } = useI18n()
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="external-link"
    :title="t('donation.openExternal')"
  >
    <slot />
    <span class="sr-only">{{ t('donation.openExternal') }}</span>
    <UIcon name="i-lucide-arrow-up-right" />
  </a>
</template>
