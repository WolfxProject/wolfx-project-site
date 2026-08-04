<script setup lang="ts">
import type { WolfxContentPage } from '~/types/site'

defineProps<{
  page: WolfxContentPage
  isFallback?: boolean
}>()
</script>

<template>
  <div class="site-shell legal-layout">
    <SiteHeader />
    <main class="legal-main">
      <div
        v-if="isFallback"
        class="fallback-banner"
        role="status"
      >
        {{ $t('docs.fallback') }}
      </div>
      <header class="document-header legal-header">
        <p class="eyebrow">
          WOLFX LEGAL
        </p>
        <h1>{{ page.title }}</h1>
        <p>{{ page.description }}</p>
        <p
          v-if="page.updated"
          class="legal-updated"
        >
          {{ $t('docs.updated') }}: <time :datetime="page.updated">{{ page.updated }}</time>
        </p>
      </header>
      <article class="prose-document legal-document">
        <slot />
      </article>
    </main>
    <SiteFooter />
    <BackToTop />
  </div>
</template>
