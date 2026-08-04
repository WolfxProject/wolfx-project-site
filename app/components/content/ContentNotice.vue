<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'info' | 'warning' | 'note' | 'danger'
  title?: string
}>(), {
  type: 'info',
  title: undefined,
})

const icon = computed(() => ({
  info: 'i-lucide-info',
  warning: 'i-lucide-triangle-alert',
  note: 'i-lucide-notebook-pen',
  danger: 'i-lucide-circle-alert',
}[props.type]))
</script>

<template>
  <aside
    class="content-notice site-container"
    :class="`content-notice--${type}`"
  >
    <UIcon :name="icon" />
    <div>
      <strong v-if="title">{{ title }}</strong>
      <slot />
    </div>
  </aside>
</template>
