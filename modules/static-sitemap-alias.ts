import { defineNuxtModule } from 'nuxt/kit'
import { rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineNuxtModule({
  meta: {
    name: 'static-sitemap-alias',
  },
  setup(_options, nuxt) {
    let publicDir = join(nuxt.options.rootDir, '.output/public')

    nuxt.hook('nitro:init', (nitro) => {
      publicDir = nitro.options.output.publicDir
    })

    nuxt.hook('sitemap:prerender:done', async ({ sitemaps }) => {
      const sitemapIndex = sitemaps.find(sitemap => sitemap.name === '/sitemap_index.xml')
      if (!sitemapIndex)
        throw new Error('The generated sitemap index is missing; cannot publish /sitemap.xml')

      const sitemapPath = join(publicDir, 'sitemap.xml')
      await rm(sitemapPath, { recursive: true, force: true })
      await writeFile(sitemapPath, sitemapIndex.content, 'utf8')
    })
  },
})
