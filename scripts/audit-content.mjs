import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { isIP } from 'node:net'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { visit } from 'unist-util-visit'
import { httpApis, messageFields, subscriptions } from './api-contract.mjs'
import { parsePage } from './content-markdown.mjs'

const locales = ['ja', 'zh', 'en']
const apiOrigin = 'https://api.wolfx.jp/'
const socketOrigin = 'wss://ws-api.wolfx.jp/'
const aggregate = `${socketOrigin}all_eew`

function text(node) {
  return node.value ?? (node.children ?? []).map(text).join('')
}

function identifiers(tree) {
  const tokens = new Set()
  visit(tree, ['inlineCode', 'code', 'link', 'containerComponent', 'leafComponent'], (node) => {
    const value = node.value ?? node.url ?? (node.name === 'api-endpoint' && node.attributes?.address)
    if (typeof value === 'string') {
      for (const line of value.split('\n')) tokens.add(line.trim())
    }
  })
  return tokens
}

// Only standalone URL examples and ApiEndpoint components declare routes.
// Links inside prose and inline references may legitimately cite other APIs.
function declaredUrls(tree, apis) {
  const urls = new Set()
  visit(tree, ['code', 'containerComponent', 'leafComponent'], (node, index, parent) => {
    const value = node.type === 'code' ? node.value : node.name === 'api-endpoint' && node.attributes?.address
    if (typeof value !== 'string') return
    for (const line of value.split('\n')) {
      const url = line.trim()
      if (!/^(?:https?|wss?):\/\//.test(url)) continue
      urls.add(url)
      if (!apis || !url.startsWith(apiOrigin)) continue
      const previous = parent?.children[index - 1]
      const method = node.name === 'api-endpoint'
        ? node.attributes?.method ?? 'GET'
        : previous?.type === 'paragraph' && text(previous).match(/^(?:HTTP\s+)?(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/i)?.[1]
      if (method) {
        const file = new URL(url).pathname.slice(1)
        assert.equal(method.toUpperCase(), apis[file]?.method ?? 'GET', `${file}: HTTP method`)
      }
    }
  })
  return urls
}

function linkTargets(tree) {
  const links = new Set()
  visit(tree, 'link', (node) => {
    links.add(node.url)
  })
  return links
}

function sections(tree) {
  const groups = [{ type: 'root', children: [] }]
  for (const node of tree.children) {
    if (node.type === 'heading' && node.depth === 2)
      groups.push({ type: 'root', children: [] })
    groups.at(-1).children.push(node)
  }
  return groups
}

// Type labels stay translatable. Units, recommendations and time formats may
// share their parentheses. Read the JSON type separately from those notes.
const typeNames = [
  ['object[]', /object array|array of objects|オブジェクト配列|对象数组/i],
  ['string[]', /string array|array of strings|文字列配列|字符串数组/i],
  ['number[]', /number array|array of numbers|数値型の配列|数值型数组/i],
  ['array', /\barray\b|配列|数组/i], ['boolean', /boolean|真偽|布尔/i],
  ['integer', /integer|整数/i], ['number', /number|数値|数值/i],
  ['string', /string|文字列|字符串/i], ['object', /object|オブジェクト|对象/i],
]
function typeLabel(description) {
  return description.match(/[（(]([^（）()]*)[）)][。.\s]*$/u)?.[1] ?? ''
}

function fieldType(description) {
  const label = typeLabel(description)
  const match = typeNames.find(([, pattern]) => pattern.test(label))
  assert(match, `missing JSON type annotation in ${description}`)
  const [kind, pattern] = match
  assert(!typeNames.some(([, other]) => other.test(label.replace(pattern, ''))), `ambiguous JSON type annotation: ${label}`)
  const nullable = /\bnull\b/i.test(label)
  const optional = /optional|可选|任意/i.test(label)
  return `${kind}${nullable ? '/null' : ''}${optional ? '?' : ''}`
}

function fieldRows(table) {
  return table.children.slice(1).flatMap((row) => {
    const [nameCell, descriptionCell] = row.children
    assert(descriptionCell && text(descriptionCell).trim(), 'missing API field description')
    const names = [...identifiers(nameCell)]
    assert(names.length, `API field identifier must be in inline code: ${text(nameCell)}`)
    const description = text(descriptionCell).trim()
    return names.map(name => ({ name: name.replace(/^No\s*\(1~50\)$/, 'No(1~50)'), description, tokens: identifiers(descriptionCell) }))
  })
}

function schemaTable(node, schema) {
  if (node.type !== 'table') return false
  const known = new Set(Object.values(schema).flatMap(names => names.split(' ')))
  return node.children.slice(1).some(({ children: [name, description] }) => description
    && [...identifiers(name)].some(id => known.has(id.replace(/^No\s*\(1~50\)$/, 'No(1~50)')))
    && typeNames.some(([, pattern]) => pattern.test(typeLabel(text(description)))))
}

function checkFields(tables, schema, values = {}, scope = '') {
  const expected = new Map(Object.entries(schema).flatMap(([type, names]) => names.split(' ').map(name => [name, type])))
  const actual = new Map()
  for (const row of tables.flatMap(fieldRows)) {
    // The two wire keys are both `type`. The NoN scope is explicitly named in
    // that field's description. This remains independent of the table order.
    const name = scope === 'cenc_eqlist' && row.name === 'type' && row.tokens.has('NoN') ? 'NoN.type' : row.name
    assert(!actual.has(name), `${scope}: duplicate field ${name}`)
    assert.equal(fieldType(row.description), expected.get(name), `${scope}.${name}: JSON type`)
    assert(row.description.replace(/[（(][^（）()]*[）)][。.\s]*$/u, '').trim(), `${scope}.${name}: empty description`)
    actual.set(name, row)
  }
  assert.deepEqual(new Set(actual.keys()), new Set(expected.keys()), `${scope}: fields`)
  for (const [field, tokens] of Object.entries(values)) {
    const row = actual.get(field)
    for (const token of tokens) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      assert(new RegExp(`(?<![a-zA-Z0-9_])${escaped}(?![a-zA-Z0-9_])`).test(row.description), `${scope}.${field}: missing ${token}`)
    }
  }
}

function checkOpenApi(tree, locale, apis, channels, examples) {
  const expected = Object.entries(apis).filter(([, api]) => !api.locales || api.locales.includes(locale))
  const seen = new Set()
  const documentedParameters = new Set()
  for (const section of sections(tree)) {
    const urls = declaredUrls(section, apis)
    const bases = []
    for (const address of urls) {
      const url = new URL(address)
      if (url.host === 'ws-api.wolfx.jp') {
        assert(url.protocol === 'wss:' && Object.hasOwn(channels, url.pathname.slice(1)), `unsupported WebSocket endpoint ${address}`)
        continue
      }
      if (url.host !== 'api.wolfx.jp') continue
      const file = url.pathname.slice(1)
      const api = apis[file]
      assert(url.protocol === 'https:' && api, `unknown HTTP API ${address}`)
      if (!url.search) bases.push(file)
      for (const [name, value] of url.searchParams) {
        const allowed = api.parameters?.[name]
        const valid = allowed === 'address'
          ? isIP(value) || /^<[^<>]+>$/.test(value)
          : Array.isArray(allowed) && value.replace(/^<(.+)>$/, '$1').split('/').every(option => allowed.includes(option))
        assert(valid, `unsupported query parameter or value in ${address}`)
        documentedParameters.add(`${file}?${name}`)
      }
    }
    // An appendix can repeat an endpoint as an example. Identify each field
    // reference by its HTTP declaration and the schema table in that section.
    for (const file of bases) {
      const api = apis[file]
      const tables = api.fields ? section.children.filter(node => schemaTable(node, api.fields)) : []
      if (api.fields && !tables.length) continue
      const feed = file.replace(/\.json$/, '')
      const values = { ...api.values }
      if (Object.hasOwn(channels, feed)) {
        assert(urls.has(socketOrigin + feed), `${file}: missing matching WebSocket endpoint`)
        values.type = ['WebSocket', feed]
      }
      if (api.fields) {
        const ws = [...urls].filter(url => url.startsWith(socketOrigin))
        assert(ws.every(url => url === socketOrigin + feed && Object.hasOwn(channels, feed)), `${file}: incorrect WebSocket endpoint`)
        assert(!seen.has(file), `duplicate schema for ${file}`)
        checkFields(tables, api.fields, values, feed)
      }
      seen.add(file)
      const tokens = identifiers(section)
      for (const name of api.properties ?? []) assert(tokens.has(name), `${file}: missing ${name}`)
      const links = linkTargets(section)
      for (const url of [...(api.links ?? []), ...(examples[api.examples] ?? [])]) assert(links.has(url), `${file}: missing link ${url}`)
    }
  }
  assert.deepEqual(seen, new Set(expected.map(([file]) => file)), `${locale}: HTTP APIs`)
  for (const [file, api] of expected) {
    for (const name of Object.keys(api.parameters ?? {}))
      assert(documentedParameters.has(`${file}?${name}`), `${file}: missing query example for ${name}`)
  }
}

function checkSocketDoc(tree, channels) {
  const tokens = identifiers(tree)
  const urls = declaredUrls(tree)
  const seen = new Set()
  const commands = new Map()
  let packet
  for (const node of tree.children) {
    if (node.type === 'heading')
      packet = ['heartbeat', 'pong'].find(name => new RegExp(`\\b${name}\\b`).test(text(node)))
    if (node.type !== 'table') continue
    if (node.children.slice(1).some(row => row.children.length === 3 && /^query_/.test(text(row.children[2])))) {
      for (const row of node.children.slice(1)) {
        const [source, url, command] = row.children.map(cell => text(cell).trim())
        assert(source && url.startsWith(socketOrigin) && !commands.has(url), `invalid or duplicate subscription ${url}`)
        commands.set(url, command)
      }
      continue
    }
    const role = packet ?? 'common'
    const schema = messageFields[role]
    if (!schemaTable(node, schema)) continue
    assert(!seen.has(role), `duplicate ${role} table`)
    seen.add(role)
    checkFields([node], schema, packet ? { type: [packet] } : {}, role)
  }
  assert.deepEqual(seen, new Set(Object.keys(messageFields)), 'message tables')
  assert(tokens.has('ping'), 'missing ping command')
  assert.deepEqual(commands, new Map(Object.entries(channels).map(([feed, command]) => [socketOrigin + feed, command])), 'WebSocket endpoint and query command pairs')
  assert(urls.has(aggregate), 'missing aggregate endpoint')
  assert.match(text(tree), /\b400\b/, 'missing unknown-source handshake status')
  const filterCounts = []
  for (const token of tokens) {
    if (token.startsWith('query_')) assert([...commands.values()].includes(token), `unknown query command ${token}`)
  }
  for (const token of urls) {
    if (!token.startsWith('wss://') || commands.has(token) || token === aggregate) continue
    const url = new URL(token)
    assert.equal(`${url.origin}${url.pathname}`, aggregate, `unknown WebSocket endpoint ${token}`)
    assert.deepEqual([...url.searchParams.keys()], ['exclude'], `unsupported filter in ${token}`)
    const excluded = url.searchParams.get('exclude').split(',')
    assert(excluded.every(feed => Object.hasOwn(channels, feed)), `unknown exclusion in ${token}`)
    filterCounts.push(new Set(excluded).size)
  }
  assert(filterCounts.includes(1) && filterCounts.some(count => count > 1), 'missing single/multiple exclusion examples')
}

export function auditPage(markdown, locale, document, { apis = httpApis, channels = subscriptions, examples = {} } = {}) {
  const { data, tree } = parsePage(markdown)
  const directory = document.split('/')[0]
  assert.equal(data.locale, locale, 'frontmatter locale')
  assert(['docs', 'legal', 'mc', 'landing'].includes(data.layout), 'frontmatter layout')
  if (['docs', 'legal', 'mc'].includes(directory)) assert.equal(data.layout, directory, 'frontmatter layout')
  for (const name of ['title', 'description']) assert(typeof data[name] === 'string' && data[name].trim(), `missing ${name}`)
  const date = new Date(data.updated)
  assert(/^\d{4}-\d{2}-\d{2}$/.test(data.updated) && Number.isFinite(date.getTime()) && date.toISOString().startsWith(data.updated), 'invalid updated date')
  assert(tree.children.length && text(tree).trim(), 'empty document')
  const prefix = locale === 'ja' ? '' : `/${locale}`
  const links = linkTargets(tree)
  const requiredLinks = {
    'docs/open-api.md': [`${prefix}/legal/privacy`, `${prefix}/legal/terms`, `${prefix}/docs/websocket`],
    'docs/websocket.md': [`${prefix}/docs/open-api`, 'https://api.wolfx.jp'],
    'legal/terms.md': [`${prefix}/legal/privacy`],
  }
  for (const link of requiredLinks[document] ?? []) assert(links.has(link), `missing link ${link}`)
  if (directory === 'legal') {
    const paragraphs = []
    visit(tree, 'paragraph', (node) => {
      paragraphs.push(text(node).trim())
    })
    assert(paragraphs.some(Boolean), 'missing policy body')
  }
  if (document === 'docs/open-api.md') checkOpenApi(tree, locale, apis, channels, examples)
  if (document === 'docs/websocket.md') checkSocketDoc(tree, channels)
  return tree
}

export async function auditContent(root) {
  const examples = {}
  for (const { examples: directory } of Object.values(httpApis)) {
    if (!directory) continue
    const folder = join(root, 'public/examples', directory)
    const names = (await readdir(folder)).filter(name => name.endsWith('.json'))
    assert(names.length, `no published examples for ${directory}`)
    examples[directory] = names.map(name => `/examples/${directory}/${name}`)
    const samples = await Promise.all(names.map(async file => JSON.parse(await readFile(join(folder, file), 'utf8'))))
    if (directory === 'jma_eew') {
      const areaTypes = new Set(samples.flatMap(example => example.WarnArea.map(area => area.Type)))
      assert.deepEqual(areaTypes, new Set(httpApis['jma_eew.json'].values['WarnArea[].Type']), 'EEW area categories in the examples')
    }
    if (directory === 'jma_tsunami') {
      const values = httpApis['jma_tsunami.json'].values
      const states = new Set(samples.map(example => example.status))
      for (const state of states) assert(values.status.includes(state), `unknown tsunami status in example: ${state}`)
      for (const state of ['active', 'forecast_only', 'cleared', 'expired', 'unknown'])
        assert(states.has(state), `missing tsunami example for ${state}`)
      const levels = samples.flatMap(example => example.areas.map(area => area.level))
      assert(levels.every(level => values['areas[].level'].includes(level)), 'unknown tsunami area level in example')
      assert(samples.some(example => example.status === 'unknown' && !example.trusted && example.lastKnown), 'missing untrusted previous-state example')
      assert(samples.some(example => example.status === 'active' && example.observations.length), 'missing tsunami observations example')
    }
  }
  let base
  let pages = 0
  for (const locale of locales) {
    const dir = join(root, 'content', locale)
    const entries = await readdir(dir, { recursive: true, withFileTypes: true })
    const paths = entries.filter(entry => entry.isFile() && entry.name.endsWith('.md')).map(entry => relative(dir, join(entry.parentPath, entry.name)).split(sep).join('/'))
    assert(!paths.includes('docs/seisjs-api.md'), `${locale}: retired guide in published content`)
    for (const required of ['docs/open-api.md', 'docs/websocket.md', 'legal/privacy.md', 'legal/terms.md'])
      assert(paths.includes(required), `${locale}: missing ${required}`)
    if (base) assert.deepEqual(new Set(paths), base, `${locale}: translated pages`)
    else base = new Set(paths)
    for (const document of paths) {
      try {
        auditPage(await readFile(join(dir, document), 'utf8'), locale, document, { examples })
      }
      catch (cause) {
        throw new Error(`${locale}/${document}: ${cause.message}`, { cause })
      }
      pages++
    }
  }
  return pages
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const count = await auditContent(root)
  console.log(`PASS ${count} Markdown pages, three locales, public API fields and types, WebSocket commands, message schemas and JSON examples.`)
}
