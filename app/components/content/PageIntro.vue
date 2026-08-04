<script setup lang="ts">
defineProps<{ eyebrow: string, title: string }>()
</script>

<template>
  <section class="page-intro site-container">
    <p class="eyebrow">
      {{ eyebrow }}
    </p>
    <h1>{{ title }}</h1>
    <div><slot /></div>
  </section>
</template>
