<script setup lang="ts">
const { localize } = usePublicPath()
const route = useRoute()

const pages = computed(() => [
  { title: 'Wolfx Open API', path: localize('/docs/open-api') },
  { title: 'WebSocket API', path: localize('/docs/websocket') },
  { title: 'SeisJS API', path: localize('/docs/seisjs-api') },
])
const currentIndex = computed(() => pages.value.findIndex(page => page.path === route.path))
const previous = computed(() => currentIndex.value > 0 ? pages.value[currentIndex.value - 1] : undefined)
const next = computed(() => currentIndex.value >= 0 && currentIndex.value < pages.value.length - 1
  ? pages.value[currentIndex.value + 1]
  : undefined)
</script>

<template>
  <nav
    class="docs-prev-next"
    aria-label="Pagination"
  >
    <NuxtLink
      v-if="previous"
      :to="previous.path"
      class="docs-prev-next__previous"
    >
      <span>{{ $t('docs.previous') }}</span>
      <strong><UIcon name="i-lucide-arrow-left" /> {{ previous.title }}</strong>
    </NuxtLink>
    <span v-else />
    <NuxtLink
      v-if="next"
      :to="next.path"
      class="docs-prev-next__next"
    >
      <span>{{ $t('docs.next') }}</span>
      <strong>{{ next.title }} <UIcon name="i-lucide-arrow-right" /></strong>
    </NuxtLink>
  </nav>
</template>
