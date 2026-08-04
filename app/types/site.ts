export type WolfxLocale = 'ja' | 'zh' | 'en'
export type WolfxLayout = 'landing' | 'docs' | 'legal'

export interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

export interface WolfxContentPage {
  id: string
  path: string
  title: string
  description: string
  locale: WolfxLocale
  layout: WolfxLayout
  updated?: string
  version?: string
  source?: string
  body: {
    toc?: {
      links?: TocLink[]
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}
