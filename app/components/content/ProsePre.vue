<script setup lang="ts">
const props = withDefaults(defineProps<{
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

const caption = computed(() => props.filename || (props.language === 'text' ? undefined : props.language))
</script>

<template>
  <div
    class="code-block"
    :class="{ 'code-block--plain': !caption }"
  >
    <div
      v-if="caption"
      class="code-block__header"
    >
      {{ caption }}
    </div>
    <pre><slot /></pre>
    <CopyButton :value="code" />
  </div>
</template>
