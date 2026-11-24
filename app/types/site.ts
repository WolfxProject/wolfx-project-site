import type { Collections } from '@nuxt/content'

export type WolfxContentPage = Collections['pages']
export type WolfxLocale = WolfxContentPage['locale']
export type TocLink = NonNullable<WolfxContentPage['body']['toc']>['links'][number]
