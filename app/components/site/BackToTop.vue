<script setup lang="ts">
const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 720
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <button
    v-show="visible"
    class="back-to-top"
    type="button"
    :aria-label="$t('docs.backToTop')"
    :title="$t('docs.backToTop')"
    @click="backToTop"
  >
    <UIcon name="i-lucide-arrow-up" />
  </button>
</template>
