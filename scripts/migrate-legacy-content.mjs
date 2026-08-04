import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const legacyRoot = path.resolve(root, '../wolfx-project')

const pages = [
  ['apidoc.html', 'ja', 'docs/open-api.md', 'Wolfx Open API 利用説明', 'Wolfx Open API（地震・緊急地震速報 EEW）の利用説明。JSON、GET、WebSocket に対応。', 'docs', 'v20260729', '2026-07-29'],
  ['apidoc_zh.html', 'zh', 'docs/open-api.md', 'Wolfx 防灾（防災）实用类免费 API 接口', 'Wolfx Open API 地震、防灾与实用类接口文档，支持 JSON、GET 与 WebSocket。', 'docs', 'v20260729', '2026-07-29'],
  ['apidoc_en.html', 'en', 'docs/open-api.md', 'Wolfx Open API Usage', 'Wolfx Open API documentation for earthquake, EEW, and utility APIs over JSON, GET, and WebSocket.', 'docs', 'v20260729', '2026-07-29'],
  ['wsapi.html', 'ja', 'docs/websocket.md', 'Wolfx WebSocket API 利用説明', 'Wolfx WebSocket API の接続先、手動クエリ、JSON データ仕様。', 'docs', 'v20260415', '2026-04-15'],
  ['wsapi_zh.html', 'zh', 'docs/websocket.md', 'Wolfx WebSocket API 调用说明', 'Wolfx WebSocket API 连接地址、手动查询指令与 JSON 数据说明。', 'docs', 'v20260415', '2026-04-15'],
  ['wsapi_en.html', 'en', 'docs/websocket.md', 'Wolfx WebSocket API Call Instructions', 'Wolfx WebSocket endpoints, manual query commands, and JSON data specification.', 'docs', 'v20260415', '2026-04-15'],
  ['seisapi.html', 'ja', 'docs/seisjs-api.md', 'Wolfx SeisJS API 利用ガイド', 'SeisJS 観測点、WebSocket 接続、観測データフィールドの仕様。', 'docs', 'v20250704', '2025-07-04'],
  ['seisapi_zh.html', 'zh', 'docs/seisjs-api.md', 'Wolfx SeisJS API 调用说明', 'SeisJS 测站、WebSocket 连接与观测数据字段说明。', 'docs', 'v20250704', '2025-07-04'],
  ['seisapi_en.html', 'en', 'docs/seisjs-api.md', 'Wolfx SeisJS API Documentation', 'SeisJS station, WebSocket connection, and observation data field documentation.', 'docs', 'v20250704', '2025-07-04'],
  ['privacy_policy.html', 'ja', 'legal/privacy.md', 'Wolfx Project プライバシーポリシー', 'Wolfx Project のサービスにおける情報の取扱いについて説明します。', 'legal', undefined, '2026-07-28'],
  ['privacy_policy_zh.html', 'zh', 'legal/privacy.md', 'Wolfx Project 隐私政策', '说明 Wolfx Project 各项服务中的信息处理方式。', 'legal', undefined, '2026-07-28'],
  ['privacy_policy_en.html', 'en', 'legal/privacy.md', 'Wolfx Project Privacy Policy', 'How Wolfx Project handles information across its public services.', 'legal', undefined, '2026-07-28'],
  ['tos.html', 'ja', 'legal/terms.md', 'Wolfx Project 利用規約', 'Wolfx Project が提供するサービスの利用条件。', 'legal', undefined, '2026-07-28'],
  ['tos_zh.html', 'zh', 'legal/terms.md', 'Wolfx Project 服务条款', 'Wolfx Project 所提供服务的使用条件。', 'legal', undefined, '2026-07-28'],
  ['tos_en.html', 'en', 'legal/terms.md', 'Wolfx Project Terms of Service', 'Terms governing use of services provided by Wolfx Project.', 'legal', undefined, '2026-07-28'],
]

