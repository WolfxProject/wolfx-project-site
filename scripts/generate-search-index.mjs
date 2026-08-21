import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isWolfxMcInternalPath, wolfxMcUrl } from '../data/site-identities.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'content')
const outputFile = path.join(root, 'public/search-index.json')
const locales = ['ja', 'zh', 'en']

function parseFrontmatter(markdown, file) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match)
    throw new Error(`${file}: missing frontmatter`)
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (!field)
      continue
    const [, key, raw] = field
    try {
      data[key] = JSON.parse(raw)
    }
    catch {
      data[key] = raw.trim()
    }
  }
  return { data, body: markdown.slice(match[0].length) }
}

function plainInline(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 $2')
    .replace(/<https?:\/\/[^>]+>/g, match => match.slice(1, -1))
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_~]/g, '')
    .replace(/\\([\W_])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function plainBody(body) {
  return body
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/^::+[^\n]*$/gm, ' ')
    .replace(/^```[^\n]*$/gm, ' ')
    .replace(/^---+$/gm, ' ')
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, ' ')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-+*]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/\|/g, ' ')
    .split(/\r?\n/)
    .map(plainInline)
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function publicPath(locale, relativeFile) {
  const route = relativeFile.replace(/\.md$/, '').replace(/(^|\/)index$/, '')
  const prefix = locale === 'ja' ? '' : `/${locale}`
  const internalPath = `${prefix}/${route}`.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
  return isWolfxMcInternalPath(internalPath) ? wolfxMcUrl(internalPath) : internalPath
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
    const { data, body } = parseFrontmatter(markdown, path.relative(root, file))
    if (data.locale !== locale || typeof data.title !== 'string')
      throw new Error(`${path.relative(root, file)}: invalid locale or title`)
    const headings = [...body.matchAll(/^#{1,6}\s+(.+)$/gm)]
      .map(match => plainInline(match[1]))
      .filter(Boolean)
    searchEntries.push({
      title: data.title,
      ...(typeof data.description === 'string' ? { description: data.description } : {}),
      path: publicPath(locale, relativeFile),
      locale,
      ...(typeof data.layout === 'string' ? { section: data.layout } : {}),
      ...(headings.length ? { headings } : {}),
      text: plainBody(body),
    })
  }
}

await fs.mkdir(path.dirname(outputFile), { recursive: true })
await fs.writeFile(outputFile, `${JSON.stringify(searchEntries)}\n`)
console.log(`Generated ${searchEntries.length} search entries at public/search-index.json.`)
