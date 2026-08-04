<script setup lang="ts">
defineProps<{ title: string, href: string, icon: string }>()
</script>

<template>
  <NuxtLink
    :to="href"
    class="service-link"
  >
    <UIcon :name="icon" />
    <span>
      <strong>{{ title }}</strong>
      <span><slot /></span>
    </span>
    <UIcon name="i-lucide-arrow-right" />
  </NuxtLink>
</template>
