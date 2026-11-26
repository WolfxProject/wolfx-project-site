import assert from 'node:assert/strict'
import { test } from 'node:test'
import { auditPage } from '../scripts/audit-content.mjs'

// These small documents and their expected contracts are independent inputs.
// content:audit separately validates every published Markdown file and example.
const locales = ['ja', 'zh', 'en']
const http = 'docs/open-api.md'
const socket = 'docs/websocket.md'
const api = 'https://api.wolfx.jp/'
const ws = 'wss://ws-api.wolfx.jp/'
const channels = { land: 'query_land', sea: 'query_sea' }
const quantity = { ja: '観測値（数値型）', zh: '观测值（数值型）', en: 'Observation (number)' }

function audit(document, body, { locale = 'en', metadataLocale = locale, date = '2030-06-15', ...contract } = {}) {
  const prefix = locale === 'ja' ? '' : `/${locale}`
  const links = {
    [http]: `[Privacy](${prefix}/legal/privacy) [Terms](${prefix}/legal/terms) [Socket](${prefix}/docs/websocket)`,
    [socket]: `[HTTP](${prefix}/docs/open-api) [API](https://api.wolfx.jp)`,
  }[document] ?? ''
  const markdown = `---\nlocale: "${metadataLocale}"\nlayout: ${document.split('/')[0]}\ntitle: Test\ndescription: Test document\nupdated: ${date}\n---\n${links}\n\n${body}\n`
  return auditPage(markdown, locale, document, { channels, ...contract })
}

function code(value) {
  return `\`\`\`text\n${value}\n\`\`\``
}

function fieldTable(rows, space = '') {
  const line = cells => `|${space}${cells.join(`${space}|${space}`)}${space}|`
  return [line(['Property', 'Meaning']), line(['---', '---']), ...rows.map(([names, description]) => {
    const identifiers = [names].flat().map(name => `\`${name}\``).join(', ')
    return line([identifiers, description])
  })].join('\n')
}

function reference(file, body = '', title = 'Reference') {
  return `## ${title}\n\n${code(api + file)}\n\n${body}`
}

const heartbeat = [['type', '`heartbeat` (string)'], ['ver', 'Version (number)'], ['id', 'Connection (string)'], ['timestamp', 'Time (string)']]
const pong = [['type', '`pong` (string)'], ['timestamp', 'Time (string)']]
function packets(beat = heartbeat, reply = pong) {
  return [
    code('ping'), '### Common', fieldTable([['type', 'Kind (string)']]),
    '### Notification (`heartbeat`)', 'Fields may follow explanatory prose.', fieldTable(beat),
    '### Reply (`pong`)', fieldTable(reply),
  ].join('\n\n')
}

function socketGuide(pairs, messages = packets(), filters = ['land', 'land,sea']) {
  const url = `${ws}all_eew`
  const rows = pairs.map(([name, command]) => `|Example|\`${ws}${name}\`|\`${command}\`|`)
  return [
    '## Connections', code(url), code(filters.map(exclude => `${url}?exclude=${exclude}`).join('\n')), 'Unknown source: HTTP 400.',
    ['|Source|Endpoint|Command|', '|---|---|---|', ...rows].join('\n'), '## Messages', messages,
  ].join('\n\n')
}

test('identical omissions, typos and command swaps in every locale fail an independent protocol', () => {
  const apis = { 'sample.json': { fields: { number: 'Magnitude Magunitude' } } }
  for (const locale of locales) {
    const check = (file, names) => audit(http, reference(file, fieldTable(names.map(name => [name, quantity[locale]]))), { apis, locale })
    check('sample.json', ['Magunitude', 'Magnitude'])
    assert.throws(() => check('sample.json', ['Magnitude']), /sample: fields/)
    assert.throws(() => check('sampel.json', ['Magnitude', 'Magunitude']), /unknown HTTP API/)
    audit(socket, socketGuide([['sea', 'query_sea'], ['land', 'query_land']]), { locale })
    assert.throws(() => audit(socket, socketGuide([['sea', 'query_land'], ['land', 'query_sea']]), { locale }), /endpoint and query command pairs/)
  }
})

test('field grouping, table spacing, metadata quoting and order can change without changing the protocol', () => {
  const apis = { 'times.json': { fields: { 'string/null?': 'originTime arrivalTime' } }, 'health.php': {} }
  const type = 'When available (string / null; optional)'
  const health = reference('health.php')
  const grouped = fieldTable([[['originTime', 'arrivalTime'], type]])
  const separate = fieldTable([['arrivalTime', type], ['originTime', type]], '   ')
  audit(http, `${reference('times.json', grouped)}\n\n${health}`, { apis })
  audit(http, `${health}\n\n${reference('times.json', separate, 'Revised headings and field order')}`, { apis })
  assert.throws(() => audit(http, `${health}\n\n${reference('times.json', fieldTable([['originTime', type]]))}`, { apis }), /times: fields/)
  const pairs = [['land', 'query_land'], ['sea', 'query_sea']]
  audit(socket, socketGuide(pairs, packets(), ['sea,land', 'sea']))
  assert.throws(() => audit(socket, socketGuide(pairs, packets(), ['land', 'sea,unknown'])), /unknown exclusion/)
})

