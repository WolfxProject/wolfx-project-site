import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

// Public contracts reviewed against jma_seismic/src/{public,tsunami,compat}.rs,
// tests/public_api.rs and JMA's official XML samples, 2026-11-16.
// Keep these checks independent of a sibling checkout or production network.
export const jmaSections = {
  ja: ['JMA 地震詳細 JSON API', 'JMA 津波情報 JSON API', 'JMA 特別地震情報 JSON API'],
  zh: ['JMA 地震详情 JSON API', 'JMA 海啸情报 JSON API', 'JMA 特别地震情报 JSON API'],
  en: ['JMA Earthquake Detail JSON API', 'JMA Tsunami Information JSON API', 'JMA Special Earthquake Information JSON API'],
}
const products = ['jma_earthquake_detail', 'jma_tsunami', 'jma_special_eq']
const states = ['uninitialized', 'unknown', 'active', 'forecast_only', 'cleared', 'expired', 'none_reported']
const reportFields = ['id', 'product', 'time', 'status', 'issuedAt', 'targetTime', 'title', 'serial', 'validUntil']
const reportRequired = ['id', 'product', 'time', 'status']
const waveFields = ['time', 'height', 'text', 'heightCondition', 'condition', 'initial', 'revise']
const observationFields = ['maxIntensity', 'maxLongPeriod', 'longPeriodCategory', 'prefs', 'areas', 'cities']
const rowFields = ['code', 'name', 'int', 'lg', 'condition', 'revise']
const stationFields = ['code', 'name', 'sensor', 'highTide', 'firstWave', 'maxWave']
const areaFields = ['code', 'name', 'level', 'kind', 'previousKind', 'firstWave', 'maxWave', 'stations']
const typeDescriptions = {
  ja: ['最大100', '最大約90秒', '公式解除ではない', '現在の臨時の地震警戒を意味しません', 'クライアント自身が期限切れを処理'],
  zh: ['最多100', '最长约90秒', '不是官方解除', '不等于当前存在临时地震警戒', '客户端也必须自行判断失效'],
  en: ['Up to 100', 'at most about 90 seconds', 'not an official lifting', 'does not mean a temporary earthquake alert is currently in effect', 'Clients must expire their cached state'],
}

