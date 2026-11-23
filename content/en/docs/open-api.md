---
title: "Wolfx Open API Usage"
description: "Wolfx Open API documentation for earthquake, EEW, and utility APIs over JSON, GET, and WebSocket."
locale: en
layout: docs
updated: 2026-11-23
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

**JSON Response Examples**

Historical Earthquake Early Warning JSON response examples for development and testing. These examples do not represent current earthquake warnings.

- [First Forecast](/examples/jma_eew/forecast_first.json){external}
- [Forecast Update](/examples/jma_eew/forecast_update.json){external}
- [Final Report](/examples/jma_eew/forecast_final.json){external}
- [Earthquake Early Warning](/examples/jma_eew/warning.json){external}
- [Level Method](/examples/jma_eew/level_method.json){external}
- [Forecast with PLUM](/examples/jma_eew/plum_forecast.json){external}
- [Warning with PLUM](/examples/jma_eew/plum_warning.json){external}
- [Cancellation](/examples/jma_eew/cancelled.json){external}
- [Assumed Hypocenter Parameters](/examples/jma_eew/assumed_hypocenter.json){external}
- [Offshore Earthquake](/examples/jma_eew/sea_earthquake.json){external}

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

- Description: Retrieves earthquake events with hypocenters, seismic intensity and long-period observations, official comments, and report status
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/jma_earthquake_detail.json
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `events` | Up to 100 recent events, including cancelled and long-period-only events; HTTP only, with no WebSocket delivery (Object array) |
| `events[].eventId` | Official event ID (String) |
| `events[].status` | `preliminary`: provisional summary only; `reported`: effective reports exist; `cancelled`: all retained product reports are cancelled (String) |
| `events[].completeness` | `pending`: history recovery in progress; `complete`: available history recovered; `partial`: some history cannot be recovered. `complete` does not guarantee values for every field (String) |
| `events[].hypocenters` | Deduplicated hypocenters; `name` and `code` are strings or null, with optional `description` for official wording such as ごく浅い (very shallow) (Object array) |
| `events[].hypocenters[].latitude`, `events[].hypocenters[].longitude` | Coordinates in decimal degrees; null when unknown (Number / null) |
| `events[].hypocenters[].depth` | Depth in km, positive downwards; null when unknown (Number / null) |
| `events[].reports` | Latest state of each product and reports still supplying effective fields; not a complete archive (Object array) |
| `events[].reports[].id` | Report telegram ID (String) |
| `events[].reports[].product` | Product code: `VXSE51`, `VXSE52`, `VXSE53`, `VXSE61`, or `VXSE62` (String) |
| `events[].reports[].time`, `events[].reports[].issuedAt`, `events[].reports[].targetTime` | Publication time and optional transmission/target times; UTC RFC 3339, null when unknown (String / null) |
| `events[].reports[].status` | `issued`, `corrected`, or `cancelled`; cancellation applies to the corresponding product (String) |
| `events[].reports[].originTime`, `events[].reports[].arrivalTime` | Origin and detection times in UTC RFC 3339; do not treat them as interchangeable (String / null; optional) |
| `events[].reports[].hypocenter` | Index into this event's `hypocenters`; `0` is valid (Integer; optional) |
| `events[].reports[].magnitude` | Magnitude; null for unknown or nonnumeric qualitative descriptions (Number / null; optional) |
| `events[].reports[].magnitudeType`, `events[].reports[].magnitudeText`, `events[].reports[].magnitudeCondition` | Magnitude scale, such as `Mj`, qualitative description, and condition (String; optional) |
| `events[].reports[].observation` | This report's observations; do not merge different products or times into simultaneous measurements (Object; optional) |
| `events[].reports[].observation.maxIntensity`, `events[].reports[].observation.maxLongPeriod` | Maximum seismic intensity and long-period class; intensity retains official strings such as `5-` and `5+` (String; optional) |
| `events[].reports[].observation.prefs` | Prefectures with `code`, `name`, and optional `int` (intensity), `lg` (long-period class), and related fields (Object array; optional) |
| `events[].reports[].observation.areas` | Subregions; `pref` indexes this observation's `prefs`, with `0` valid (Object array; optional) |
| `events[].reports[].observation.cities` | Municipalities; `area` indexes this observation's `areas`, with `0` valid (Object array; optional) |
| `events[].reports[].observation.areas[].stations`, `events[].reports[].observation.cities[].stations` | Area/municipal stations with `code`, `name`, and optional `int`, `lg`; long-period data may include `sva` (number/null, cm/s) and `periods` (per-band `period`, `class`, `sva`) (Object array; optional) |
| `events[].reports[].comments` | Official comments: optional `forecast`, `warning`, `note`, `text` strings and a `urls` string array (Object; optional) |
| `events[].reports[].text` | Official body text or cancellation explanation (String; optional) |
| `events[].summary` | Provisional summary before raw telegrams are available: `originTime`, `hypocenter` index, `magnitude`, `maxIntensity`, and optional `magnitudeText` (Object; optional) |
| `md5` | Hash identifying content changes (String) |

## JMA Tsunami Information JSON API

