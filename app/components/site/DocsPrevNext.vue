<script setup lang="ts">
const route = useRoute()

const pages = useDocsNavigation()
const currentIndex = computed(() => pages.value.findIndex(page => page.to === route.path))
const previous = computed(() => currentIndex.value > 0 ? pages.value[currentIndex.value - 1] : undefined)
const next = computed(() => currentIndex.value >= 0 && currentIndex.value < pages.value.length - 1
  ? pages.value[currentIndex.value + 1]
  : undefined)
</script>

<template>
  <nav
    class="docs-prev-next"
    :aria-label="$t('docs.pagination')"
  >
    <NuxtLink
      v-if="previous"
      :to="previous.to"
      class="docs-prev-next__previous"
    >
      <span>{{ $t('docs.previous') }}</span>
      <strong><UIcon name="i-lucide-arrow-left" /> {{ previous.label }}</strong>
    </NuxtLink>
    <span v-else />
    <NuxtLink
      v-if="next"
      :to="next.to"
      class="docs-prev-next__next"
    >
      <span>{{ $t('docs.next') }}</span>
      <strong>{{ next.label }} <UIcon name="i-lucide-arrow-right" /></strong>
    </NuxtLink>
  </nav>
</template>
