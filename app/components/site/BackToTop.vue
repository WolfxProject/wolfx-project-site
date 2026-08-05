<script setup lang="ts">
const visible = ref(false)
const footerVisible = ref(false)
let footerObserver: IntersectionObserver | undefined

function onScroll() {
  visible.value = window.scrollY > 720
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  const footer = document.querySelector('.site-footer')
  if (footer) {
    footerObserver = new IntersectionObserver(([entry]) => {
      footerVisible.value = Boolean(entry?.isIntersecting)
    })
    footerObserver.observe(footer)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  footerObserver?.disconnect()
})
</script>

<template>
  <button
    v-show="visible && !footerVisible"
    class="back-to-top"
    type="button"
    :aria-label="$t('docs.backToTop')"
    :title="$t('docs.backToTop')"
    @click="backToTop"
  >
    <UIcon name="i-lucide-arrow-up" />
  </button>
</template>
