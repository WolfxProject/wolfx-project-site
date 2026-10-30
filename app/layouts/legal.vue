<script setup lang="ts">
import type { WolfxContentPage } from '~/types/site'

const props = defineProps<{
  page: WolfxContentPage
  isFallback?: boolean
}>()

const tocLinks = computed(() => (props.page.body.toc?.links ?? [])
  // Terms start with an introductory heading before the numbered sections.
  .filter(link => !link.text.includes('(TOS)'))
  .map(({ id, text, depth }) => ({ id, text, depth })))
</script>

<template>
  <div class="site-shell legal-layout">
    <SiteHeader />
    <div class="legal-grid">
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
      <aside class="docs-toc-wrap legal-toc-wrap">
        <DocsToc :links="tocLinks" />
      </aside>
    </div>
    <SiteFooter />
    <BackToTop />
  </div>
</template>
