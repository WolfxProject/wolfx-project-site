<script setup lang="ts">
import type { WolfxContentPage, WolfxLocale } from '~/types/site'

definePageMeta({ layout: false })

const route = useRoute()
const { locale } = useI18n()
const { unlocalize } = usePublicPath()
const siteUrl = 'https://wolfx.jp'

const requestedPath = computed(() => {
  const routePath = route.path.replace(/\/$/, '') || '/'
  if (locale.value === 'ja')
    return routePath === '/' ? '/ja' : `/ja${routePath}`
  return routePath
})

const { data: result } = await useAsyncData(
  () => `content-page:${requestedPath.value}`,
  async () => {
    const direct = await queryCollection('pages').path(requestedPath.value).first()
    if (direct)
      return { page: direct, isFallback: false }

    if (locale.value !== 'ja') {
      const fallbackPath = unlocalize(route.path) === '/'
        ? '/ja'
        : `/ja${unlocalize(route.path)}`
      const fallback = await queryCollection('pages').path(fallbackPath).first()
      if (fallback)
        return { page: fallback, isFallback: true }
    }
    return null
  },
  { watch: [requestedPath] },
)

if (!result.value?.page) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  })
}

const page = computed(() => result.value!.page as unknown as WolfxContentPage)
const isFallback = computed(() => result.value?.isFallback ?? false)
const publicPath = computed(() => unlocalize(route.path))
const canonicalPath = computed(() => {
  if (locale.value === 'ja')
    return publicPath.value
  return `/${locale.value}${publicPath.value === '/' ? '/' : publicPath.value}`
})
const canonical = computed(() => new URL(canonicalPath.value, siteUrl).toString())
const pageTitle = computed(() => page.value.title.toLocaleLowerCase().includes('wolfx project')
  ? page.value.title
  : `${page.value.title} · Wolfx Project`)
const localeLanguage: Record<string, string> = {
  ja: 'ja-JP',
  zh: 'zh-CN',
  en: 'en-US',
}
const ogLocale: Record<string, string> = {
  ja: 'ja_JP',
  zh: 'zh_CN',
  en: 'en_US',
}

function alternatePath(targetLocale: WolfxLocale) {
  if (targetLocale === 'ja')
    return publicPath.value
  return `/${targetLocale}${publicPath.value === '/' ? '/' : publicPath.value}`
}

const structuredData = computed(() => {
  const common = {
    '@context': 'https://schema.org',
    'name': page.value.title,
    'description': page.value.description,
    'url': canonical.value,
    'inLanguage': localeLanguage[locale.value],
    'publisher': {
      '@type': 'Organization',
      'name': 'Wolfx Project',
      'url': siteUrl,
    },
  }
  if (page.value.layout === 'docs') {
    return {
      ...common,
      '@type': 'TechArticle',
      'headline': page.value.title,
      'dateModified': page.value.updated,
    }
  }
  if (page.value.layout === 'legal')
    return { ...common, '@type': 'WebPage', 'dateModified': page.value.updated }
  if (page.value.path.endsWith('/projects'))
    return { ...common, '@type': 'CollectionPage' }
  return { ...common, '@type': page.value.path.endsWith('/donate') ? 'WebPage' : 'WebSite' }
})

useSeoMeta({
  title: pageTitle,
  description: () => page.value.description,
  ogTitle: pageTitle,
  ogDescription: () => page.value.description,
  ogType: 'website',
  ogUrl: canonical,
  ogLocale: () => ogLocale[locale.value],
  ogSiteName: 'Wolfx Project',
  ogImage: `${siteUrl}/images/logo.png`,
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: () => page.value.description,
  twitterImage: `${siteUrl}/images/logo.png`,
})

useHead(() => ({
  htmlAttrs: { lang: localeLanguage[locale.value] },
  link: [
    { rel: 'canonical', href: canonical.value },
    { rel: 'alternate', hreflang: 'ja', href: new URL(alternatePath('ja'), siteUrl).toString() },
    { rel: 'alternate', hreflang: 'zh-CN', href: new URL(alternatePath('zh'), siteUrl).toString() },
    { rel: 'alternate', hreflang: 'en', href: new URL(alternatePath('en'), siteUrl).toString() },
    { rel: 'alternate', hreflang: 'x-default', href: new URL(alternatePath('ja'), siteUrl).toString() },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(structuredData.value),
    },
  ],
}))
</script>

<template>
  <NuxtLayout
    :name="page.layout"
    :page="page"
    :is-fallback="isFallback"
  >
    <ContentRenderer
      :value="page"
      class="content-body markdown-content"
      :class="{ 'landing-content': page.layout === 'landing' }"
    />
  </NuxtLayout>
</template>
