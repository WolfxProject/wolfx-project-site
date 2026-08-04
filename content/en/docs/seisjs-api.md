---
title: "Wolfx SeisJS API Documentation"
description: "SeisJS station, WebSocket connection, and observation data field documentation."
locale: en
layout: docs
updated: 2025-07-04
version: v20250704
source: seisapi_en.html
---
## Overview

- Data push interval per station: 1 second
- Seismic intensity standard: Japan Meteorological Agency (JMA)
- Ground motion intensity standard: Chinese national intensity standard (based on GB/T 17742-2020)
- This API provides real-time data from SeisJS stations via WebSocket
- Heartbeat mechanism: the server sends a \`heartbeat\` packet upon connection and every minute; the client may optionally respond with \`ping\` (recommended)
- Disclaimer: This API only provides station data from SeisJS for legal research and development use. Any other usage is prohibited.

## Available Station List

- Station List JSON URL: [https://api.wolfx.jp/seis\_list.json](https://api.wolfx.jp/seis_list.json)
- Note: For application development, it is recommended to use this station list API to retrieve real-time station status for cloud-based control. The list updates every 10 minutes.

## WebSocket Endpoint

- Receive JSON data from all SeisJS stations:

```text
wss://seisjs.wolfx.jp/all_seis
```

## JSON Field Description (Data Types)

| Field | Description |
| --- | --- |
| `type` | Station UUID (String) |
| `region` | Station location (String) |
| `latitude` | Station latitude (Number) |
| `longitude` | Station longitude (Number) |
| `version` | SeisJS version running on the station (Number) |
| `PGA` | Composite Peak Ground Acceleration (cm/s²) (Number) |
| `PGV` | Composite Peak Ground Velocity (cm/s) (Number) |
| `PGD` | Composite Peak Ground Displacement (cm) (Number) |
| `PGA_EW` | East-West Peak Ground Acceleration (cm/s²) (Number) |
| `PGV_EW` | East-West Peak Ground Velocity (cm/s) (Number) |
| `PGD_EW` | East-West Peak Ground Displacement (cm) (Number) |
| `PGA_NS` | North-South Peak Ground Acceleration (cm/s²) (Number) |
| `PGV_NS` | North-South Peak Ground Velocity (cm/s) (Number) |
| `PGD_NS` | North-South Peak Ground Displacement (cm) (Number) |
| `PGA_UD` | Vertical Peak Ground Acceleration (cm/s²) (Number) |
| `PGV_UD` | Vertical Peak Ground Velocity (cm/s) (Number) |
| `PGD_UD` | Vertical Peak Ground Displacement (cm) (Number) |
| `Max_PGA` | Max composite PGA within 2 minutes (cm/s²) (Number) |
| `Max_PGV` | Max composite PGV within 2 minutes (cm/s) (Number) |
| `Max_PGD` | Max composite PGD within 2 minutes (cm) (Number) |
| `Max_PGA_EW` | Max East-West PGA within 2 minutes (cm/s²) (Number) |
| `Max_PGV_EW` | Max East-West PGV within 2 minutes (cm/s) (Number) |
| `Max_PGD_EW` | Max East-West PGD within 2 minutes (cm) (Number) |
| `Max_PGA_NS` | Max North-South PGA within 2 minutes (cm/s²) (Number) |
| `Max_PGV_NS` | Max North-South PGV within 2 minutes (cm/s) (Number) |
| `Max_PGD_NS` | Max North-South PGD within 2 minutes (cm) (Number) |
| `Max_PGA_UD` | Max Vertical PGA within 2 minutes (cm/s²) (Number) |
| `Max_PGV_UD` | Max Vertical PGV within 2 minutes (cm/s) (Number) |
| `Max_PGD_UD` | Max Vertical PGD within 2 minutes (cm) (Number) |
| `Shindo` | Composite JMA Seismic Intensity (String) |
| `Max_Shindo` | Max JMA Seismic Intensity within 2 minutes (String) |
| `CalcShindo` | Composite Calculated JMA Seismic Intensity (Number) |
| `Max_CalcShindo` | Max Calculated JMA Seismic Intensity within 2 minutes (Number) |
| `Intensity` | Composite CSIS Intensity (Number) |
| `Max_Intensity` | Max CSIS Intensity within 2 minutes (Number) |
| `LPGM` | Long-Period Ground Motion Level (Number) |
| `Max_LPGM` | Max Long-Period Ground Motion Level within 2 minutes (Number) |
| `Sva30` | Spectral Acceleration Value (Number) |
| `Max_Sva30` | Max Spectral Acceleration Value within 2 minutes (Number) |
| `error_code` | Error codes reported by station (Array of Numbers) |
| `reverse` | Reserved field for server-side validation (String) |
| `is_desktop` | Indicates if the client is a desktop (Boolean) |
| `High_Precision` | Indicates if the station is high-precision (Boolean) |
| `update_at` | Data update timestamp (String) |
| `create_at` | JSON generation timestamp (String) |

## WebSocket Manual Commands

- Ping:

```text
ping
```

## WebSocket JSON Field Specification

- Common JSON Field:

| Field | Description |
| --- | --- |
| `type` | Data type / Station UUID (String) |

- WebSocket Heartbeat Packet Fields:

| Field | Description |
| --- | --- |
| `type` | heartbeat (String) |
| `ver` | Server version (Number) |
| `id` | Client connection UUID (String) |
| `timestamp` | Timestamp in milliseconds (String) |

- WebSocket Pong Packet Fields:

| Field | Description |
| --- | --- |
| `type` | pong (String) |
| `timestamp` | Timestamp in milliseconds (String) |

## API Documentation Version: v20250704
