<script setup lang="ts">
defineProps<{ id?: string }>()
</script>

<template>
  <h2
    :id="id"
    class="anchored-heading"
  >
    <a
      v-if="id"
      :href="`#${id}`"
      aria-hidden="true"
      tabindex="-1"
    >#</a>
    <slot />
  </h2>
</template>
