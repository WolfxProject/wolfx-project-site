<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
  }
}>()

const { sitePath, tr } = useSiteContext()
const isMissing = computed(() => props.error.statusCode === 404)
// Static hosts serve this one document at missing URLs in every language.
const staticFallback = import.meta.prerender && isMissing.value
const { locales, loadLocaleMessages, t } = useI18n()
const { localize } = usePublicPath()
if (staticFallback)
  await Promise.all(locales.value.map(({ code }) => loadLocaleMessages(code)))

useSeoMeta({
  title: () => `${props.error.statusCode ?? 500} · Wolfx Project`,
  robots: 'noindex,follow',
})
</script>

<template>
  <main
    v-if="staticFallback"
    id="main-content"
    class="site-container static-error"
    tabindex="-1"
  >
    <p class="eyebrow">
      Wolfx Project
    </p>
    <h1>404</h1>
    <div class="static-error__languages">
      <section
        v-for="item in locales"
        :key="item.code"
        :lang="item.language"
      >
        <h2>{{ t('error.title', {}, { locale: item.code }) }}</h2>
        <p>{{ t('error.description', {}, { locale: item.code }) }}</p>
        <a
          :href="localize('/', item.code)"
          :hreflang="item.language"
        >{{ t('error.home', {}, { locale: item.code }) }}</a>
      </section>
    </div>
  </main>
  <div
    v-else
    class="site-shell error-page"
  >
    <SiteHeader />
    <main
      id="main-content"
      class="error-page__main"
      tabindex="-1"
    >
      <p class="eyebrow">
        {{ error.statusCode ?? 500 }}
      </p>
      <h1>{{ tr(isMissing ? 'error.title' : 'error.unavailable') }}</h1>
      <p>{{ tr(isMissing ? 'error.description' : 'error.retry') }}</p>
      <UButton
        :to="sitePath('/')"
        icon="i-lucide-arrow-left"
      >
        {{ tr('error.home') }}
      </UButton>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.static-error { padding-block: clamp(2rem, 9vh, 7rem); }
.static-error h1 { margin: 0; font-size: clamp(3rem, 10vw, 6rem); line-height: 1.1; }
.static-error__languages { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); gap: 2rem; margin-top: 2rem; }
.static-error section { border-top: 1px solid var(--wolfx-line); padding-top: 1rem; }
.static-error h2 { margin: 0; font-size: 1.25rem; }
.static-error section p { margin-block: .5rem; color: var(--wolfx-muted); }
.static-error a { display: inline-block; padding-block: .5rem; color: var(--wolfx-accent); text-decoration: underline; text-underline-offset: .2em; }
</style>
