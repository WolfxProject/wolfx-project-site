import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readLegacyFile } from './legacy-source.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const migrations = [
  ['apidoc.html', 'ja/docs/open-api.md'], ['apidoc_zh.html', 'zh/docs/open-api.md'], ['apidoc_en.html', 'en/docs/open-api.md'],
  ['wsapi.html', 'ja/docs/websocket.md'], ['wsapi_zh.html', 'zh/docs/websocket.md'], ['wsapi_en.html', 'en/docs/websocket.md'],
  ['privacy_policy.html', 'ja/legal/privacy.md'], ['privacy_policy_zh.html', 'zh/legal/privacy.md'], ['privacy_policy_en.html', 'en/legal/privacy.md'],
  ['tos.html', 'ja/legal/terms.md'], ['tos_zh.html', 'zh/legal/terms.md'], ['tos_en.html', 'en/legal/terms.md'],
]
const apiStatusMigrations = {
  'apidoc.html': { locale: 'ja', heading: 'API ステータス' },
  'apidoc_zh.html': { locale: 'zh', heading: 'API 状态' },
  'apidoc_en.html': { locale: 'en', heading: 'API Status' },
}
// Reviewed copy edits. Each original heading still resolves to a specific current section.
const headingRenames = {
  'apidoc.html': {
    'Wolfx Open API 利用説明': 'Wolfx Open API 利用ガイド',
    'WebSocket API 利用説明': 'WebSocket の購読方法',
    'JMA 緊急地震速報 JSON API': '気象庁 緊急地震速報 JSON API',
    '四川省地震局 地震速報 JSON API': '四川省地震局 地震早期警報 JSON API',
    '中国地震台網 地震速報 JSON API': '中国地震台網 地震早期警報 JSON API',
    '福建省地震局 地震速報 JSON API': '福建省地震局 地震早期警報 JSON API',
    '重庆市地震局 地震速報 JSON API': '重慶市地震局 地震早期警報 JSON API',
  },
  'apidoc_zh.html': {
    'Wolfx 防灾（防災）实用类免费 API 接口': 'Wolfx Open API 使用指南',
    'WebSocket API 使用须知': 'WebSocket 订阅指南',
    'JMA 緊急地震速報 JSON API': 'JMA 紧急地震速报 JSON API',
    'JMA 地震情報 JSON API': 'JMA 地震信息 JSON API',
    'CWA 地震预警 JSON API (仅服务大陆地区)': 'CWA 地震预警 JSON API（仅限中国大陆地区）',
    'IP位址资讯查询 JSON API': 'IP 地址信息查询 JSON API',
    '最新服务器时间获取 JSON API': '服务器时间 JSON API',
    '公网IP位址获取 PLAIN API': '公网 IP 地址查询（纯文本）',
    '随机动漫图片获取 JPEG API': '随机动漫图片 API',
  },
  'apidoc_en.html': {
    'Wolfx Open API Usage': 'Wolfx Open API reference',
    'WebSocket API Usage Instructions': 'WebSocket subscriptions',
  },
  'wsapi.html': {
    'Wolfx WebSocket API 利用説明': 'Wolfx WebSocket API 利用ガイド',
    'WebSocket 呼び出し URL': '集約チャンネルと除外設定',
    'WebSocket 手動クエリコマンド': '個別の接続先と手動クエリ',
    'WebSocket JSON データ仕様': 'WebSocket メッセージの形式',
  },
  'wsapi_zh.html': {
    'Wolfx WebSocket API 调用说明': 'Wolfx WebSocket API 使用指南',
    'WebSocket 调用地址': '聚合订阅与过滤',
    'WebSocket 手动查询指令': '单独订阅与手动查询',
    'WebSocket JSON 资料说明': 'WebSocket 消息格式',
  },
  'wsapi_en.html': {
    'Wolfx WebSocket API Call Instructions': 'Wolfx WebSocket API',
    'Introduction to WebSocket': 'How updates work',
    'WebSocket Call URLs': 'Aggregate subscriptions and filters',
    'WebSocket Manual Query Commands': 'Individual subscriptions and query commands',
    'WebSocket JSON Data Specification': 'WebSocket message format',
  },
}

const apiStatusResources = [
  'https://api.wolfx.jp/ws_clients.json',
  'https://api.wolfx.jp/status/nginx_request-day.png',
  'https://api.wolfx.jp/status/nginx_request-week.png',
  'https://api.wolfx.jp/status/if_eth0-day.png',
  'https://api.wolfx.jp/status/if_eth0-week.png',
]
const apiStatusComponent = await fs.readFile(path.join(root, 'app/components/content/ApiStatusPanel.vue'), 'utf8')

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

