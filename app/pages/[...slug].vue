<script setup lang="ts">
import type { WolfxContentPage, WolfxLocale } from '~/types/site'

definePageMeta({ layout: false })

const siteOrigin = 'https://wolfx.jp'
const route = useRoute()
const { locale, loadLocaleMessages } = useI18n()
const { unlocalize } = usePublicPath()
const { isWolfxMc } = useSiteContext()

if (isWolfxMc.value && locale.value === 'ja')
  await loadLocaleMessages('zh')

const requestedPath = computed(() => {
  const routePath = route.path.replace(/\/$/, '') || '/'
  const pathLocale = routePath.match(/^\/(zh|en)(?=\/|$)/)?.[1] as WolfxLocale | undefined
  if (!pathLocale)
    return routePath === '/' ? '/ja' : `/ja${routePath}`
  return routePath
})

const { data: result } = await useAsyncData(
  () => `content-page:${requestedPath.value}`,
  async () => {
    const direct = await queryCollection('pages').path(requestedPath.value).first()
    if (direct)
      return { page: direct, isFallback: false }

    if (locale.value !== 'ja' && !isWolfxMc.value) {
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
const siteName = computed(() => isWolfxMc.value ? 'Wolfx Survival' : 'Wolfx Project')
const canonical = computed(() => new URL(canonicalPath.value, siteOrigin).toString())
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
  if (targetLocale === 'ja')
    return publicPath.value
  return `/${targetLocale}${publicPath.value === '/' ? '/' : publicPath.value}`
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
    href: new URL(alternatePath('ja'), siteOrigin).toString(),
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
      :class="{
        'landing-content': page.layout === 'landing',
        'mc-content': page.layout === 'mc',
      }"
    />
  </NuxtLayout>
</template>
