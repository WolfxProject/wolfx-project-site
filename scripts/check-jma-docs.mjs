import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const jmaProducts = ['jma_earthquake_detail', 'jma_tsunami', 'jma_special_eq']

// Source schemas are checked by content:audit. Here the same public identifiers
// must survive Nuxt Content rendering and static search-index generation.
export async function checkJmaDocs(root) {
  const searchIndex = JSON.parse(await readFile(join(root, 'public/search-index.json'), 'utf8'))
  for (const locale of ['ja', 'zh', 'en']) {
    const prefix = locale === 'ja' ? '' : `/${locale}`
    for (const document of ['open-api', 'websocket']) {
      const route = `${prefix}/docs/${document}`
      const entry = searchIndex.find(item => item.path === route && item.locale === locale)
      assert(entry, `${route}: missing search entry`)
      const html = await readFile(join(root, '.output/public', route, 'index.html'), 'utf8')
      const products = document === 'open-api' ? jmaProducts : jmaProducts.slice(1)
      for (const product of products) {
        const endpoint = document === 'open-api' ? `https://api.wolfx.jp/${product}.json` : `wss://ws-api.wolfx.jp/${product}`
        assert(entry.text.includes(endpoint), `${route}: missing search endpoint ${endpoint}`)
        assert(html.includes(endpoint), `${route}: missing generated endpoint ${endpoint}`)
      }
    }
  }
}
