---
title: "Wolfx Open API Usage"
description: "Wolfx Open API documentation for earthquake, EEW, and utility APIs over JSON, GET, and WebSocket."
locale: en
layout: docs
updated: 2026-07-29
version: v20260729
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
| `Title` | Header of the Earthquake Early Warning (string) |
| `CodeType` | Description of the announcement category (string) |
| `Issue.Source` | Location of the issuing agency (string) |
| `Issue.Status` | Announcement status (string) |
| `EventID` | Earthquake Early Warning event ID (string) |
| `Serial` | Report number (number) |
| `AnnouncedTime` | Announcement time (UTC+9) (string) |
| `OriginTime` | Earthquake origin time (UTC+9) (string) |
| `Hypocenter` | Hypocenter location (string) |
| `Latitude` | Latitude of the hypocenter (number) |
| `Longitude` | Longitude of the hypocenter (number) |
| `Magunitude` | Magnitude (number) |
| `Depth` | Depth of the hypocenter (number) |
| `MaxIntensity` | Maximum seismic intensity (lower/upper) (string) |
| `Accuracy.Epicenter` | Information about epicenter accuracy (string) |
| `Accuracy.Depth` | Information about depth accuracy (string) |
| `Accuracy.Magnitude` | Information about magnitude accuracy (string) |
| `MaxIntChange.String` | Description of the maximum intensity change (string) |
| `MaxIntChange.Reason` | Reason for the maximum intensity change (string) |
| `WarnArea` | List of warning target areas (array / JSON value) |
| `WarnArea[].Chiiki` | Warning target area (string) |
| `WarnArea[].Shindo1` | Maximum seismic intensity in the area (lower/upper) (string) |
| `WarnArea[].Shindo2` | Minimum seismic intensity in the area (lower/upper) (string) |
| `WarnArea[].Time` | Warning announcement time for the area (string) |
| `WarnArea[].Type` | Announcement type for the area, either "Forecast" or "Warning" (string) |
| `WarnArea[].Arrive` | Whether seismic waves have arrived in the area (based on the actual response) |
| `isSea` | Whether the earthquake occurred in a sea area (boolean) |
| `isTraining` | Whether this is a training report (boolean) |
| `isAssumption` | Whether assumed hypocenter parameters are used (Boolean) |
| `isWarn` | Whether this is a warning (boolean) |
| `isFinal` | Whether this is the final report (boolean) |
| `isCancel` | Whether this is a cancellation report (boolean) |
| `OriginalText` | Original text published by the Japan Meteorological Agency (string) |

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
| `Title` | Message header (String) |
| `No (1~50)` | Entry number of the earthquake report (in order of publication time) (String) |
| `time` | Origin time of the earthquake (UTC+9) (String) |
| `location` | Epicenter location (String) |
| `magnitude` | Magnitude (String) |
| `shindo` | Maximum seismic intensity (with ± qualifiers) (String) |
| `depth` | Hypocenter depth (String) |
| `latitude` | Epicenter latitude (String) |
| `longitude` | Epicenter longitude (String) |
| `info` | Tsunami information (only available in the first entry) (String) |
| `md5` | Hash for earthquake report update verification (String) |

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
| `Magunitude` | Magnitude (Number) |
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
| `Magunitude` | Magnitude (Number) |
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

## Doc version: v20260729
