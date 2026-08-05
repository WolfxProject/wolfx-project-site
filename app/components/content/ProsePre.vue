<script setup lang="ts">
withDefaults(defineProps<{
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
}>(), {
  code: '',
  language: undefined,
  filename: undefined,
  highlights: () => [],
})
</script>

<template>
  <div class="code-block">
    <div class="code-block__header">
      <span v-if="filename || language">{{ filename ?? language }}</span>
    </div>
    <pre><slot /></pre>
    <CopyButton :value="code" />
  </div>
</template>
