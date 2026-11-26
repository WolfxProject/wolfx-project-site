import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { wolfxMc } from '../data/wolfxmc.ts'
import { parsePage } from './content-markdown.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'content')
const outputFile = path.join(root, 'public/search-index.json')
const locales = ['ja', 'zh', 'en']

const inlineContainers = new Set(['heading', 'paragraph', 'tableCell', 'strong', 'emphasis', 'delete', 'link'])
const visibleProp = /^(?:(?:.*-)?(?:title|label|description)|address|action|network|method)$/

function searchableContent(tree) {
  const headings = []
  function textOf(node) {
    if (node.type === 'html' || node.type === 'definition')
      return ''
    if (typeof node.value === 'string')
      return node.value
    if (node.type === 'image')
      return node.alt || ''
    if (node.name === 'mc-vote-links')
      return wolfxMc.voteLinks.map(([name]) => name).join(' ')
    const children = (node.children || []).map(textOf)
    const text = children.join(inlineContainers.has(node.type) ? '' : ' ')
    if (node.type === 'heading' && node.depth > 1) {
      headings.push(text.trim())
      return ''
    }
    if (node.type === 'link' && text !== node.url)
      return `${text} ${node.url}`
    if (node.attributes) {
      const labels = Object.entries(node.attributes)
        .filter(([key, value]) => visibleProp.test(key) && typeof value === 'string')
        .map(([, value]) => value)
      return [...labels, text].join(' ')
    }
    return text
  }
  const text = textOf(tree).replace(/\s+/g, ' ').trim()
  return { headings, text }
}

function publicPath(locale, relativeFile) {
  const route = relativeFile.replace(/\.md$/, '').replace(/(^|\/)index$/, '')
  const isWolfxMc = route === 'mc' || route.startsWith('mc/')
  let prefix = `/${locale}`
  if ((isWolfxMc && locale === 'zh') || (!isWolfxMc && locale === 'ja'))
    prefix = ''
  return route ? `${prefix}/${route}` : prefix || '/'
}

async function markdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory())
      files.push(...await markdownFiles(absolute))
    else if (entry.isFile() && entry.name.endsWith('.md'))
      files.push(absolute)
  }
  return files
}

const searchEntries = []
for (const locale of locales) {
  const localeRoot = path.join(contentRoot, locale)
  for (const file of (await markdownFiles(localeRoot)).sort()) {
    const markdown = await fs.readFile(file, 'utf8')
    const relativeFile = path.relative(localeRoot, file).replaceAll(path.sep, '/')
    const { data, tree } = parsePage(markdown)
    if (data.locale !== locale || typeof data.title !== 'string')
      throw new Error(`${path.relative(root, file)}: invalid locale or title`)
    const { headings, text } = searchableContent(tree)
    searchEntries.push({
      title: data.title,
      ...(typeof data.description === 'string' ? { description: data.description } : {}),
      path: publicPath(locale, relativeFile),
      locale,
      ...(typeof data.layout === 'string' ? { section: data.layout } : {}),
      ...(headings.length ? { headings } : {}),
      text,
    })
  }
}

const json = `${JSON.stringify(searchEntries)}\n`
if (process.argv.includes('--check')) {
  if (await fs.readFile(outputFile, 'utf8') !== json)
    throw new Error('public/search-index.json is stale. Run pnpm search:generate.')
}
else {
  await fs.writeFile(outputFile, json)
  console.log(`Generated ${searchEntries.length} search entries at public/search-index.json.`)
}
