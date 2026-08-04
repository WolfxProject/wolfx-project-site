<script setup lang="ts">
interface ExternalLinkProps {
  href: string
  label?: string
}

defineProps<ExternalLinkProps>()
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="external-link"
    :aria-label="label"
    :title="label"
  >
    <slot />
    <UIcon name="i-lucide-arrow-up-right" />
  </a>
</template>