- Description: Retrieves the nationwide tsunami warning/forecast state and official tsunami observation reports
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/jma_tsunami.json
```

- WebSocket API Endpoint:

```text
wss://ws-api.wolfx.jp/jma_tsunami
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `type` | (WebSocket only) jma_tsunami (String) |
| `status` | `uninitialized`: not yet obtained; `unknown`: state unknown, no assurance of safety; `active`: warning/advisory present; `forecast_only`: forecast only; `cleared`: officially lifted; `expired`: official validity elapsed, not lifted; `none_reported`: explicitly classified as no tsunami (String) |
| `reason` | Reason for the state; not an independent risk assessment (String) |
| `trusted` | Whether trust conditions following reconciliation with the current authoritative state are met; true does not mean no tsunami risk (Boolean) |
| `validUntil` | Trust deadline (UTC RFC 3339). Trust is current only when `trusted=true`, the deadline is valid and nonempty, and the current time is before it; clients must enforce expiry after disconnection or without new messages (String / null) |
| `report` | Latest nationwide `VTSE41` snapshot: `id`, `product`, `time`, `status`, and `eventIds` (string array); timestamps use UTC RFC 3339 (Object / null) |
| `areas` | Official warning/forecast areas with `code`, `name`, categories, wave information, and stations; an empty array does not mean safe (Object array) |
| `areas[].level` | `major_warning`: Major Tsunami Warning; `warning`: Tsunami Warning; `advisory`: Tsunami Advisory; `forecast`: forecast; `cleared`: lifted; `none`: no tsunami (String) |
| `areas[].kind`, `areas[].previousKind` | Official category code and previous category code; `previousKind` is optional (String) |
| `areas[].firstWave`, `areas[].maxWave` | First/maximum wave, with optional `time` (UTC RFC 3339), `height` (number/null, m), `text`, and conditions; 巨大, 高い, 10m超, and 以上 are qualitative/lower-bound descriptions, not precise measurements (Object; optional) |
| `areas[].stations` | Area stations with `code`, `name`, and optional high-tide time `highTide`, `firstWave`, `maxWave`, and related fields (Object array; optional) |
| `observations` | Latest relevant `VTSE51` and `VTSE52` observation reports with their own IDs, times, and cancellation states; do not overwrite `VTSE41` warning areas (Object array) |
| `observations[].observed`, `observations[].estimated` | Measured/coastal-estimated areas, stations, and wave information; observation times may differ between reports (Object array; optional) |
| `lastKnown` | Last known areas, observations, and comments when untrusted; reference only, not a currently valid warning (Object; optional) |
| `comments` | Official comments: optional `forecast`, `warning`, `note`, `text` strings and a `urls` string array (Object; optional) |
| `text` | Official body text (String; optional) |
| `md5` | Content-change identifier; trust-deadline renewal can also change it without a new JMA warning (String) |

**JSON Response Examples**

Tsunami information JSON response examples for development and testing. These examples do not represent current tsunami warning conditions.

- [Tsunami Forecast](/examples/jma_tsunami/forecast_only.json){external}
- [Tsunami Advisory](/examples/jma_tsunami/advisory.json){external}
- [Tsunami Warning](/examples/jma_tsunami/warning.json){external}
- [Major Tsunami Warning](/examples/jma_tsunami/major_warning.json){external}
- [Cancellation](/examples/jma_tsunami/cancelled.json){external}
- [Official Clearance](/examples/jma_tsunami/cleared.json){external}
- [Expired](/examples/jma_tsunami/expired.json){external}
- [With Tsunami Observations](/examples/jma_tsunami/with_observations.json){external}

## JMA Special Earthquake Information JSON API

- Description: Retrieves the latest official reports concerning the Nankai Trough and the areas off Hokkaido and Sanriku
- HTTP GET API Endpoint:

```text
https://api.wolfx.jp/jma_special_eq.json
```

- WebSocket API Endpoint:

```text
wss://ws-api.wolfx.jp/jma_special_eq
```

- JSON Field Descriptions (Data Types):

| Field | Description |
| --- | --- |
| `type` | (WebSocket only) jma_special_eq (String) |
| `reports` | Latest report per product, up to four in total; not a complete archive, and a retained report does not mean an alert is still in effect (Object array) |
| `reports[].id` | Report telegram ID (String) |
| `reports[].product` | `VYSE50`: Nankai Trough Earthquake Extra Information; `VYSE51`: commentary on that extra information; `VYSE52`: Nankai Trough Earthquake-Related Commentary; `VYSE60`: Off the Coast of Hokkaido and Sanriku Subsequent Earthquake Advisory. Regular commentary does not indicate a temporary alert (String) |
| `reports[].time` | Official publication time (UTC RFC 3339) (String / null) |
| `reports[].status` | `issued`, `corrected`, or `cancelled`, preserving the latest report's corresponding state (String) |
| `reports[].eventIds` | Official associated event IDs (String array) |
| `reports[].kind`, `reports[].code`, `reports[].label`, `reports[].title` | Official information kind, serial code/name, and report title (String; optional) |
| `reports[].text`, `reports[].notice`, `reports[].next` | Official body text, supplementary text such as cancellation explanations, and next-publication information (String; optional) |
| `reports[].appendix` | Integer index into root `appendices`; `0` is valid (Integer; optional) |
| `appendices` | Deduplicated official appendices (String array) |
| `md5` | Hash identifying content changes (String) |

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
