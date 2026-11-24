<script setup lang="ts">
const props = defineProps<{ headingTag?: 'h2' | 'h3' }>()
provide('projectCardHeading', computed(() => props.headingTag ?? 'h3'))
</script>

<template>
  <div class="project-grid site-container">
    <slot />
  </div>
</template>