const turndown = new TurndownService({
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  headingStyle: 'atx',
  strongDelimiter: '**',
})
turndown.use(gfm)
turndown.remove(['style', 'noscript'])
turndown.addRule('documentedScripts', {
  filter: 'script',
  replacement(_content, node) {
    const code = node.textContent.trim()
    return code ? `\n\n\`\`\`javascript\n${code}\n\`\`\`\n\n` : ''
  },
})
turndown.addRule('apiFieldTables', {
  filter: 'table',
  replacement(_content, node) {
    const rows = Array.from(node.querySelectorAll('tr')).map((row) => {
      return Array.from(row.querySelectorAll('th, td')).map((cell) => {
        const text = cell.textContent.replaceAll(/\s+/g, ' ').trim()
        return text.replaceAll('|', '\\|')
      })
    }).filter(row => row.length > 0)

    if (!rows.length)
      return ''

    const width = Math.max(...rows.map(row => row.length))
    const header = ['Field', 'Description', ...Array.from({ length: Math.max(0, width - 2) }, (_, index) => `Column ${index + 3}`)]
    const output = [
      `| ${header.slice(0, width).join(' | ')} |`,
      `| ${Array.from({ length: width }, () => '---').join(' | ')} |`,
      ...rows.map(row => `| ${row.map((cell, index) => index === 0 ? `\`${cell}\`` : cell).join(' | ')} |`),
    ]
    return `\n\n${output.join('\n')}\n\n`
  },
})
turndown.addRule('sectionHeadings', {
  filter: ['h3', 'h4', 'h5', 'h6'],
  replacement(content) {
    return `\n\n## ${content.trim()}\n\n`
  },
})
turndown.addRule('standaloneCode', {
  filter(node) {
    return node.nodeName === 'CODE' && node.parentNode?.nodeName !== 'PRE'
      && ['UL', 'DIV'].includes(node.parentNode?.nodeName ?? '')
  },
  replacement(content) {
    return `\n\n\`\`\`text\n${content.trim()}\n\`\`\`\n\n`
  },
})

function decodeEntities(value) {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', '\'')
}

function extractAds(html, file) {
  const start = html.search(/<div\s+class=["']ads["'][^>]*>/i)
  if (start < 0)
    throw new Error(`${file}: .ads content container not found`)

  const tagPattern = /<\/?div\b[^>]*>/gi
  tagPattern.lastIndex = start
  let depth = 0
  let openEnd = -1
  for (let match = tagPattern.exec(html); match; match = tagPattern.exec(html)) {
    if (!match[0].startsWith('</')) {
      depth += 1
      if (openEnd < 0)
        openEnd = tagPattern.lastIndex
    }
    else {
      depth -= 1
      if (depth === 0)
        return html.slice(openEnd, match.index)
    }
  }
  throw new Error(`${file}: unbalanced .ads container`)
}

function yamlString(value) {
  return JSON.stringify(value)
}

function rewriteInternalLinks(markdown, locale) {
  const prefix = locale === 'ja' ? '' : `/${locale}`
  const replacements = [
    [/https:\/\/wolfx\.jp\/apidoc(?:_(?:zh|en))?(?:\.html)?(?:\?nodetect)?/g, `${prefix}/docs/open-api`],
    [/https:\/\/wolfx\.jp\/wsapi(?:_(?:ja|zh|en))?(?:\.html)?/g, `${prefix}/docs/websocket`],
    [/https:\/\/wolfx\.jp\/seisapi(?:_(?:zh|en))?(?:\.html)?/g, `${prefix}/docs/seisjs-api`],
    [/https:\/\/wolfx\.jp\/privacy_policy(?:_(?:zh|en))?(?:\.html)?/g, `${prefix}/legal/privacy`],
    [/https:\/\/wolfx\.jp\/tos(?:_(?:zh|en))?(?:\.html)?/g, `${prefix}/legal/terms`],
  ]
  return replacements.reduce((result, [pattern, target]) => result.replace(pattern, target), markdown)
}

for (const [source, locale, destination, title, description, layout, version, updated] of pages) {
  const html = await fs.readFile(path.join(legacyRoot, source), 'utf8')
  let bodyHtml = extractAds(html, source)
    .replaceAll(/<p>\s*<\/p>/gi, '')
    .replaceAll(/<img\b[^>]*\bid=["'][^"']+["'][^>]*>/gi, '')
    .replaceAll(/<span\b[^>]*\bid=["'][^"']+["'][^>]*>.*?<\/span>/gis, '')

  const firstHeading = bodyHtml.match(/^\s*<h4>(.*?)<\/h4>/is)
  if (firstHeading && decodeEntities(firstHeading[1].replaceAll(/<[^>]+>/g, '').trim()) === title)
    bodyHtml = bodyHtml.slice(firstHeading[0].length)

  let markdown = rewriteInternalLinks(decodeEntities(turndown.turndown(bodyHtml)), locale)
    .replaceAll(/\n{3,}/g, '\n\n')
    .replaceAll(/^-\s{3}/gm, '- ')
    .replaceAll(/^(##\s+\d+)\\\./gm, '$1.')
    .trim()

  const frontmatter = [
    '---',
    `title: ${yamlString(title)}`,
    `description: ${yamlString(description)}`,
    `locale: ${locale}`,
    `layout: ${layout}`,
    `updated: ${updated}`,
    version ? `version: ${version}` : undefined,
    `source: ${source}`,
    '---',
    '',
  ].filter(line => line !== undefined).join('\n')

  const target = path.join(root, 'content', locale, destination)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, `${frontmatter}${markdown}\n`)
  console.log(`${source} -> content/${locale}/${destination}`)
}
