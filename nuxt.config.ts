import legacyRedirects from './data/legacy-redirects.json'

const siteUrl = 'https://wolfx.jp'

const contentRoutes = [
  '/',
  '/projects',
  '/donate',
  '/docs/open-api',
  '/docs/websocket',
  '/docs/seisjs-api',
  '/legal/privacy',
  '/legal/terms',
]

const localizedRoutes = [
  ...contentRoutes,
  ...contentRoutes.flatMap(path => [`/zh${path}`, `/en${path}`]),
]

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    './modules/static-sitemap-alias',
    '@nuxt/eslint',
  ],
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#f4f7f8' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#081012' },
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
  routeRules: Object.fromEntries(
    Object.entries(legacyRedirects).map(([path, target]) => [
      path,
      { redirect: { to: target, statusCode: 301 } },
    ]),
  ),
  compatibilityDate: '2026-08-04',
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [...localizedRoutes, '/404.html'],
      ignore: ['/sitemap.xml', '/__site-config__/debug.json', '/__sitemap__/debug.json'],
      failOnError: true,
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
    locales: [
      { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json' },
      { code: 'zh', language: 'zh-CN', name: '简体中文', file: 'zh.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
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
    urls: localizedRoutes,
    autoLastmod: true,
  },
})
