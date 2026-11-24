<script setup lang="ts">
import type { WolfxLocale } from '~/types/site'

definePageMeta({
  layout: false,
  validate: route => !/^\/ja(?:\/|$)/.test(route.path) || /^\/ja\/mc(?:\/|$)/.test(route.path),
})

const siteOrigin = 'https://wolfx.jp'
const route = useRoute()
const { locale, loadLocaleMessages } = useI18n()
const { localize, localizeWolfxMc, unlocalize } = usePublicPath()
const { displayLocale, isWolfxMc } = useSiteContext()

if (isWolfxMc.value && displayLocale.value !== locale.value)
  await loadLocaleMessages(displayLocale.value)

const publicPath = computed(() => unlocalize(route.path).replace(/\/$/, '') || '/')
const requestedPath = computed(() => `/${displayLocale.value}${publicPath.value === '/' ? '' : publicPath.value}`)

const { data: result, error } = await useAsyncData(
  () => `content-page:${requestedPath.value}`,
  async () => {
    const direct = await queryCollection('pages').path(requestedPath.value).first()
    if (direct)
      return { page: direct, isFallback: false }

    if (displayLocale.value !== 'ja' && !isWolfxMc.value) {
      const fallbackPath = publicPath.value === '/' ? '/ja' : `/ja${publicPath.value}`
      const fallback = await queryCollection('pages').path(fallbackPath).first()
      if (fallback)
        return { page: fallback, isFallback: true }
    }
    return null
  },
)

if (error.value)
  throw createError({ statusCode: 500, statusMessage: 'Unable to load page', cause: error.value, fatal: true })

if (!result.value?.page) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  })
}

const page = computed(() => result.value!.page)
const isFallback = computed(() => result.value?.isFallback ?? false)
const siteName = computed(() => isWolfxMc.value ? 'Wolfx Survival' : 'Wolfx Project')
const canonical = computed(() => new URL(alternatePath(displayLocale.value), siteOrigin).toString())
const pageTitle = computed(() => page.value.title.toLocaleLowerCase().includes(siteName.value.toLocaleLowerCase())
  ? page.value.title
  : `${page.value.title} · ${siteName.value}`)
const localeLanguage: Record<WolfxLocale, string> = {
  ja: 'ja-JP',
  zh: 'zh-CN',
  en: 'en-US',
}
const ogLocale: Record<WolfxLocale, string> = {
  ja: 'ja_JP',
  zh: 'zh_CN',
  en: 'en_US',
}

function alternatePath(targetLocale: WolfxLocale) {
  if (isWolfxMc.value)
    return localizeWolfxMc(publicPath.value, targetLocale)
  return localize(publicPath.value, targetLocale)
}

const contentLocale = computed(() => page.value.sourceLocale ?? page.value.locale)
const availableLocales = computed<WolfxLocale[]>(() => page.value.availableLocales ?? ['ja', 'zh', 'en'])
const alternateLinks = computed(() => {
  const links = availableLocales.value.map((targetLocale) => {
    const hreflang = targetLocale === 'zh' ? 'zh-CN' : targetLocale
    return {
      rel: 'alternate' as const,
      hreflang,
      href: new URL(alternatePath(targetLocale), siteOrigin).toString(),
    }
  })
  links.push({
    rel: 'alternate' as const,
    hreflang: 'x-default',
    href: new URL(alternatePath(isWolfxMc.value ? 'zh' : 'ja'), siteOrigin).toString(),
  })
  return links
})

const structuredData = computed(() => {
  const common = {
    '@context': 'https://schema.org',
    'name': page.value.title,
    'description': page.value.description,
    'url': canonical.value,
    'inLanguage': localeLanguage[contentLocale.value],
    'publisher': {
      '@type': 'Organization',
      'name': 'Wolfx Project',
      'url': siteOrigin,
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
  if (page.value.layout === 'mc') {
    return {
      ...common,
      '@type': publicPath.value === '/mc' ? 'WebSite' : 'WebPage',
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
  ogLocale: () => ogLocale[contentLocale.value],
  ogSiteName: siteName,
  ogImage: `${siteOrigin}/images/logo.png`,
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: () => page.value.description,
  twitterImage: `${siteOrigin}/images/logo.png`,
})

useHead(() => ({
  htmlAttrs: {
    'lang': localeLanguage[contentLocale.value],
    'data-site': isWolfxMc.value ? 'wolfxmc' : 'main',
  },
  link: [
    { rel: 'canonical', href: canonical.value },
    ...alternateLinks.value,
  ],
  script: [
    {
      type: 'application/ld+json',
      textContent: JSON.stringify(structuredData.value).replaceAll('<', '\\u003c'),
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
      :class="{
        'landing-content': page.layout === 'landing',
        'mc-content': page.layout === 'mc',
      }"
    />
  </NuxtLayout>
</template>
