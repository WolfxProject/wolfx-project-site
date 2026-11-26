// Public identifiers and JSON types used by the Open API and WebSocket guides. Update these
// with the corresponding service or a verified response when the protocol changes.
// A trailing ? marks fields explicitly documented as optional in the type label.
const continentalEew = {
  string: 'type EventID ReportTime OriginTime HypoCenter',
  number: 'ReportNum Latitude Longitude Magnitude',
}
const nationalEew = {
  'string': `${continentalEew.string} ID`,
  'number': `${continentalEew.number} MaxIntensity`,
  'number/null': 'Depth',
}

export const subscriptions = {
  sc_eew: 'query_sceew', jma_eew: 'query_jmaeew', fj_eew: 'query_fjeew', cq_eew: 'query_cqeew', cenc_eew: 'query_cenceew',
  cenc_eqlist: 'query_cenceqlist', jma_eqlist: 'query_jmaeqlist', jma_tsunami: 'query_jmatsunami', jma_special_eq: 'query_jmaspecialeq',
}

// JMA detailed-product definitions were reviewed against jma_seismic's public
// and tsunami serializers. The EEW and tsunami directories hold public examples.
export const httpApis = {
  'jma_eew.json': {
    fields: {
      string: 'type Title CodeType Issue.Source Issue.Status EventID AnnouncedTime OriginTime Hypocenter MaxIntensity Accuracy.Epicenter Accuracy.Depth Accuracy.Magnitude MaxIntChange.String MaxIntChange.Reason WarnArea[].Chiiki WarnArea[].Shindo1 WarnArea[].Shindo2 WarnArea[].Time WarnArea[].Type WarnArea[].Arrive OriginalText',
      number: 'Serial Latitude Longitude Magnitude Magunitude Depth',
      array: 'WarnArea',
      boolean: 'isSea isTraining isAssumption isWarn isFinal isCancel',
    },
    values: { 'WarnArea[].Type': ['予報', '警報'] },
    links: ['https://x.com/t0729_'],
    examples: 'jma_eew',
  },
  'jma_eqlist.json': {
    fields: { string: 'type Title EventID time time_full location magnitude shindo depth latitude longitude info md5', object: 'No(1~50)' },
  },
  'jma_earthquake_detail.json': {
    fields: {
      'object[]': 'events events[].hypocenters events[].reports',
      'string': 'events[].eventId events[].status events[].completeness events[].reports[].id events[].reports[].product events[].reports[].status md5',
      'number/null': 'events[].hypocenters[].latitude events[].hypocenters[].longitude events[].hypocenters[].depth',
      'string/null': 'events[].reports[].time events[].reports[].issuedAt events[].reports[].targetTime',
      'string/null?': 'events[].reports[].originTime events[].reports[].arrivalTime',
      'integer?': 'events[].reports[].hypocenter',
      'number/null?': 'events[].reports[].magnitude',
      'string?': 'events[].reports[].magnitudeType events[].reports[].magnitudeText events[].reports[].magnitudeCondition events[].reports[].observation.maxIntensity events[].reports[].observation.maxLongPeriod events[].reports[].text',
      'object?': 'events[].reports[].observation events[].reports[].comments events[].summary',
      'object[]?': 'events[].reports[].observation.prefs events[].reports[].observation.areas events[].reports[].observation.cities events[].reports[].observation.areas[].stations events[].reports[].observation.cities[].stations',
    },
    values: {
      'events[].status': ['preliminary', 'reported', 'cancelled'],
      'events[].completeness': ['pending', 'complete', 'partial'],
      'events[].reports[].product': ['VXSE51', 'VXSE52', 'VXSE53', 'VXSE61', 'VXSE62'],
      'events[].reports[].status': ['issued', 'corrected', 'cancelled'],
      'events[].reports[].hypocenter': ['0'],
      'events[].reports[].time': ['UTC', 'RFC 3339'],
      'events[].hypocenters[].depth': ['km'],
      'events[].reports[].observation.areas[].stations': ['sva', 'cm/s'],
    },
  },
  'jma_tsunami.json': {
    fields: {
      'string': 'type status reason areas[].level areas[].kind areas[].previousKind md5',
      'boolean': 'trusted',
      'string/null': 'validUntil',
      'object/null': 'report',
      'object[]': 'areas observations',
      'object?': 'areas[].firstWave areas[].maxWave lastKnown comments',
      'object[]?': 'areas[].stations observations[].observed observations[].estimated',
      'string?': 'text',
    },
    values: {
      'status': ['uninitialized', 'unknown', 'active', 'forecast_only', 'cleared', 'expired', 'none_reported'],
      'validUntil': ['trusted=true', 'UTC', 'RFC 3339'],
      'areas[].level': ['major_warning', 'warning', 'advisory', 'forecast', 'cleared', 'none'],
      'areas[].maxWave': ['巨大', '高い', '10m超'],
      'report': ['VTSE41'],
      'observations': ['VTSE51'],
    },
    examples: 'jma_tsunami',
  },
  'jma_special_eq.json': {
    fields: {
      'string': 'type reports[].id reports[].product reports[].status md5',
      'object[]': 'reports',
      'string/null': 'reports[].time',
      'string[]': 'reports[].eventIds appendices',
      'string?': 'reports[].kind reports[].code reports[].label reports[].title reports[].text reports[].notice reports[].next',
      'integer?': 'reports[].appendix',
    },
    values: { 'reports[].product': ['VYSE50', 'VYSE51', 'VYSE52', 'VYSE60'], 'reports[].appendix': ['appendices', '0'] },
  },
  // CENC records and weather rankings were checked against the public JSON
  // on 2026-11-24. NoN.type belongs to an earthquake record; type is the
  // top-level discriminator carried by the WebSocket message.
  'cenc_eqlist.json': {
    fields: { string: 'type NoN.type EventID ReportTime time location placeName magnitude depth latitude longitude intensity md5', object: 'No(1~50)' },
    values: { 'NoN.type': ['automatic', 'reviewed'] },
  },
  'sc_eew.json': { fields: { 'string': continentalEew.string, 'number': `${continentalEew.number} ID Magunitude MaxIntensity`, 'number/null': 'Depth' } },
  'cenc_eew.json': { fields: nationalEew },
  'fj_eew.json': { fields: { string: continentalEew.string, number: `${continentalEew.number} ID Magunitude`, boolean: 'isFinal' } },
  'cq_eew.json': { fields: nationalEew },
  'cwa_eew.json': {
    locales: ['zh'],
    fields: { number: 'ID ReportNum Latitude Longitude Magnitude Magunitude Depth', string: 'ReportTime OriginTime HypoCenter MaxIntensity' },
  },
  'weather_rank.json': { fields: { 'object': 'YYYYMMDDHH00', 'object[]': 'tempRank rainRank windSRank', 'string': 'md5' }, properties: ['province', 'city', 'value'] },
  'geoip.php': { fields: { string: 'ip country_code country_name country_name_zh province_code province_name province_name_zh city city_zh', number: 'latitude longitude' }, parameters: { ip: 'address' } },
  'ntp.json': { fields: { string: 'JST CST str', number: 'int timestamp' } },
  'ip.php': {},
  'img.php': { parameters: { return: ['img', 'json'] } },
}

export const messageFields = {
  common: { string: 'type' },
  heartbeat: { string: 'type id timestamp', number: 'ver' },
  pong: { string: 'type timestamp' },
}