function object(value, fields, required = [], label = 'object') {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${label}: expected object`)
  assert.deepEqual(Object.keys(value).filter(key => !fields.includes(key)), [], `${label}: unknown fields`)
  for (const key of required)
    assert(Object.hasOwn(value, key), `${label}: missing ${key}`)
}

function text(value, label) {
  assert.equal(typeof value, 'string', `${label}: expected string`)
}

function timestamp(value, label) {
  if (value === null)
    return
  text(value, label)
  assert(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)), `${label}: expected UTC RFC 3339`)
}

function index(value, values, label) {
  assert(Number.isInteger(value) && value >= 0 && value < values.length, `${label}: invalid array index ${value}`)
}

function report(value) {
  for (const key of ['id', 'product', 'status'])
    text(value[key], key)
  assert(['issued', 'corrected', 'cancelled'].includes(value.status))
  for (const key of ['time', 'issuedAt', 'targetTime', 'validUntil']) {
    if (Object.hasOwn(value, key))
      timestamp(value[key], key)
  }
  for (const key of ['title', 'serial']) {
    if (Object.hasOwn(value, key))
      text(value[key], key)
  }
}

function comments(value) {
  object(value, ['forecast', 'warning', 'note', 'text', 'urls'])
  for (const [key, item] of Object.entries(value)) {
    if (key === 'urls') {
      assert(Array.isArray(item))
      item.forEach(url => text(url, 'comment URL'))
    }
    else {
      text(item, key)
    }
  }
}

function observation(value) {
  object(value, observationFields)
  for (const key of ['maxIntensity', 'maxLongPeriod', 'longPeriodCategory']) {
    if (Object.hasOwn(value, key))
      text(value[key], key)
  }
  for (const [key, parent] of [['prefs', null], ['areas', 'pref'], ['cities', 'area']]) {
    if (!Object.hasOwn(value, key))
      continue
    assert(Array.isArray(value[key]))
    for (const row of value[key]) {
      object(row, [...rowFields, ...(parent ? [parent, 'stations'] : [])], ['code', 'name', ...(parent ? [parent] : [])])
      for (const name of rowFields) {
        if (Object.hasOwn(row, name))
          text(row[name], name)
      }
      if (parent)
        index(row[parent], value[parent === 'pref' ? 'prefs' : 'areas'] ?? [], parent)
      if (row.stations) {
        assert(Array.isArray(row.stations))
        for (const station of row.stations) {
          object(station, [...rowFields, 'sva', 'periods'], ['code', 'name'])
          for (const name of rowFields) {
            if (Object.hasOwn(station, name))
              text(station[name], name)
          }
          if (Object.hasOwn(station, 'sva'))
            assert(station.sva === null || typeof station.sva === 'number')
          if (station.periods) {
            assert(Array.isArray(station.periods))
            for (const band of station.periods) {
              object(band, ['period', 'class', 'sva'], ['period'])
              assert(Number.isInteger(band.period) && band.period >= 1 && band.period <= 7)
              if (Object.hasOwn(band, 'class'))
                text(band.class, 'class')
              if (Object.hasOwn(band, 'sva'))
                assert(band.sva === null || typeof band.sva === 'number')
            }
          }
        }
      }
    }
  }
}

function earthquake(value) {
  object(value, ['events', 'md5'], ['events', 'md5'])
  assert(Array.isArray(value.events) && value.events.length <= 100)
  for (const event of value.events) {
    object(event, ['eventId', 'status', 'completeness', 'hypocenters', 'reports', 'summary'], ['eventId', 'status', 'completeness', 'hypocenters', 'reports'])
    assert(/^\d{14}$/.test(event.eventId))
    assert(['preliminary', 'reported', 'cancelled'].includes(event.status))
    assert(['pending', 'complete', 'partial'].includes(event.completeness))
    assert(Array.isArray(event.hypocenters) && Array.isArray(event.reports))
    for (const hypocenter of event.hypocenters) {
      object(hypocenter, ['name', 'code', 'latitude', 'longitude', 'depth', 'detail', 'detailCode', 'location', 'source', 'description'], ['name', 'code', 'latitude', 'longitude', 'depth'])
      for (const key of ['latitude', 'longitude', 'depth'])
        assert(hypocenter[key] === null || typeof hypocenter[key] === 'number')
      for (const key of ['name', 'code'])
        assert(hypocenter[key] === null || typeof hypocenter[key] === 'string')
    }
    for (const item of event.reports) {
      object(item, [...reportFields, 'originTime', 'arrivalTime', 'hypocenter', 'magnitude', 'magnitudeType', 'magnitudeText', 'magnitudeCondition', 'observation', 'comments', 'text'], reportRequired)
      report(item)
      if (Object.hasOwn(item, 'hypocenter'))
        index(item.hypocenter, event.hypocenters, 'hypocenter')
      for (const key of ['originTime', 'arrivalTime']) {
        if (Object.hasOwn(item, key))
          timestamp(item[key], key)
      }
      if (Object.hasOwn(item, 'magnitude'))
        assert(item.magnitude === null || typeof item.magnitude === 'number')
      if (item.observation)
        observation(item.observation)
      if (item.comments)
        comments(item.comments)
    }
  }
  assert.equal(value.events[0].reports[0].hypocenter, 0, 'example must demonstrate valid zero index')
}

function wave(value) {
  object(value, waveFields)
  for (const key of waveFields) {
    if (!Object.hasOwn(value, key))
      continue
    if (key === 'time')
      timestamp(value[key], key)
    else if (key === 'height')
      assert(value[key] === null || typeof value[key] === 'number')
    else
      text(value[key], key)
  }
}

function tsunamiAreas(areas, forecast) {
  assert(Array.isArray(areas))
  const levels = { major_warning: ['52', '53'], warning: ['51'], advisory: ['62'], forecast: ['71', '72', '73'], cleared: ['50', '60'], none: ['00'] }
  for (const area of areas) {
    object(area, forecast ? areaFields : ['code', 'name', 'stations', 'firstWave', 'maxWave'], forecast ? ['code', 'name', 'level', 'kind'] : ['code', 'name'])
    text(area.code, 'area code')
    text(area.name, 'area name')
    if (forecast)
      assert(levels[area.level]?.includes(area.kind), 'official tsunami category mapping')
    for (const key of ['firstWave', 'maxWave']) {
      if (area[key])
        wave(area[key])
    }
    if (area.stations) {
      assert(Array.isArray(area.stations))
      for (const station of area.stations) {
        object(station, stationFields, ['code', 'name'])
        for (const key of ['firstWave', 'maxWave']) {
          if (station[key])
            wave(station[key])
        }
        if (Object.hasOwn(station, 'highTide'))
          timestamp(station.highTide, 'highTide')
      }
    }
  }
}

function tsunami(value) {
  object(value, ['status', 'reason', 'trusted', 'validUntil', 'report', 'areas', 'observations', 'lastKnown', 'comments', 'text', 'md5'], ['status', 'reason', 'trusted', 'validUntil', 'report', 'areas', 'observations', 'md5'])
  assert(states.includes(value.status))
  assert.equal(typeof value.trusted, 'boolean')
  timestamp(value.validUntil, 'trust deadline')
  if (value.report) {
    object(value.report, [...reportFields, 'eventIds'], [...reportRequired, 'eventIds'])
    report(value.report)
    assert.equal(value.report.product, 'VTSE41')
    assert(Array.isArray(value.report.eventIds))
  }
  tsunamiAreas(value.areas, true)
  assert(Array.isArray(value.observations))
  for (const item of value.observations) {
    object(item, [...reportFields, 'eventIds', 'areas', 'observed', 'estimated', 'comments', 'text'], [...reportRequired, 'eventIds'])
    report(item)
    assert(['VTSE51', 'VTSE52'].includes(item.product))
    for (const key of ['areas', 'observed', 'estimated']) {
      if (item[key])
        tsunamiAreas(item[key], key === 'areas')
    }
  }
  if (value.lastKnown) {
    assert.equal(value.trusted, false)
    object(value.lastKnown, ['areas', 'observations', 'comments', 'text'], ['areas', 'observations'])
    tsunamiAreas(value.lastKnown.areas, true)
  }
  // This example must keep historical sample warnings explicitly untrusted.
  assert.equal(value.status, 'unknown')
  assert.equal(value.trusted, false)
  assert.equal(value.validUntil, null)
  assert.deepEqual(value.areas, [])
  assert(value.lastKnown.areas.length > 0)
}

function special(value) {
  object(value, ['reports', 'appendices', 'md5'], ['reports', 'appendices', 'md5'])
  assert(Array.isArray(value.reports) && value.reports.length <= 4)
  assert(Array.isArray(value.appendices))
  value.appendices.forEach(item => text(item, 'appendix'))
  assert.equal(new Set(value.appendices).size, value.appendices.length)
  assert.equal(new Set(value.reports.map(item => item.product)).size, value.reports.length)
  for (const item of value.reports) {
    object(item, [...reportFields, 'eventIds', 'kind', 'code', 'label', 'text', 'notice', 'next', 'appendix'], [...reportRequired, 'eventIds'])
    report(item)
    assert(['VYSE50', 'VYSE51', 'VYSE52', 'VYSE60'].includes(item.product))
    assert(Array.isArray(item.eventIds))
    if (Object.hasOwn(item, 'appendix'))
      index(item.appendix, value.appendices, 'appendix')
  }
  assert.equal(value.reports[0].appendix, 0, 'example must demonstrate valid zero index')
}

function sections(markdown) {
  return [...markdown.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)]
    .map(match => ({ title: match[1], text: match[0] }))
}

export async function checkJmaDocs(root) {
  const signatures = []
  const exampleSets = []
  const searchIndex = JSON.parse(await fs.readFile(path.join(root, 'public/search-index.json'), 'utf8'))
  for (const locale of ['ja', 'zh', 'en']) {
    const prefix = locale === 'ja' ? '' : `/${locale}`
    const markdown = await fs.readFile(path.join(root, `content/${locale}/docs/open-api.md`), 'utf8')
    const ws = await fs.readFile(path.join(root, `content/${locale}/docs/websocket.md`), 'utf8')
    const all = sections(markdown)
    const additions = jmaSections[locale].map(title => all.find(section => section.title === title))
    assert(additions.every(Boolean), `${locale}: missing API sections`)
    const start = all.indexOf(additions[0])
    assert.deepEqual(all.slice(start, start + 3), additions, `${locale}: section order`)
    assert(all[start - 1].text.includes('https://api.wolfx.jp/jma_eqlist.json'), `${locale}: new APIs must follow the legacy list`)
    assert(all[start + 3].text.includes('https://api.wolfx.jp/cenc_eqlist.json'), `${locale}: preserve other APIs`)
    const added = additions.map(section => section.text).join('')
    for (const term of typeDescriptions[locale])
      assert(added.includes(term), `${locale}: missing semantic guard ${term}`)
    for (const term of [...reportFields, ...waveFields, ...observationFields, ...rowFields, ...stationFields, ...areaFields, 'sva', 'periods', 'class', 'period', 'pref', 'area', 'observed', 'estimated', 'appendix', 'notice', 'next', 'summary', 'magnitudeCondition', ...states, 'preliminary', 'reported', 'cancelled', 'pending', 'complete', 'partial'])
      assert(added.includes(`\`${term}\``) || added.includes(`.${term}\``) || added.includes(`\`${term}[]\``), `${locale}: missing public field or enum ${term}`)
    for (const [position, source] of products.entries()) {
      assert(additions[position].text.includes(`https://api.wolfx.jp/${source}.json`))
      if (position > 0) {
        assert(additions[position].text.includes(`wss://ws-api.wolfx.jp/${source}`))
        assert(ws.includes(`wss://ws-api.wolfx.jp/${source}`))
        assert(ws.includes(`query_${source.replaceAll('_', '')}`))
        assert(ws.includes(`\`${source}\``), `${locale}: missing message type`)
      }
    }
    const aggregate = ws.slice(ws.indexOf('wss://ws-api.wolfx.jp/all_eew'), ws.indexOf('wss://ws-api.wolfx.jp/sc_eew'))
    for (const source of products.slice(1))
      assert(aggregate.includes(`\`${source}\``), `${locale}: aggregate must document ${source}`)
    assert(!additions[0].text.includes('wss://'), `${locale}: detail is HTTP only`)
    assert(!/ws-api\.wolfx\.jp\/(?:jma_earthquake_detail|jma_seismic_status)|query_jma_?(?:earthquake_?detail|seismic_?status)|query_jma_(?:tsunami|special_eq)|jma_seismic_status\.json/.test(markdown + ws), `${locale}: unsupported endpoint or command`)
    for (const code of ['trusted === true', 'Number.isFinite(deadline)', 'Date.now() < deadline', 'Date.now() < Date.parse(validUntil)'])
      assert((markdown + ws).includes(code), `${locale}: missing trust check ${code}`)
    assert(ws.includes('heartbeat') && ws.includes('pong') && ws.includes('query_jmaeqlist'))
    // Field names, normalized types, URLs, examples and commands must agree in all locales.
    signatures.push([...added.matchAll(/^\| ((?:`[^`]+`(?:, )?)+) \| ([^|]+) \|/gm)]
      .filter(match => /^(?:string|number|integer|boolean|object)\b/.test(match[2]))
      .map(match => [match[1], match[2].replace(/(?:、任意|，可选|, optional)/g, '').trim()]))
    const examples = additions.map((section, i) => {
      const blocks = [...section.text.matchAll(/^```json\n([\s\S]*?)\n```/gm)]
      assert.equal(blocks.length, 1, `${locale}/${products[i]}: one JSON example`)
      const value = JSON.parse(blocks[0][1])
      const { md5, ...body } = value
      assert.equal(md5, createHash('md5').update(JSON.stringify(body)).digest('hex'), `${locale}/${products[i]}: example MD5`)
      ;[earthquake, tsunami, special][i](value)
      return value
    })
    exampleSets.push(examples)
    for (const document of ['open-api', 'websocket']) {
      const source = document === 'open-api' ? markdown : ws
      assert.equal((source.match(/^```/gm) ?? []).length % 2, 0, `${locale}/${document}: unclosed code fence`)
      const entry = searchIndex.find(item => item.path === `${prefix}/docs/${document}`)
      assert(entry, `${locale}/${document}: missing search entry`)
      for (const product of document === 'open-api' ? products : products.slice(1))
        assert(entry.text.includes(product.replaceAll('_', '')), `${locale}/${document}: ${product} missing from the existing plain-text search index`)
      if (document === 'open-api') {
        for (const title of jmaSections[locale])
          assert(entry.headings.includes(title), `${locale}: API name missing from search headings`)
      }
      const html = await fs.readFile(path.join(root, `.output/public${prefix}/docs/${document}/index.html`), 'utf8')
      for (const product of document === 'open-api' ? products : products.slice(1))
        assert(html.includes(product), `${locale}/${document}: ${product} missing from prerendered HTML`)
    }
  }
  assert.deepEqual(signatures[0], signatures[1], 'ja/zh public fields and types must agree')
  assert.deepEqual(signatures[0], signatures[2], 'ja/en public fields and types must agree')
  assert.deepEqual(exampleSets[0], exampleSets[1], 'ja/zh examples must agree')
  assert.deepEqual(exampleSets[0], exampleSets[2], 'ja/en examples must agree')
}
