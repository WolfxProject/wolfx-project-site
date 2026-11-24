<script setup lang="ts">
defineProps<{ title: string, href: string, icon: string }>()
</script>

<template>
  <NuxtLink
    :to="href"
    class="service-link"
  >
    <UIcon :name="icon" />
    <div class="service-link__copy">
      <strong>{{ title }}</strong>
      <div><slot /></div>
    </div>
    <UIcon name="i-lucide-arrow-right" />
  </NuxtLink>
</template>
