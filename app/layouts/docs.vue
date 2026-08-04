<script setup lang="ts">
import type { WolfxContentPage } from '~/types/site'

defineProps<{
  page: WolfxContentPage
  isFallback?: boolean
}>()
</script>

<template>
  <div class="site-shell docs-layout">
    <SiteHeader />
    <div
      v-if="isFallback"
      class="fallback-banner"
      role="status"
    >
      {{ $t('docs.fallback') }}
    </div>
    <div class="docs-mobile-nav">
      <details>
        <summary>
          <UIcon name="i-lucide-panel-left" />
          {{ $t('docs.navigation') }}
        </summary>
        <DocsSidebar />
      </details>
    </div>
    <div class="docs-grid">
      <aside class="docs-sidebar-wrap">
        <DocsSidebar />
      </aside>
      <main class="docs-main">
        <header class="document-header">
          <p class="eyebrow">
            WOLFX DOCUMENTATION
          </p>
          <h1>{{ page.title }}</h1>
          <p class="document-header__description">
            {{ page.description }}
          </p>
          <dl class="document-meta">
            <div v-if="page.updated">
              <dt>{{ $t('docs.updated') }}</dt>
              <dd><time :datetime="page.updated">{{ page.updated }}</time></dd>
            </div>
            <div v-if="page.version">
              <dt>{{ $t('docs.version') }}</dt>
              <dd>{{ page.version }}</dd>
            </div>
          </dl>
        </header>
        <article class="prose-document">
          <slot />
        </article>
        <DocsPrevNext />
      </main>
      <aside class="docs-toc-wrap">
        <DocsToc :links="page.body.toc?.links ?? []" />
      </aside>
    </div>
    <SiteFooter />
    <BackToTop />
  </div>
</template>
