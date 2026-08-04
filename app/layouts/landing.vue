<script setup lang="ts">
import type { WolfxContentPage } from '~/types/site'

defineProps<{
  page: WolfxContentPage
  isFallback?: boolean
}>()
</script>

<template>
  <div class="site-shell landing-layout">
    <SiteHeader />
    <main>
      <div
        v-if="isFallback"
        class="fallback-banner"
        role="status"
      >
        {{ $t('docs.fallback') }}
      </div>
      <slot />
    </main>
    <SiteFooter />
    <BackToTop />
  </div>
</template>
