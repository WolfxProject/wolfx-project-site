<script setup lang="ts">
const { t } = useI18n()
const scroller = useTemplateRef<HTMLElement>('scroller')
const hasOverflow = ref(false)
const isAtEnd = ref(false)
let resizeObserver: ResizeObserver | undefined

function updateScrollState() {
  const element = scroller.value
  if (!element)
    return
  hasOverflow.value = element.scrollWidth > element.clientWidth + 1
  isAtEnd.value = !hasOverflow.value || element.scrollLeft + element.clientWidth >= element.scrollWidth - 2
}

onMounted(() => {
  updateScrollState()
  resizeObserver = new ResizeObserver(updateScrollState)
  if (scroller.value)
    resizeObserver.observe(scroller.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div
    class="table-frame"
    :class="{
      'table-frame--overflow': hasOverflow,
      'table-frame--end': isAtEnd,
    }"
  >
    <p
      class="table-scroll__hint"
      aria-hidden="true"
    >
      <UIcon name="i-lucide-move-horizontal" />
      {{ t('docs.tableScroll') }}
    </p>
    <div
      ref="scroller"
      class="table-scroll"
      :tabindex="hasOverflow ? 0 : undefined"
      :role="hasOverflow ? 'region' : undefined"
      :aria-label="hasOverflow ? t('docs.tableScroll') : undefined"
      @scroll.passive="updateScrollState"
    >
      <table><slot /></table>
    </div>
  </div>
</template>
