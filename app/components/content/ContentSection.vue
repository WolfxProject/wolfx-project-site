<script setup lang="ts">
interface ContentSectionProps {
  width?: 'reading' | 'wide'
}

withDefaults(defineProps<ContentSectionProps>(), {
  width: 'reading',
})
</script>

<template>
  <section
    class="content-section content-prose"
    :class="[`content-section--${width}`, width === 'wide' ? 'site-container' : 'reading-container']"
  >
    <slot />
  </section>
</template>