// Only obsolete document-version headings are exempt from the legacy heading audit.
// API response fields such as version and ver remain part of the field/code checks.
function isDocumentVersionHeading(heading) {
  return /^(?:Doc version|API Documentation Version|APIドキュメントバージョン|API文档版本|文档版本|ドキュメントバージョン)\s*[:：]\s*v\d{8}$/u.test(heading)
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
    hasDocumentVersion: /^version\s*:/m.test(frontmatter),
    headings: extract(/^#{1,6}\s+(.+)$/gm, markdown, value => value.replaceAll('\\.', '.').trim()),
    links: unique(extract(/\[[^\]]*\]\(([^)]+)\)/g, markdown)),
    endpoints: unique(extract(/(?:https?|wss):\/\/[^\s<`"')\]]+/g, markdown, value => value.replace(/[),.;]+$/, ''))),
    code: extract(/```[^\n]*\n([\s\S]*?)\n```/g, markdown, value => value.trim()),
    tables: (markdown.match(/^\|(?:\s*:?-{3,}:?\s*\|)+\s*$/gm) ?? []).length,
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
  const isApiDocument = markdownFile.includes('/docs/')
  // The 2026-11-14 TOS rewrite replaces the legacy structure and policy.
  // Its current headings/navigation are checked against Markdown in legal.spec.mjs.
  // Retain all other migration checks, including Privacy and API contracts.
  const isRewrittenTerms = markdownFile.endsWith('/legal/terms.md')
  const renames = headingRenames[legacyFile] ?? {}
  const expectedHeadings = isRewrittenTerms
    ? []
    : source.headings
        .map(heading => renames[heading] ?? heading)
        .filter((heading, index) => !(index === 0 && heading === target.title)
          && !(apiStatusMigration && heading === 'API Status')
          && !(isApiDocument && isDocumentVersionHeading(heading)))
  const dynamicStatus = []
  const documentMetadata = []
  if (isApiDocument) {
    if (target.hasDocumentVersion)
      documentMetadata.push('deprecated document version front matter remains')
    if (target.headings.some(isDocumentVersionHeading))
      documentMetadata.push('deprecated document version heading remains')
    if (!/^updated:\s*\d{4}-\d{2}-\d{2}\s*$/m.test(markdown))
      documentMetadata.push('missing last-updated date')
  }
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
    documentMetadata,
    dynamicStatus,
  }
  // Compare every historical table. Three subsequently published JMA products
  // have their own field contract in check-jma-docs.mjs. A single subscription
  // directory in the WebSocket guide pairs the original endpoints and commands.
  const newProducts = ['jma_earthquake_detail', 'jma_tsunami', 'jma_special_eq']
  const newJmaTables = markdownFile.endsWith('/docs/open-api.md')
    ? [...markdown.matchAll(/^## .+\n[\s\S]*?(?=^## |$(?![\s\S]))/gm)]
        .filter(([section]) => newProducts.some(name => section.includes(`\nhttps://api.wolfx.jp/${name}.json\n`)))
        .reduce((sum, [section]) => sum + metricsFromMarkdown(section).tables, 0)
    : 0
  const addedDirectory = markdownFile.endsWith('/docs/websocket.md') ? 1 : 0
  const ok = target.tables === source.tables + newJmaTables + addedDirectory
    && Object.values(missing).every(values => values.length === 0)
  failed ||= !ok
  summaries.push({ legacyFile, markdownFile, language: source.language, sourceTitle: source.title, headings: source.headings.length, tables: source.tables, fields: source.fields.length, endpoints: source.endpoints.length, ok, missing })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${legacyFile} [${source.language}] -> content/${markdownFile} | headings ${source.headings.length}, tables ${source.tables}, fields ${source.fields.length}, endpoints ${source.endpoints.length}`)
  if (!ok)
    console.log(JSON.stringify(missing, null, 2))
}

console.log('\nCross-language differences (preserved, not normalized):')
for (const family of ['apidoc', 'wsapi', 'privacy_policy', 'tos']) {
  const entries = summaries.filter(item => item.legacyFile.startsWith(family))
  const signature = entries.map(item => `${item.language}: headings=${item.headings}, tables=${item.tables}, fields=${item.fields}, endpoints=${item.endpoints}`).join(' | ')
  console.log(`- ${family}: ${signature}`)
}

if (failed)
  process.exitCode = 1
