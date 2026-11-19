import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

// Public fields reviewed against jma_seismic/src/{public,tsunami}.rs.
// Run entirely offline; protect the documented contract, not example payloads.
export const jmaSections = {
  ja: ['JMA 地震詳細 JSON API', 'JMA 津波情報 JSON API', 'JMA 特別地震情報 JSON API'],
  zh: ['JMA 地震详情 JSON API', 'JMA 海啸情报 JSON API', 'JMA 特别地震情报 JSON API'],
  en: ['JMA Earthquake Detail JSON API', 'JMA Tsunami Information JSON API', 'JMA Special Earthquake Information JSON API'],
}
const products = ['jma_earthquake_detail', 'jma_tsunami', 'jma_special_eq']
const commands = ['query_jmatsunami', 'query_jmaspecialeq']
const tsunamiStates = ['uninitialized', 'unknown', 'active', 'forecast_only', 'cleared', 'expired', 'none_reported']
const observation = 'events[].reports[].observation'

function fields(prefix, groups) {
  return Object.fromEntries(Object.entries(groups).flatMap(([names, type]) =>
    names.split(',').map(name => [prefix ? `${prefix}.${name}` : name, type])))
}

const contracts = [
  {
    events: 'object[]',
    md5: 'string',
    ...fields('events[]', { 'eventId,status,completeness': 'string', 'hypocenters,reports': 'object[]', 'summary': 'object' }),
    ...fields('events[].hypocenters[]', { 'latitude,longitude,depth': 'number/null' }),
    ...fields('events[].reports[]', {
      'id,product,status,magnitudeType,magnitudeText,magnitudeCondition,text': 'string',
      'time,issuedAt,targetTime,originTime,arrivalTime': 'string/null',
      'hypocenter': 'integer',
      'magnitude': 'number/null',
      'observation,comments': 'object',
    }),
    ...fields(observation, { 'maxIntensity,maxLongPeriod': 'string', 'prefs,areas,cities': 'object[]' }),
    ...fields(observation, { 'areas[].stations,cities[].stations': 'object[]' }),
  },
  {
    ...fields('', { 'type,status,reason,text,md5': 'string', 'trusted': 'boolean', 'validUntil': 'string/null', 'report': 'object/null', 'areas,observations': 'object[]', 'lastKnown,comments': 'object' }),
    ...fields('areas[]', { 'level,kind,previousKind': 'string', 'firstWave,maxWave': 'object', 'stations': 'object[]' }),
    ...fields('observations[]', { 'observed,estimated': 'object[]' }),
  },
  {
    type: 'string',
    reports: 'object[]',
    appendices: 'string[]',
    md5: 'string',
    ...fields('reports[]', { 'id,product,status,kind,code,label,title,text,notice,next': 'string', 'time': 'string/null', 'eventIds': 'string[]', 'appendix': 'integer' }),
  },
]
const aliases = {
  文字列型: 'string', 字符串型: 'string', string: 'string',
  数値型: 'number', 数值型: 'number', number: 'number',
  整数型: 'integer', integer: 'integer',
  オブジェクト型: 'object', 对象型: 'object', object: 'object',
  オブジェクト配列: 'object[]', 对象数组: 'object[]', objectarray: 'object[]',
  文字列配列: 'string[]', 字符串数组: 'string[]', stringarray: 'string[]',
  真偽型: 'boolean', 布尔型: 'boolean', boolean: 'boolean', null: 'null',
}
const semantics = {
  ja: {
    'events[].status': [/preliminary/, /reported/, /cancelled/, /すべて取消/],
    'events[].completeness': [/pending/, /complete/, /partial/, /欠測値/],
    'events[].reports[].hypocenter': [/同じイベント/, /0.*有効/],
    'status': [/unknown.*安全を意味しない/, /cleared.*公式解除/, /expired.*解除ではない/],
    'trusted': [/true.*危険がないという意味ではない/],
    'validUntil': [/trusted=true/, /有効な非空/, /現在時刻が前/, /切断/, /クライアント側/],
    'areas': [/空配列.*安全を意味しない/],
    'areas[].maxWave': [/巨大/, /高い/, /10m超/, /下限/, /精密な実測値ではない/],
    'lastKnown': [/参考用/, /現在有効な警報ではない/],
    'reports': [/最新1件/, /完全な履歴ではなく/, /現在の警戒を意味しない/],
    'reports[].product': [/定例解説.*臨時の警戒を意味しない/],
    'reports[].appendix': [/appendices/, /0.*有効/],
  },
  zh: {
    'events[].status': [/preliminary/, /reported/, /cancelled/, /均已取消/],
    'events[].completeness': [/pending/, /complete/, /partial/, /不保证所有字段均有值/],
    'events[].reports[].hypocenter': [/当前事件/, /0.*有效/],
    'status': [/unknown.*不表示安全/, /cleared.*官方解除/, /expired.*不等于解除/],
    'trusted': [/true.*不代表没有海啸风险/],
    'validUntil': [/trusted=true/, /有效非空/, /当前时刻早于/, /断线/, /客户端/],
    'areas': [/空数组不代表安全/],
    'areas[].maxWave': [/巨大/, /高い/, /10m超/, /下界/, /不能视为精确实测值/],
    'lastKnown': [/仅供参考/, /不是当前有效警报/],
    'reports': [/最新一份/, /不是完整历史/, /不代表当前警戒仍然有效/],
    'reports[].product': [/定期解说不等于临时警戒/],
    'reports[].appendix': [/appendices/, /0.*有效/],
  },
  en: {
    'events[].status': [/preliminary/, /reported/, /cancelled/, /all retained product reports are cancelled/],
    'events[].completeness': [/pending/, /complete/, /partial/, /does not guarantee values/],
    'events[].reports[].hypocenter': [/this event/, /0.*valid/],
    'status': [/unknown.*no assurance of safety/, /cleared.*officially lifted/, /expired.*not lifted/],
    'trusted': [/true does not mean no tsunami risk/],
    'validUntil': [/trusted=true/, /valid and nonempty/, /current time is before/, /disconnection/, /clients must enforce expiry/],
    'areas': [/empty array does not mean safe/],
    'areas[].maxWave': [/巨大/, /高い/, /10m超/, /lower-bound/, /not precise measurements/],
    'lastKnown': [/reference only/, /not a currently valid warning/],
    'reports': [/Latest report per product/, /not a complete archive/, /does not mean an alert is still in effect/],
    'reports[].product': [/Regular commentary does not indicate a temporary alert/],
    'reports[].appendix': [/appendices/, /0.*valid/],
  },
}

