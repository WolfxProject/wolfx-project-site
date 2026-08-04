<script setup lang="ts">
withDefaults(defineProps<{
  address: string
  method?: 'GET' | 'POST' | 'WSS' | 'WS'
  label?: string
}>(), {
  method: 'GET',
  label: undefined,
})
</script>

<template>
  <div class="api-endpoint">
    <span class="api-endpoint__method">{{ method }}</span>
    <div>
      <small v-if="label">{{ label }}</small>
      <code>{{ address }}</code>
    </div>
    <CopyButton :value="address" />
  </div>
</template>
