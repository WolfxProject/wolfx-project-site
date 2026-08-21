<script setup lang="ts">
defineProps<{
  title: string
  tag: string
}>()
</script>

<template>
  <article class="mc-feature">
    <span class="mc-feature__tag">{{ tag }}</span>
    <h3>{{ title }}</h3>
    <div><slot /></div>
  </article>
</template>
