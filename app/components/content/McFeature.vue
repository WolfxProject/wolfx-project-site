<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <article class="mc-feature">
    <h3>{{ title }}</h3>
    <div><slot /></div>
  </article>
</template>
