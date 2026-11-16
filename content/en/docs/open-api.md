---
title: "Wolfx Open API Usage"
description: "Wolfx Open API documentation for earthquake, EEW, and utility APIs over JSON, GET, and WebSocket."
locale: en
layout: docs
updated: 2026-11-16
source: apidoc_en.html
---
## Wolfx Open API Usage Guidelines

- Thank you for using the Wolfx Open API. Before using this service, please review the Privacy Policy and Terms of Service provided at the bottom of this page. For any questions, please contact contact@mtf.edu.kg. Wolfx Project is an unofficial project and is not affiliated with any government agency, meteorological organization, or earthquake-related authority in any country or region. The information provided by this service is for reference only and must not be used as a substitute for official earthquake warnings, disaster information, evacuation notices, or other official alert channels. During an emergency, always refer to the latest information issued by the relevant authorities.

## WebSocket API Usage Instructions

- For more details, please visit: [/en/docs/websocket\_en](/en/docs/websocket)

## JMA Earthquake Early Warning JSON API

- Description: Receive real-time Earthquake Early Warnings issued by the Japan Meteorological Agency. Low-latency reception support: [t0729](https://x.com/t0729_)
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/jma_eew.json
```

- WebSocket API Endpoint:

```text
wss://ws-api.wolfx.jp/jma_eew
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `type` | (WebSocket only) jma_eew (string) |
| `Title` | Earthquake Early Warning (EEW) title (string) |
| `CodeType` | EEW announcement category. Reports issued using the level method with only the maximum predicted seismic intensity are labeled "最大予測震度のみの緊急地震速報". This field does not provide a comprehensive classification of hypocenter estimation methods (string) |
| `Issue.Source` | Issuing meteorological office (string) |
| `Issue.Status` | Announcement status (string) |
| `EventID` | Earthquake Early Warning event ID (string) |
| `Serial` | Report number (number) |
| `AnnouncedTime` | Announcement time (UTC+9) (string) |
| `OriginTime` | Earthquake origin time (UTC+9). For the level method, this compatibility field contains detection time and may not represent the actual earthquake origin time (string) |
| `Hypocenter` | Hypocenter location (string) |
| `Latitude` | Latitude of the hypocenter (number) |
| `Longitude` | Longitude of the hypocenter (number) |
| `Magnitude` | Magnitude. The compatibility value 0 for unknown magnitude and the fixed value 1.0 for formal assumed hypocenter parameters are not measured values (number; recommended) |
| `Magunitude` | **Deprecated** legacy misspelling retained for backward compatibility with existing clients. Its value is always identical to `Magnitude`. New integrations should use `Magnitude`. This field may be removed in the future, so migration is strongly recommended. |
| `Depth` | Hypocenter depth (km). The 10 km value for the level method or formal assumed hypocenter parameters is assumed; unknown depth also maps to the compatibility value 0. These values are not necessarily measurements (number) |
| `MaxIntensity` | Maximum predicted seismic intensity (lower/upper) (string) |
| `Accuracy.Epicenter` | Information about epicenter accuracy (string) |
| `Accuracy.Depth` | Information about depth accuracy (string) |
| `Accuracy.Magnitude` | Information about magnitude accuracy (string) |
| `MaxIntChange.String` | Description of the maximum intensity change (string) |
| `MaxIntChange.Reason` | Reason for the maximum intensity change (string) |
| `WarnArea` | List of forecast and warning areas (array / JSON value) |
| `WarnArea[].Chiiki` | Forecast or warning area (string) |
| `WarnArea[].Shindo1` | Maximum seismic intensity in the area (lower/upper) (string) |
| `WarnArea[].Shindo2` | Minimum seismic intensity in the area (lower/upper) (string) |
| `WarnArea[].Time` | Predicted principal-motion arrival time; for a PLUM category, the time this intensity was first predicted. This is not the warning announcement time (UTC+9, HHMMSS, ////// when unknown; string) |
| `WarnArea[].Type` | Announcement type for the area, either "Forecast" or "Warning" (string) |
| `WarnArea[].Arrive` | Description of the regional arrival prediction or PLUM category (string) |
| `isSea` | Whether the earthquake occurred in a sea area (boolean) |
| `isTraining` | Whether this is a training report (boolean) |
| `isAssumption` | Indicates the use of formally designated assumed hypocenter parameters as defined by JMA. The level method alone does not set this flag, and false does not rule out PLUM-based predictions in some areas. Cancellation retains the value from the previous valid report (boolean) |
| `isWarn` | Whether this is a warning (boolean) |
| `isFinal` | Whether this is the final report (boolean) |
| `isCancel` | Whether this is a cancellation report (boolean) |
| `OriginalText` | Emergency Earthquake Warning (EEW) telegram text. An empty string is returned when unavailable (string) |

## JMA Earthquake Information JSON API

- Description: Retrieves the latest 50 earthquake reports issued by the Japan Meteorological Agency (JMA)
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/jma_eqlist.json
```

- WebSocket API Endpoint:

```text
wss://ws-api.wolfx.jp/jma_eqlist
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `type` | (WebSocket only) jma_eqlist (String) |
| `No (1~50)` | 50 objects named `No1`–`No50`, holding up to 50 events ordered by known origin time, then event ID, descending; unused slots retain empty strings and other compatibility values |
| `Title` | Publication title within each `NoN` (String) |
| `EventID` | Official event ID within each `NoN` (String) |
| `time` | Event time (UTC+9), `YYYY/MM/DD HH:mm` (String) |
| `time_full` | The same time with seconds, `YYYY/MM/DD HH:mm:ss` (UTC+9, String) |
| `location` | Hypocenter area; 震源 調査中 when unknown (String) |
| `magnitude` | Magnitude, including 不明 and existing compatibility representations (String) |
| `shindo` | Maximum intensity, retaining official strings such as `5-`, `5+`, and 不明 (String) |
| `depth` | Depth, such as `30km` (String) |
| `latitude` | Latitude with one decimal place (String) |
| `longitude` | Longitude with one decimal place (String) |
| `info` | That event’s official ForecastComment/Text, including tsunami outlooks; retained and progressively recovered for every entry. Empty when not yet obtained or not provided officially (String) |
| `md5` | Root update identifier: the existing implementation hashes compact UTF-8 JSON bytes for all `No1`–`No50` in their actual key order, excluding `md5` itself (String) |

Fields from `Title` through `info` belong to each `NoN`. Neither `time` nor `time_full` is publication time: they normally represent origin time but may use detection time for an intensity-only report under the legacy contract. The list has no separate publication-time field; use the detail API’s `reports[].time` for official report times. Unknown coordinates, intensity, and magnitude retain legacy representations; `0km` and `0.0` do not always mean measured zero. Later recovery or correction of `info` alone can change MD5.

## JMA Earthquake Detail JSON API

- Description: Retrieves earthquake events with official hypocenters, seismic intensity and long-period ground motion observations, comments, corrections, cancellations, and history recovery status. Issued by JMA / Delivered via DMDATA.JP / Processed and provided by Wolfx Project. The tsunami and special earthquake information APIs below use the same sources.
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/jma_earthquake_detail.json
```

This API is available over HTTP only. It has no separate WebSocket endpoint or manual query command and is not included in `all_eew`.

### Shared format for the three new APIs

These rules apply to earthquake detail, tsunami information, and special earthquake information. They differ from the legacy string fields and JST timestamps in `jma_eqlist.json`.

- Times use UTC RFC 3339, for example `2026-11-15T00:00:00.000Z`. Coordinates are decimal degrees; depth is in km, positive downwards; tsunami height is in m; long-period ground motion `sva` is in cm/s.
- Codes, event IDs, and serial numbers are strings that preserve leading zeros. Seismic intensity retains official strings such as `5-` and `5+`. Long-period ground motion classes are also strings; unknown values are not converted to zero.
- `null` means unknown or a value that cannot be reliably converted to a number or time. An omitted field is not supplied by that report, or is supplied by another effective report of the same product. Omission does not mean zero or cancellation.
- Array references are zero-based integers. `0` is valid and is not a persistent identifier. An empty array only means there are no items available to publish; it does not establish safety.

Report objects use the following shared metadata. Fields marked optional may be omitted.

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | DMDATA telegram ID; the official-sample examples below use offline identifiers |
| `product` | string | Official product code, such as `VXSE53` |
| `time` | string / null | Official publication time (Head/ReportDateTime), separate from origin time |
| `status` | string | `issued`, `corrected`, or `cancelled` |
| `issuedAt` | string / null, optional | Control/DateTime, included when different from `time`; used to order reports and process corrections |
| `targetTime` | string / null, optional | Head/TargetDateTime, included when different from `time`; not a substitute for origin time |
| `title` | string, optional | Official title; the legacy title normalization renders 震源・震度に関する情報 as 震源・震度情報 |
| `serial` | string, optional | Official report serial number |
| `validUntil` | string / null, optional | Official Head/ValidDateTime; distinct from the tsunami root field with the same name |

Optional `comments` objects contain official text: `forecast`, `warning`, `note`, and `text` are strings; `urls` is a string array. Multiple passages of the same kind are joined in their original order with blank lines.

### Content updates and MD5

The root `md5` (string) in these three APIs is a 32-character lowercase hexadecimal content-change identifier. It is calculated after removing the root `md5`, serializing the remaining object as compact UTF-8 JSON in the service's actual output key order, and hashing those bytes. It is not a cross-language canonical JSON hash, digital signature, or authentication mechanism.

Earthquake detail and special earthquake information normally retain the same content and MD5 until business data changes. Tsunami MD5 may change when `validUntil` needs renewal even without a new official warning. A changed MD5 alone does not mean a new earthquake or tsunami report. The legacy earthquake list retains the existing MD5 rules described in the preceding section. Files are not guaranteed to form one transactionally consistent snapshot.

### Events, hypocenters, and reports

| Field | Type | Description |
| --- | --- | --- |
| `events` | object[] | Up to 100 recent events, including cancelled events and events with only long-period observations; broader than the legacy 50-entry list. Ordered by known origin time, then event ID, descending |
| `events[].eventId` | string | JMA event ID |
| `events[].status` | string | `preliminary`: GD summary only; `reported`: at least one effective product report; `cancelled`: all retained product reports have been cancelled |
| `events[].completeness` | string | `pending`: history recovery in progress; `complete`: available history recovered; `partial`: some history falls outside the recoverable range and cannot be reliably replayed |
| `events[].hypocenters` | object[] | Deduplicated official hypocenters, referenced by individual reports and their revisions |
| `events[].reports` | object[] | Latest state of each product and reports still supplying effective fields, ordered by official transmission time ascending; not a complete archive |
| `events[].summary` | object, optional | Provisional GD (earthquake event list/detail) summary before raw telegrams arrive: `originTime`, `hypocenter`, `magnitude`, `maxIntensity`, and optional `magnitudeText` |
| `md5` | string | Content identifier described above |

`complete` describes history recovery, not a guarantee that every official field has a value.

Fields in `events[].hypocenters[]`:

| Field | Type | Description |
| --- | --- | --- |
| `name`, `code` | string / null | Hypocenter area name and official code |
| `latitude`, `longitude`, `depth` | number / null | Coordinates in decimal degrees and depth in km; missing depth is not converted to zero |
| `detail`, `detailCode`, `location` | string, optional | Detailed area name/code and location relative to a reference place |
| `source` | string, optional | Official hypocenter determination agency, such as PTWC |
| `description` | string, optional | Official qualitative descriptions such as ごく浅い (very shallow), 700km以上 (700 km or deeper), or unknown values |

In addition to shared metadata, `events[].reports[]` may provide:

| Field | Type | Description |
| --- | --- | --- |
| `originTime` | string / null, optional | Official earthquake origin time |
| `arrivalTime` | string / null, optional | Official detection time; VXSE51 target time is exposed here, not as origin time |
| `hypocenter` | integer, optional | Index into this event's `hypocenters`; `0` is valid |
| `magnitude` | number / null, optional | Official magnitude; unknown or qualitative giant-earthquake descriptions are not represented as zero |
| `magnitudeType` | string, optional | Magnitude scale, such as `Mj` |
| `magnitudeText`, `magnitudeCondition` | string, optional | Official qualitative magnitude description and condition |
| `observation` | object, optional | Seismic intensity and long-period observations belonging to this report |
| `comments`, `text` | object / string, optional | Official comments, body text, or cancellation explanation |

Products include VXSE51 (rapid seismic intensity reports), VXSE52 (hypocenter information), VXSE53 (hypocenter/intensity and distant-earthquake information), VXSE61 (updated hypocentral elements for significant earthquakes), and VXSE62 (long-period ground motion observations). Within a product, a correction replaces the immediately preceding version and cancellation clears that product's effective series. Reports from other products may remain effective. An older report still supplying official comments or other fields retains its own ID and time.

### Seismic intensity and long-period observations

`events[].reports[].observation` is retained separately for each report. Do not combine observations from different products or publication times as if they were simultaneous measurements.

- `maxIntensity`, `maxLongPeriod`, `longPeriodCategory` (optional string): maximum seismic intensity, maximum long-period ground motion class, and official long-period category.
- `prefs[]`: prefectures, with `code` and `name` (string); optional `int` (intensity), `lg` (long-period class), `condition` (observation condition), and `revise` (revision indicator) are strings.
- `areas[]`: seismic information subregions with the same fields and `pref`, an integer index into this observation's `prefs`. Long-period stations belong to the area's `stations[]`.
- `cities[]`: municipalities with the same fields and `area`, an integer index into this observation's `areas`. Seismic intensity stations belong to the municipality's `stations[]`.
- `stations[]`: `code`, `name`, and optional `int`, `lg`, `condition`, `revise`; long-period stations may also include `sva` (number / null, cm/s) and `periods[]`.
- `periods[]`: `period` (number, second bands 1–7), optional `class` (string) and `sva` (number / null, cm/s). Empty observation arrays are omitted.

### Earthquake detail JSON example

This reduced structural example comes from a public response. Event and observation arrays and some optional fields have been shortened while preserving parent indices. MD5 has been recalculated for this example. It is not live earthquake information.

```json
{
  "events": [
    {
      "eventId": "20261116132447",
      "status": "reported",
      "completeness": "complete",
      "hypocenters": [{"name":"石川県能登地方","code":"390","latitude":37.3,"longitude":137,"depth":280}],
      "reports": [
        {
          "id": "2184996cd2b67304661c5461e1e2f41a8f53ce84f8f663a87f53ba253e83b08a00da334789d890022c9018fbdebed11a",
          "product": "VXSE53",
          "time": "2026-11-16T04:29:00.000Z",
          "status": "issued",
          "issuedAt": "2026-11-16T04:29:02.000Z",
          "title": "震源・震度情報",
          "serial": "1",
          "originTime": "2026-11-16T04:24:00.000Z",
          "arrivalTime": "2026-11-16T04:24:00.000Z",
          "hypocenter": 0,
          "magnitude": 5.1,
          "magnitudeType": "Mj",
          "observation": {
            "maxIntensity": "1",
            "prefs": [{"code":"02","name":"青森県","int":"1"}],
            "areas": [{"code":"202","name":"青森県三八上北","int":"1","pref":0}],
            "cities": [{"code":"0220300","name":"八戸市","int":"1","area":0,"stations":[{"code":"0220302","name":"八戸市湊町","int":"1"}]}]
          },
          "comments": {"note":"＊印は気象庁以外の震度観測点についての情報です。","forecast":"この地震による津波の心配はありません。"}
        }
      ]
    }
  ],
  "md5": "b5ccb8340333f0b3d1682416a8ca9074"
}
```

## JMA Tsunami Information JSON API

- Description: Retrieves the nationwide official warning/forecast state and separate tsunami observation reports. Issued by JMA / Delivered via DMDATA.JP / Processed and provided by Wolfx Project.
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/jma_tsunami.json
```

- WebSocket API Endpoint:

```text
wss://ws-api.wolfx.jp/jma_tsunami
```

The WebSocket `type` is `jma_tsunami` and the manual query is `query_jmatsunami`. Updates are also broadcast on `all_eew`. HTTP JSON does not acquire a `type` field.

### Tsunami root fields

| Field | Type | Description |
| --- | --- | --- |
| `status`, `reason` | string | State and reason; distinguish the states below |
| `trusted` | boolean | Whether the conditions for trust after reconciliation with the upstream official state are satisfied |
| `validUntil` | string / null | Root trust deadline; clients must enforce expiry themselves |
| `report` | object / null | Shared metadata and `eventIds` (string[]) for the latest VTSE41 nationwide warning/forecast snapshot |
| `areas` | object[] | Trusted warning, forecast, cleared, or no-tsunami areas; empty when untrusted or officially expired |
| `observations` | object[] | Latest relevant VTSE51 and VTSE52 reports, at most one per product |
| `comments`, `text` | object / string, optional | Current official comments and body text |
| `lastKnown` | object, optional | Last known `areas`, `observations`, and optional `comments`, `text`, retained only when untrusted; not a currently valid warning |
| `md5` | string | Content identifier, also affected by trust-deadline renewal |

| status | Meaning |
| --- | --- |
| `uninitialized` | Ingestion is healthy but no authoritative VTSE41 snapshot has been obtained |
| `unknown` | Current state cannot be established because of disconnection, failed reconciliation, parsing failure, conflict, cancellation, or trust expiry; does not mean no tsunami risk |
| `active` | Major Tsunami Warning, Tsunami Warning, or Tsunami Advisory present |
| `forecast_only` | Tsunami forecast only |
| `cleared` | Officially lifted |
| `expired` | Official ValidDateTime has passed; not an official lifting of warnings |
| `none_reported` | Official area classification explicitly states 津波なし (no tsunami); never inferred from an empty array |

`reason` is one of `no_authoritative_snapshot`, `official_snapshot`, `report_cancelled`, `unsupported_or_conflicting_report`, `warning_requires_revalidation`, `clock_skew`, or `source_unverified`. Do not use the reason alone to assess risk.

### Enforcing the trust deadline

The public trust window is at most about 90 seconds and is renewed only after successful reconciliation with the authoritative upstream state. Official expiry and other conditions may shorten it. Checking `trusted=true` alone is insufficient: require a valid, nonempty deadline and check the current time, then interpret `status`.

```js
const deadline = typeof data.validUntil === 'string' && data.validUntil.length > 0
  ? Date.parse(data.validUntil)
  : NaN
const usable = data.trusted === true
  && Number.isFinite(deadline)
  && Date.now() < deadline
```

`usable` only indicates that the trust deadline has not passed; it does not establish safety. An active warning or a verified `expired` state can have `trusted=true`. Clients must expire their cached state even after WebSocket disconnection, a lack of new messages, or an HTTP cache ceasing to update. `areas=[]` does not mean safe.

### Areas, waves, and observations

`areas[]` contains `code`, `name`, `level`, and `kind` (all string), plus optional `previousKind` (previous official category code), `firstWave`, `maxWave`, and `stations[]`. `kind` retains the official code; `level` maps as follows:

| level | kind | Meaning |
| --- | --- | --- |
| `major_warning` | `52`, `53` | Major Tsunami Warning |
| `warning` | `51` | Tsunami Warning |
| `advisory` | `62` | Tsunami Advisory |
| `forecast` | `71`, `72`, `73` | Tsunami forecast |
| `cleared` | `50`, `60` | Officially lifted |
| `none` | `00` | No tsunami |

`firstWave` and `maxWave` are wave objects whose meaning depends on the official forecast, observation, or estimation context. They are not always measurements.

| Field | Type | Description |
| --- | --- | --- |
| `time` | string / null, optional | Official arrival or observation time |
| `height` | number / null, optional | Height in m; interpret together with `text` |
| `text`, `heightCondition` | string, optional | Official height description and condition, such as 巨大 (huge), 高い (high), 10m超 (over 10 m), or 不明 (unknown) |
| `condition` | string, optional | Arrival/observation condition, such as 観測中 (observation ongoing) or 欠測 (missing observation) |
| `initial`, `revise` | string, optional | Initial motion (rise/fall) and revision indicator |

`height=10` with `text=１０ｍ超` expresses a lower bound, not an exact height of 10 m. Do not convert 巨大, 高い, 不明, 観測中, or 欠測 into ordinary numbers or zero.

`stations[]` contains `code`, `name` (string), and optional `sensor` (string), `highTide` (string / null, high-tide time), `firstWave`, and `maxWave`.

`observations[]` contains shared report metadata, `eventIds` (string[]), and optional `areas` (that report's arrival forecasts and high-tide information), `observed` (measurements), `estimated` (coastal estimates), `comments`, and `text`. `observed[]` and `estimated[]` contain `code`, `name`, and optional `stations`, `firstWave`, `maxWave`; empty area codes in offshore observations remain empty strings.

These separate VTSE51/52 reports do not overwrite the root VTSE41 nationwide snapshot. The latest observation sharing an event ID with a warning may have an earlier publication time and must not reactivate a lifted warning. Corrections update the relevant version; cancelled observations retain cancellation metadata and text without the cancelled measurements. Cancelling VTSE41 itself produces `unknown` and does not restore an older warning. After failed reconciliation or disconnection, `lastKnown` is reference information only, not a currently valid warning.

### Tsunami JSON example

This reduced structural example is based on JMA's official format sample `32-39_11_02_250206_VTSE41.xml`. It shows an unverified state: warning areas appear only inside `lastKnown`. MD5 has been recalculated for the example. It does not describe current tsunami conditions.

```json
{
  "status": "unknown",
  "reason": "source_unverified",
  "trusted": false,
  "validUntil": null,
  "report": {
    "id": "71fc2503ab7b8688052c52722c93dfa5",
    "product": "VTSE41",
    "time": "2011-03-11T05:49:00.000Z",
    "status": "issued",
    "issuedAt": "2011-03-11T05:49:59.000Z",
    "title": "大津波警報・津波警報・津波注意報・津波予報",
    "eventIds": ["20110311144640"]
  },
  "areas": [],
  "observations": [],
  "lastKnown": {
    "areas": [
      {
        "code": "210",
        "name": "岩手県",
        "level": "major_warning",
        "kind": "53",
        "previousKind": "00",
        "firstWave": {"condition":"津波到達中と推測"},
        "maxWave": {"height":null,"text":"巨大","heightCondition":"不明"}
      }
    ],
    "observations": []
  },
  "md5": "08c2827ce954f62bbed80484e44c17fd"
}
```

## JMA Special Earthquake Information JSON API

- Description: Retrieves the latest official report for each product, not a determination of currently valid alert status or a complete archive. Issued by JMA / Delivered via DMDATA.JP / Processed and provided by Wolfx Project.
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/jma_special_eq.json
```

- WebSocket API Endpoint:

```text
wss://ws-api.wolfx.jp/jma_special_eq
```

The WebSocket `type` is `jma_special_eq` and the manual query is `query_jmaspecialeq`. Updates are also broadcast on `all_eew`.

| product | Official product |
| --- | --- |
| `VYSE50` | Nankai Trough Earthquake Extra Information (南海トラフ地震臨時情報) |
| `VYSE51` | Commentary on Nankai Trough Earthquake Extra Information (南海トラフ地震臨時情報に関する解説情報) |
| `VYSE52` | Nankai Trough Earthquake-Related Commentary, including regular commentary (南海トラフ地震関連解説情報) |
| `VYSE60` | Off the Coast of Hokkaido and Sanriku Subsequent Earthquake Advisory (北海道・三陸沖後発地震注意情報) |

### Special earthquake information fields

| Field | Type | Description |
| --- | --- | --- |
| `reports` | object[] | Latest official report per product, at most four reports in total |
| `appendices` | string[] | Deduplicated official appendices |
| `md5` | string | Content identifier |

`reports[]` uses shared `id`, `product`, `time`, `status`, and optional `issuedAt`, `targetTime`, `title`, `serial`, `validUntil`, plus:

| Field | Type | Description |
| --- | --- | --- |
| `eventIds` | string[] | Official associated event IDs |
| `kind` | string, optional | Official information kind in the body (EarthquakeInfo/InfoKind) |
| `code`, `label` | string, optional | Official information serial code and name (InfoSerial) |
| `text` | string, optional | Official body text |
| `notice` | string, optional | Body/Text when different from the main text, such as a cancellation explanation |
| `next` | string, optional | Official statement about the next publication |
| `appendix` | integer, optional | Index into root `appendices`; `0` is valid |

Corrections and cancellations retain the latest report's corresponding status and official text without reverting to an older alert report. Regular VYSE52 commentary does not mean a temporary earthquake alert is currently in effect. Do not infer current risk from a retained old report; check the official publication time, status, and text.

### Special earthquake information JSON example

This structural example is based on official format sample `75_01_04_200512_VYSE52.xml`. Optional `text` and some other fields are omitted; the full appendix and valid index `0` are retained. MD5 has been recalculated for the example. Its historical dates do not indicate a current alert.

```json
{
  "reports": [
    {
      "id": "2182f774aed16953ae288f821cb0aaf0",
      "product": "VYSE52",
      "time": "2020-05-12T07:44:00.000Z",
      "status": "issued",
      "issuedAt": "2020-05-12T07:44:52.000Z",
      "title": "南海トラフ地震関連解説情報",
      "eventIds": ["20200512164400"],
      "kind": "南海トラフ地震関連解説情報",
      "code": "200",
      "label": "定例解説",
      "appendix": 0
    }
  ],
  "appendices": ["＊＊　（参考）　南海トラフ地震に関連する情報の種類　＊＊\n【南海トラフ地震臨時情報】\n情報発表条件：\n○南海トラフ沿いで異常な現象が観測され、その現象が南海トラフ沿いの大規模な地震と関連するかどうか調査を開始した場合、または調査を継続している場合\n○観測された異常な現象の調査結果を発表する場合\n\n情報名に付記するキーワード：\n○「調査中」　下記のいずれかにより臨時に「南海トラフ沿いの地震に関する評価検討会」を開催する場合\n・監視領域内※１でマグニチュード６．８以上の地震※２が発生\n・１カ所以上のひずみ計での有意な変化と共に、他の複数の観測点でもそれに関係すると思われる変化が観測され、想定震源域内のプレート境界で通常と異なるゆっくりすべりが発生している可能性がある場合など、ひずみ計で南海トラフ地震との関連性の検討が必要と認められる変化を観測\n・その他、想定震源域内のプレート境界の固着状態の変化を示す可能性のある現象が観測される等、南海トラフ地震との関連性の検討が必要と認められる現象を観測\n○「巨大地震警戒」　想定震源域内のプレート境界において、モーメントマグニチュード８．０以上の地震が発生したと評価した場合\n○「巨大地震注意」\n・監視領域内※１において、モーメントマグニチュード７．０以上の地震※２が発生したと評価した場合（巨大地震警戒に該当する場合は除く）\n・想定震源域内のプレート境界において、通常と異なるゆっくりすべりが発生したと評価した場合\n○「調査終了」　（巨大地震警戒）、（巨大地震注意）のいずれにも当てはまらない現象と評価した場合\n※１　南海トラフの想定震源域及び想定震源域の海溝軸外側５０ｋｍ程度までの範囲\n※２　太平洋プレートの沈み込みに伴う震源が深い地震は除く\n\n【南海トラフ地震関連解説情報】\n情報発表条件：\n○観測された異常な現象の調査結果を発表した後の状況の推移等を発表する場合\n○「南海トラフ沿いの地震に関する評価検討会」の定例会合における調査結果を発表する場合（ただし南海トラフ地震臨時情報を発表する場合を除く）\n※すでに必要な防災対応がとられている際は、調査を開始した旨や調査結果を南海トラフ地震関連解説情報で発表する場合があります。"],
  "md5": "a61d13383d70499b764813701ae79211"
}
```

## China Earthquake Networks Center - Earthquake Information JSON API

- Description: Retrieves the latest 50 earthquake reports published by the China Earthquake Networks Center (CENC)
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/cenc_eqlist.json
```

- WebSocket API Endpoint:

```text
wss://ws-api.wolfx.jp/cenc_eqlist
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `type` | (WebSocket only) cenc_eqlist (String) |
| `No (1~50)` | Entry number of the earthquake record (ordered by publication time) (String) |
| `type` | Type of report: either "automatic" or "reviewed" (String) |
| `time` | Origin time of the earthquake (UTC+8) (String) |
| `location` | Epicenter (String) |
| `magnitude` | Magnitude (String) |
| `depth` | Depth of the hypocenter (String) |
| `latitude` | Latitude of the epicenter (String) |
| `longitude` | Longitude of the epicenter (String) |
| `intensity` | Maximum intensity (String) |
| `md5` | MD5 hash used to check for data updates (String) |

## Sichuan Earthquake Administration - Earthquake Early Warning JSON API

- Description: Real-time access to earthquake early warnings issued by the Sichuan Earthquake Administration
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/sc_eew.json
```

- WebSocket API Endpoint:

```text
wss://ws-api.wolfx.jp/sc_eew
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `type` | (WebSocket only) sc_eew (String) |
| `ID` | EEW Report ID (Number) |
| `EventID` | EEW Event Identifier (String) |
| `ReportTime` | Time of EEW issuance (UTC+8) (String) |
| `ReportNum` | Report sequence number (Number) |
| `OriginTime` | Earthquake origin time (UTC+8) (String) |
| `HypoCenter` | Hypocenter location (String) |
| `Latitude` | Latitude of the hypocenter (Number) |
| `Longitude` | Longitude of the hypocenter (Number) |
| `Magnitude` | Magnitude (Number; recommended) |
| `Magunitude` | **Deprecated** legacy misspelling retained for backward compatibility with existing clients. Its value is always identical to `Magnitude`. New integrations should use `Magnitude`. This field may be removed in the future, so migration is strongly recommended. |
| `Depth` | Depth of hypocenter (may be null) (Number) |
| `MaxIntensity` | Maximum seismic intensity (Number) |

## China Earthquake Networks Center - Earthquake Early Warning JSON API

- Description: Real-time access to earthquake early warnings issued by the China Earthquake Networks Center
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/cenc_eew.json
```

- WebSocket API Endpoint:

```text
wss://ws-api.wolfx.jp/cenc_eew
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `type` | (WebSocket only) cenc_eew (String) |
| `ID` | EEW Report ID (String) |
| `EventID` | EEW Event Identifier (String) |
| `ReportTime` | Time of EEW issuance (UTC+8) (String) |
| `ReportNum` | Report sequence number (Number) |
| `OriginTime` | Earthquake origin time (UTC+8) (String) |
| `HypoCenter` | Hypocenter location (String) |
| `Latitude` | Latitude of the hypocenter (Number) |
| `Longitude` | Longitude of the hypocenter (Number) |
| `Magnitude` | Magnitude (Number) |
| `Depth` | Depth of hypocenter (may be null) (Number) |
| `MaxIntensity` | Maximum seismic intensity (Number) |

## Fujian Earthquake Administration - Earthquake Early Warning JSON API

- Description: Real-time access to earthquake early warnings issued by the Fujian Earthquake Administration
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/fj_eew.json
```

- WebSocket API Endpoint:

```text
wss://ws-api.wolfx.jp/fj_eew
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `type` | (WebSocket only) fj_eew (String) |
| `ID` | EEW Report ID (Number) |
| `EventID` | EEW Event Identifier (String) |
| `ReportTime` | Time of EEW issuance (UTC+8) (String) |
| `ReportNum` | Report sequence number (Number) |
| `OriginTime` | Earthquake origin time (UTC+8) (String) |
| `HypoCenter` | Hypocenter location (String) |
| `Latitude` | Latitude of the hypocenter (Number) |
| `Longitude` | Longitude of the hypocenter (Number) |
| `Magnitude` | Magnitude (Number; recommended) |
| `Magunitude` | **Deprecated** legacy misspelling retained for backward compatibility with existing clients. Its value is always identical to `Magnitude`. New integrations should use `Magnitude`. This field may be removed in the future, so migration is strongly recommended. |
| `isFinal` | True if this is the final report (Boolean) |

## Chongqing Earthquake Administration - Earthquake Early Warning JSON API

- Description: Real-time access to earthquake early warnings issued by the Chongqing Earthquake Administration
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/cq_eew.json
```

- WebSocket API Endpoint:

```text
wss://ws-api.wolfx.jp/cq_eew
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `type` | (WebSocket only) cq_eew (String) |
| `ID` | EEW Report ID (String) |
| `EventID` | EEW Event Identifier (String) |
| `ReportTime` | Time of EEW issuance (UTC+8) (String) |
| `ReportNum` | Report sequence number (Number) |
| `OriginTime` | Earthquake origin time (UTC+8) (String) |
| `HypoCenter` | Hypocenter location (String) |
| `Latitude` | Latitude of the hypocenter (Number) |
| `Longitude` | Longitude of the hypocenter (Number) |
| `Magnitude` | Magnitude (Number) |
| `Depth` | Depth of hypocenter (may be null) (Number) |
| `MaxIntensity` | Maximum seismic intensity (Number) |

## China Real-Time Weather Ranking JSON API

- Description: Provides hourly rankings of temperature, precipitation, and wind speed from national-level weather observation stations across China
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/weather_rank.json
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `YYYYMMDDHH00` | Weather ranking data for each of the past 8 hours (UTC+8) (String) |
| `tempRank` | Top 10 highest temperatures nationwide (String) |
| `rainRank` | Top 10 highest precipitation amounts nationwide (String) |
| `windSRank` | Top 10 highest wind speeds nationwide (String) |
| `md5` | Checksum for verifying data updates (String) |

## IP Address Information Lookup JSON API

- Description: Retrieve information about the requester’s IP address or a specified IP address
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/geoip.php
```

 

```text
https://api.wolfx.jp/geoip.php?ip=<IP address>
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `ip` | Queried IP address (String) |
| `country_code` | Country or region code (String) |
| `country_name` | Country or region name (String) |
| `country_name_zh` | Country or region name (in Chinese) (String) |
| `province_code` | Province or state code (String) |
| `province_name` | Province or state name (String) |
| `province_name_zh` | Province or state name (in Chinese) (String) |
| `city` | City name (String) |
| `city_zh` | City name (in Chinese) (String) |
| `latitude` | Latitude (may be unavailable) (Number) |
| `longitude` | Longitude (may be unavailable) (Number) |

## Latest Server Time JSON API

- Description: Provides the latest accurate server time for synchronization purposes
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/ntp.json
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `JST` | Japan Standard Time (UTC+9) (String) |
| `CST` | China Standard Time (UTC+8) (String) |
| `str` | Current date and time (String) |
| `int` | Current date and time (as a number) (Number) |
| `timestamp` | Current UNIX timestamp (Number) |

## Public IP Address Retrieval PLAIN API

- Description: Retrieve the public IP address of the requester in plain text format.
- HTTP GET API URL:

```text
https://api.wolfx.jp/ip.php
```

## Random Anime Image Retrieval JPEG API

- Description: Retrieve a random anime image.
- HTTP GET API URL:

```text
https://api.wolfx.jp/img.php
```

 

```text
https://api.wolfx.jp/img.php?return=<img/json>
```

## API Status

Client counts and statistical charts load from Wolfx Project's own API service after the page is displayed.

::api-status-panel{locale="en"}
::
