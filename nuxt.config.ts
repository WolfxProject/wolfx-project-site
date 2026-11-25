const siteUrl = 'https://wolfx.jp'

const locales = [
  { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json' },
  { code: 'zh', language: 'zh-CN', name: '简体中文', file: 'zh.json' },
  { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
] as const

const mainContentRoutes = [
  '/',
  '/projects',
  '/donate',
  '/docs/open-api',
  '/docs/websocket',
  '/docs/seisjs-api',
  '/legal/privacy',
  '/legal/terms',
]

const wolfxMcRouteFamilies = ['/mc', '/mc/rules', '/mc/join', '/mc/vote']

function contentPath(path: string, locale: string) {
  const defaultLocale = wolfxMcRouteFamilies.includes(path) ? 'zh' : 'ja'
  return locale === defaultLocale ? path : `/${locale}${path}`
}

const routeFamilies = [...mainContentRoutes, ...wolfxMcRouteFamilies]
const sitemaps = Object.fromEntries(locales.map(({ code, language }) => [
  language,
  {
    urls: routeFamilies.map(path => ({
      loc: contentPath(path, code),
      alternatives: [
        { hreflang: 'x-default', href: path },
        ...locales.map(locale => ({ hreflang: locale.code === 'zh' ? locale.language : locale.code, href: contentPath(path, locale.code) })),
      ],
    })),
  },
]))
const prerenderRoutes = [
  ...routeFamilies.flatMap(path => locales.map(locale => contentPath(path, locale.code))),
  ...wolfxMcRouteFamilies.map(path => `/zh${path}`),
]

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxt/eslint',
  ],
  $development: {
    devtools: { enabled: true },
  },
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#faf9fb' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#161923' },
      ],
      link: [
        { rel: 'icon', href: '/images/favicon.ico', sizes: 'any' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  site: {
    url: siteUrl,
    name: 'Wolfx Project',
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'wolfx-color-mode',
  },
  content: {
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
      },
    },
  },
  ui: {
    fonts: false,
  },
  routeRules: {
    '/404.html': { noScripts: true },
  },
  experimental: {
    prerenderErrorPages: [404],
  },
  compatibilityDate: '2026-08-04',
  nitro: {
    // Match the minimum supported Node.js major for prerendering and the default server build.
    esbuild: {
      options: { target: 'node22' },
    },
    prerender: {
      crawlLinks: true,
      routes: [...prerenderRoutes, '/404.html'],
      ignore: ['/sitemap.xml', '/__site-config__/debug.json', '/__sitemap__/debug.json'],
      failOnError: true,
    },
  },
  vite: {
    optimizeDeps: {
      rolldownOptions: {
        // Nuxt 4.6 scans module components before its #components transform runs.
        // Remove when upstream scanning handles this virtual import (nuxt/nuxt#36208).
        external: ['#components'],
      },
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  i18n: {
    baseUrl: siteUrl,
    defaultLocale: 'ja',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    langDir: 'locales',
    locales: [...locales],
  },
  icon: {
    provider: 'none',
    fallbackToApi: false,
    clientBundle: {
      scan: true,
      icons: [
        'lucide:arrow-left',
        'lucide:arrow-right',
        'lucide:arrow-up',
        'lucide:arrow-up-right',
        'lucide:audio-waveform',
        'lucide:box',
        'lucide:braces',
        'lucide:check',
        'lucide:circle-alert',
        'lucide:copy',
        'lucide:info',
        'lucide:languages',
        'lucide:menu',
        'lucide:monitor-cog',
        'lucide:moon',
        'lucide:move-horizontal',
        'lucide:notebook-pen',
        'lucide:panel-left',
        'lucide:radio-tower',
        'lucide:scale',
        'lucide:search',
        'lucide:shield-check',
        'lucide:sun',
        'lucide:triangle-alert',
        'lucide:x',
      ],
    },
  },
  sitemap: {
    autoI18n: false,
    sitemaps,
    excludeAppSources: true,
    zeroRuntime: true,
  },
})