test('message tables and identically named CENC keys are validated in their own scope', () => {
  const pairs = [['land', 'query_land'], ['sea', 'query_sea']]
  assert.throws(() => audit(socket, socketGuide(pairs, packets(pong, heartbeat))), /heartbeat/)
  const contract = { apis: { 'cenc_eqlist.json': { fields: { string: 'type NoN.type' }, values: { 'NoN.type': ['automatic', 'reviewed'] } } }, channels: { cenc_eqlist: 'query_cenceqlist' } }
  const discriminator = ['type', 'WebSocket `cenc_eqlist` (string)']
  const nested = ['type', 'Within `NoN`: `automatic` or `reviewed` (string)']
  const cenc = rows => reference('cenc_eqlist.json', `${code(`${ws}cenc_eqlist`)}\n\n${fieldTable(rows)}`)
  audit(http, cenc([nested, discriminator]), contract)
  assert.throws(() => audit(http, cenc([discriminator]), contract), /cenc_eqlist: fields/)
  assert.throws(() => audit(http, cenc([discriminator, ['type', '`NoN` can be `automatic` (string)']]), contract), /missing reviewed/)
})

test('cross-references, ordinary tables, multiple query examples and MDC coexist with checked declarations', () => {
  const apis = { 'lookup.php': { fields: { string: 'ip' }, parameters: { ip: 'address' } }, 'clock.php': {} }
  function guide({ method = 'GET', parameter = 'ip', extra = '' } = {}) {
    const related = `See [the clock](${api}clock.php) and [the sea channel](${ws}sea).`
    const fields = fieldTable([['ip', 'Source address (string)']])
    const explanation = '|Example|Behaviour|\n|---|---|\n|`ip`|Supplied by the caller|'
    const queries = code(`${api}lookup.php?${parameter}=192.0.2.3\n${api}lookup.php?${parameter}=<IPv6 address>`)
    return `${reference('lookup.php', [related, fields, explanation, queries, extra].join('\n\n'))}\n\n## Time\n\n::api-endpoint{method="${method}" address="${api}clock.php"}\n::`
  }
  audit(http, guide(), { apis })
  assert.throws(() => audit(http, guide({ parameter: 'wrong' }), { apis }), /unsupported query parameter/)
  assert.throws(() => audit(http, guide({ method: 'POST' }), { apis }), /HTTP method/)
  assert.throws(() => audit(http, guide({ extra: code(`${ws}land`) }), { apis }), /incorrect WebSocket endpoint/)
})

test('a reviewed protocol change can add fields and language coverage independently of existing prose', () => {
  const original = { 'measure.json': { fields: { number: 'value' } } }
  const expanded = { 'measure.json': { fields: { number: 'value quality' } }, 'china.json': { locales: ['zh'] } }
  for (const locale of locales) {
    const base = [['value', quantity[locale]]]
    const regional = locale === 'zh' ? `\n\n${reference('china.json')}` : ''
    const oldGuide = reference('measure.json', fieldTable(base))
    const newGuide = reference('measure.json', fieldTable([...base, ['quality', quantity[locale]]])) + regional
    audit(http, oldGuide, { locale, apis: original })
    audit(http, newGuide, { locale, apis: expanded })
    assert.throws(() => audit(http, newGuide, { locale, apis: original }), /quality: JSON type/)
    assert.throws(() => audit(http, oldGuide + regional, { locale, apis: expanded }), /measure: fields/)
    if (locale === 'zh') assert.throws(() => audit(http, newGuide.slice(0, -regional.length), { locale, apis: expanded }), /HTTP APIs/)
  }
})

test('field types, literal values, example links and metadata are checked while policy prose can evolve', () => {
  const example = '/examples/test-case.json'
  const contract = { apis: { 'status.json': { fields: { 'object[]': 'records' }, values: { records: ['予報'] }, examples: 'cases' } }, examples: { cases: [example] } }
  const status = (type, value, link) => reference('status.json', `${fieldTable([['records', `Bulletin: \`${value}\` (${type})`]])}\n\n[Example](${link})`)
  const valid = status('array of objects', '予報', example)
  audit(http, valid, contract)
  assert.throws(() => audit(http, status('string', '予報', example), contract), /records: JSON type/)
  assert.throws(() => audit(http, status('array of objects or string', '予報', example), contract), /ambiguous JSON type/)
  assert.throws(() => audit(http, status('array of objects', 'forecast', example), contract), /missing 予報/)
  assert.throws(() => audit(http, status('array of objects', '予報', '/elsewhere.json'), contract), /missing link/)
  assert.throws(() => audit(http, valid, { ...contract, metadataLocale: 'ja' }), /frontmatter locale/)
  assert.throws(() => audit(http, valid, { ...contract, date: '2030-02-30' }), /invalid updated date/)
  assert.throws(() => audit('legal/privacy.md', '## Scope'), /missing policy body/)
  audit('legal/privacy.md', '## Scope\n\nInitial wording.')
  audit('legal/privacy.md', '## Updated scope\n\nRevised wording.\n\n## Additional information\n\nA reviewed new clause.')
})