function sections(markdown) {
  return [...markdown.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)]
    .map(match => ({ title: match[1], text: match[0] }))
}

function fieldTable(section) {
  assert.equal((section.match(/^\| Field \| Description \|$/gm) ?? []).length, 1, 'one two-column field table per API')
  assert(!/^#{3,}|^```(?:json|js)|^\| Field \| Type/m.test(section), 'keep API sections concise')
  const result = new Map()
  for (const row of section.matchAll(/^\| (`[^|]+`) \| ([^|\n]+) \|$/gm)) {
    const description = row[2]
    const suffix = description.match(/[（(]([^（）()]*)[）)]$/u)?.[1]
    assert(suffix, `missing field type: ${row[1]}`)
    const optional = /任意|可选|optional/.test(suffix)
    const type = suffix.replace(/(?:、任意|，可选|; optional)/g, '').toLowerCase().replaceAll(/\s+/g, '')
      .split('/').map((name) => {
        assert(aliases[name], `unrecognized field type ${name}`)
        return aliases[name]
      }).join('/')
    for (const field of row[1].matchAll(/`([^`]+)`/g)) {
      assert(!result.has(field[1]), `duplicate documented field ${field[1]}`)
      result.set(field[1], { type, optional, description })
    }
  }
  return result
}

export async function checkJmaDocs(root) {
  const signatures = []
  const searchIndex = JSON.parse(await fs.readFile(path.join(root, 'public/search-index.json'), 'utf8'))
  for (const locale of ['ja', 'zh', 'en']) {
    const prefix = locale === 'ja' ? '' : `/${locale}`
    const markdown = await fs.readFile(path.join(root, `content/${locale}/docs/open-api.md`), 'utf8')
    const ws = await fs.readFile(path.join(root, `content/${locale}/docs/websocket.md`), 'utf8')
    const all = sections(markdown)
    const apis = jmaSections[locale].map(title => all.find(section => section.title === title))
    assert(apis.every(Boolean), `${locale}: missing API section`)
    const start = all.indexOf(apis[0])
    assert.deepEqual(all.slice(start, start + 3), apis, `${locale}: API order`)
    const list = all[start - 1].text
    for (const token of ['https://api.wolfx.jp/jma_eqlist.json', '`EventID`', '`time_full`', '`info`'])
      assert(list.includes(token), `${locale}: preserve earthquake list corrections`)
    assert(all[start + 3].text.includes('https://api.wolfx.jp/cenc_eqlist.json'))
    const tables = apis.map((api, i) => {
      const table = fieldTable(api.text)
      assert.deepEqual(Object.fromEntries([...table].map(([name, value]) => [name, value.type])), contracts[i], `${locale}/${products[i]}: public fields and types`)
      const endpoints = [...api.text.matchAll(/^```text\n([^\n]+)\n```/gm)].map(match => match[1])
      assert.deepEqual(endpoints, [`https://api.wolfx.jp/${products[i]}.json`, ...(i ? [`wss://ws-api.wolfx.jp/${products[i]}`] : [])])
      assert.equal((api.text.match(/^```/gm) ?? []).length, endpoints.length * 2, 'only endpoint code blocks are needed')
      assert(!/気象庁発表\s*\/|加工・提供|加工提供|Issued by JMA|\bnew APIs?\b|新增接口|新接口|新しい3 API|^\s*(?:NEW|New|新規)\s*$/im.test(api.text), 'no announcement or repeated source paragraph')
      if (i)
        assert(table.get('type').description.includes('WebSocket'), 'type is WebSocket-only')
      return table
    })
    for (const [name, patterns] of Object.entries(semantics[locale])) {
      const field = tables.find(table => table.has(name))?.get(name)
      for (const pattern of patterns)
        assert.match(field.description.replaceAll('`', ''), pattern, `${locale}/${name}: preserve meaning`)
    }
    for (const term of [...tsunamiStates, 'major_warning', 'warning', 'advisory', 'forecast', 'cleared', 'none'])
      assert(apis[1].text.includes(`\`${term}\``), `${locale}: missing tsunami state/category ${term}`)
    for (const term of ['VYSE50', 'VYSE51', 'VYSE52', 'VYSE60'])
      assert(tables[2].get('reports[].product').description.includes(term))
    for (const unit of ['UTC RFC 3339', 'km', 'cm/s'])
      assert(apis[0].text.includes(unit), `${locale}: missing ${unit}`)
    assert(ws.includes('\nwss://ws-api.wolfx.jp/all_eew\n'), `${locale}: default aggregate endpoint`)
    for (const [i, command] of commands.entries()) {
      assert(ws.includes(`wss://ws-api.wolfx.jp/${products[i + 1]}\n`))
      assert(ws.includes(`\n${command}\n`), `${locale}: exact manual query`)
    }
    assert(!/ws-api\.wolfx\.jp\/(?:jma_earthquake_detail|jma_seismic_status)|query_jma_?(?:earthquake_?detail|seismic_?status)|query_jma_(?:tsunami|special_eq)|jma_seismic_status\.json/.test(markdown + ws), `${locale}: unsupported endpoint or command`)
    for (const term of ['heartbeat', 'pong', 'query_jmaeqlist', '`type`'])
      assert(ws.includes(term), `${locale}: preserve ${term}`)
    signatures.push(tables.map(table => [...table].map(([name, { type, optional }]) => [name, type, optional]).sort()))
    for (const document of ['open-api', 'websocket']) {
      const source = document === 'open-api' ? markdown : ws
      assert.equal((source.match(/^```/gm) ?? []).length % 2, 0, `${locale}/${document}: unclosed code fence`)
      const entry = searchIndex.find(item => item.path === `${prefix}/docs/${document}`)
      assert(entry, `${locale}/${document}: missing search entry`)
      for (const product of document === 'open-api' ? products : products.slice(1))
        assert(entry.text.includes(product.replaceAll('_', '')), `${locale}/${document}: missing search term ${product}`)
      if (document === 'open-api') {
        for (const title of jmaSections[locale])
          assert(entry.headings.includes(title), `${locale}: missing API search heading`)
      }
      const html = await fs.readFile(path.join(root, `.output/public${prefix}/docs/${document}/index.html`), 'utf8')
      for (const product of document === 'open-api' ? products : products.slice(1))
        assert(html.includes(product), `${locale}/${document}: missing generated API ${product}`)
    }
  }
  assert.deepEqual(signatures[0], signatures[1], 'ja/zh fields, types and optionality must agree')
  assert.deepEqual(signatures[0], signatures[2], 'ja/en fields, types and optionality must agree')
}
