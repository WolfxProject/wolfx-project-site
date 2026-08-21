import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    pages: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        locale: z.enum(['ja', 'zh', 'en']),
        layout: z.enum(['landing', 'docs', 'legal', 'mc']),
        description: z.string(),
        sourceLocale: z.enum(['ja', 'zh', 'en']).optional(),
        availableLocales: z.array(z.enum(['ja', 'zh', 'en'])).optional(),
        updated: z.string().optional(),
        version: z.string().optional(),
        source: z.string().optional(),
      }),
    }),
  },
})
