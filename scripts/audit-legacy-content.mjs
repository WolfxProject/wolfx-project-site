import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const legacyRoot = path.resolve(root, '../wolfx-project')
const execFileAsync = promisify(execFile)
const migrations = [
  ['apidoc.html', 'ja/docs/open-api.md'], ['apidoc_zh.html', 'zh/docs/open-api.md'], ['apidoc_en.html', 'en/docs/open-api.md'],
  ['wsapi.html', 'ja/docs/websocket.md'], ['wsapi_zh.html', 'zh/docs/websocket.md'], ['wsapi_en.html', 'en/docs/websocket.md'],
  ['seisapi.html', 'ja/docs/seisjs-api.md'], ['seisapi_zh.html', 'zh/docs/seisjs-api.md'], ['seisapi_en.html', 'en/docs/seisjs-api.md'],
  ['privacy_policy.html', 'ja/legal/privacy.md'], ['privacy_policy_zh.html', 'zh/legal/privacy.md'], ['privacy_policy_en.html', 'en/legal/privacy.md'],
  ['tos.html', 'ja/legal/terms.md'], ['tos_zh.html', 'zh/legal/terms.md'], ['tos_en.html', 'en/legal/terms.md'],
]
const apiStatusMigrations = {
  'apidoc.html': { locale: 'ja', heading: 'API ステータス' },
  'apidoc_zh.html': { locale: 'zh', heading: 'API 状态' },
  'apidoc_en.html': { locale: 'en', heading: 'API Status' },
}
const apiStatusResources = [
  'https://api.wolfx.jp/ws_clients.json',
  'https://api.wolfx.jp/status/nginx_request-day.png',
  'https://api.wolfx.jp/status/nginx_request-week.png',
  'https://api.wolfx.jp/status/if_eth0-day.png',
  'https://api.wolfx.jp/status/if_eth0-week.png',
]
const apiStatusComponent = await fs.readFile(path.join(root, 'app/components/content/ApiStatusPanel.vue'), 'utf8')

async function readLegacyFile(filename) {
  try {
    return await fs.readFile(path.join(legacyRoot, filename), 'utf8')
  }
  catch (error) {
    if (error?.code !== 'ENOENT')
      throw error
    const { stdout } = await execFileAsync('git', ['show', `HEAD:${filename}`], { cwd: legacyRoot, encoding: 'utf8' })
    return stdout
  }
}

function isApiStatusEndpoint(value) {
  return apiStatusResources.some(resource => value.startsWith(resource))
}

function entities(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', '\'').replaceAll('&nbsp;', ' ')
}

function plain(value) {
  return entities(value.replaceAll(/<[^>]+>/g, ' ').replaceAll(/\s+/g, ' ').trim())
}

function unique(values) {
  return [...new Set(values)]
}

function extract(pattern, text, transform = value => value) {
  return [...text.matchAll(pattern)].map(match => transform(match[1] ?? match[0]))
}

function metricsFromHtml(html) {
  const body = html.match(/<div\s+class=["']ads["'][^>]*>([\s\S]*?)<div\s+class=["']footer["']/i)?.[1] ?? html
  return {
    language: html.match(/<html[^>]+lang=["']([^"']+)/i)?.[1],
    title: plain(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ''),
    headings: extract(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, body, plain),
    links: unique(extract(/<a[^>]+href=["']([^"']+)/gi, body, entities)),
    endpoints: unique(extract(/(?:https?|wss):\/\/[^\s<"']+/gi, entities(body), value => value.replace(/[`),.;]+$/, ''))),
    code: extract(/<code[^>]*>([\s\S]*?)<\/code>/gi, body, plain),
    tables: (body.match(/<table\b/gi) ?? []).length,
    fields: extract(/<tr[^>]*>\s*<td[^>]*>([\s\S]*?)<\/td>/gi, body, plain),
  }
}

function metricsFromMarkdown(markdown) {
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  return {
    title: JSON.parse(frontmatter.match(/^title:\s*(.+)$/m)?.[1] ?? '""'),
    headings: extract(/^#{1,6}\s+(.+)$/gm, markdown, value => value.replaceAll('\\.', '.').trim()),
    links: unique(extract(/\[[^\]]*\]\(([^)]+)\)/g, markdown)),
    endpoints: unique(extract(/(?:https?|wss):\/\/[^\s<`"')\]]+/g, markdown, value => value.replace(/[),.;]+$/, ''))),
    code: extract(/```[^\n]*\n([\s\S]*?)\n```/g, markdown, value => value.trim()),
    tables: (markdown.match(/^\|\s*Field\s*\|/gm) ?? []).length,
    fields: extract(/^\|\s*`([^`]+)`\s*\|/gm, markdown),
  }
}

let failed = false
const summaries = []
for (const [legacyFile, markdownFile] of migrations) {
  const html = await readLegacyFile(legacyFile)
  const markdown = await fs.readFile(path.join(root, 'content', markdownFile), 'utf8')
  const source = metricsFromHtml(html)
  const target = metricsFromMarkdown(markdown)
  const apiStatusMigration = apiStatusMigrations[legacyFile]
  const expectedHeadings = source.headings.filter((heading, index) => !(index === 0 && heading === target.title) && !(apiStatusMigration && heading === 'API Status'))
  const dynamicStatus = []
  if (apiStatusMigration) {
    if (!target.headings.includes(apiStatusMigration.heading))
      dynamicStatus.push(`missing localized heading ${apiStatusMigration.heading}`)
    if (!markdown.includes(`::api-status-panel{locale="${apiStatusMigration.locale}"}`))
      dynamicStatus.push(`missing api-status-panel for ${apiStatusMigration.locale}`)
    for (const resource of apiStatusResources) {
      if (!apiStatusComponent.includes(resource))
        dynamicStatus.push(`component missing ${resource}`)
    }
    if (/<script\b|document\.getElementById/i.test(markdown))
      dynamicStatus.push('legacy inline status script remains in Markdown')
  }
  const missing = {
    headings: expectedHeadings.filter(value => !target.headings.includes(value)),
    fields: source.fields.filter(value => !target.fields.includes(value)),
    endpoints: source.endpoints.filter(value => !value.startsWith('https://wolfx.jp/') && !(apiStatusMigration && isApiStatusEndpoint(value)) && !target.endpoints.includes(value)),
    code: source.code.filter(value => !markdown.includes(value)),
    links: source.links.filter(value => !value.startsWith('https://wolfx.jp') && !target.links.includes(value) && !markdown.includes(value)),
    dynamicStatus,
  }
  const ok = source.tables === target.tables && Object.values(missing).every(values => values.length === 0)
  failed ||= !ok
  summaries.push({ legacyFile, markdownFile, language: source.language, sourceTitle: source.title, headings: source.headings.length, tables: source.tables, fields: source.fields.length, endpoints: source.endpoints.length, ok, missing })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${legacyFile} [${source.language}] -> content/${markdownFile} | headings ${source.headings.length}, tables ${source.tables}, fields ${source.fields.length}, endpoints ${source.endpoints.length}`)
  if (!ok)
    console.log(JSON.stringify(missing, null, 2))
}

console.log('\nCross-language differences (preserved, not normalized):')
for (const family of ['apidoc', 'wsapi', 'seisapi', 'privacy_policy', 'tos']) {
  const entries = summaries.filter(item => item.legacyFile.startsWith(family))
  const signature = entries.map(item => `${item.language}: headings=${item.headings}, tables=${item.tables}, fields=${item.fields}, endpoints=${item.endpoints}`).join(' | ')
  console.log(`- ${family}: ${signature}`)
}

if (failed)
  process.exitCode = 1
