<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
  }
}>()

const { t } = useI18n()

useSeoMeta({
  title: () => `${props.error.statusCode ?? 404} · Wolfx Project`,
  robots: 'noindex,follow',
})
</script>

<template>
  <div class="site-shell error-page">
    <SiteHeader />
    <main class="error-page__main">
      <p class="eyebrow">
        {{ error.statusCode ?? 404 }}
      </p>
      <h1>{{ t('error.title') }}</h1>
      <p>{{ t('error.description') }}</p>
      <UButton
        to="/"
        icon="i-lucide-arrow-left"
      >
        {{ t('error.home') }}
      </UButton>
    </main>
    <SiteFooter />
  </div>
</template>
