---
title: "Wolfx SeisJS API reference"
description: "SeisJS station list, WebSocket connection details, and units for seismic intensity and ground motion readings."
locale: en
layout: docs
updated: 2026-11-25
source: seisapi_en.html
---

## Overview

Each SeisJS station streams observations over WebSocket once per second.

Station data reports intensity on two scales: the Japan Meteorological Agency (JMA) seismic intensity scale and the Chinese seismic intensity scale (CSIS, GB/T 17742-2020).

The server sends a `heartbeat` when you connect and every minute thereafter. We recommend replying with `ping`, though the reply is optional.

**Usage restriction.** This API provides only SeisJS station data. Use is limited to lawful research and development. All other uses are prohibited.

## Station list

[Station list (JSON)](https://api.wolfx.jp/seis_list.json)

The list updates every 10 minutes. Use it to check station status when managing stations remotely.

## WebSocket Endpoint

Use a single connection to receive JSON data from all stations.

```text
wss://seisjs.wolfx.jp/all_seis
```

## Observation fields

| Field | Description |
| --- | --- |
| `type` | Station UUID (string) |
| `region` | Station location (string) |
| `latitude` | Station latitude (number) |
| `longitude` | Station longitude (number) |
| `version` | SeisJS version running on the station (number) |
| `PGA` | Composite Peak Ground Acceleration (cm/s²) (number) |
| `PGV` | Composite Peak Ground Velocity (cm/s) (number) |
| `PGD` | Composite Peak Ground Displacement (cm) (number) |
| `PGA_EW` | East-West Peak Ground Acceleration (cm/s²) (number) |
| `PGV_EW` | East-West Peak Ground Velocity (cm/s) (number) |
| `PGD_EW` | East-West Peak Ground Displacement (cm) (number) |
| `PGA_NS` | North-South Peak Ground Acceleration (cm/s²) (number) |
| `PGV_NS` | North-South Peak Ground Velocity (cm/s) (number) |
| `PGD_NS` | North-South Peak Ground Displacement (cm) (number) |
| `PGA_UD` | Vertical Peak Ground Acceleration (cm/s²) (number) |
| `PGV_UD` | Vertical Peak Ground Velocity (cm/s) (number) |
| `PGD_UD` | Vertical Peak Ground Displacement (cm) (number) |
| `Max_PGA` | Max composite PGA over the preceding 2 minutes (cm/s²) (number) |
| `Max_PGV` | Max composite PGV over the preceding 2 minutes (cm/s) (number) |
| `Max_PGD` | Max composite PGD over the preceding 2 minutes (cm) (number) |
| `Max_PGA_EW` | Max East-West PGA over the preceding 2 minutes (cm/s²) (number) |
| `Max_PGV_EW` | Max East-West PGV over the preceding 2 minutes (cm/s) (number) |
| `Max_PGD_EW` | Max East-West PGD over the preceding 2 minutes (cm) (number) |
| `Max_PGA_NS` | Max North-South PGA over the preceding 2 minutes (cm/s²) (number) |
| `Max_PGV_NS` | Max North-South PGV over the preceding 2 minutes (cm/s) (number) |
| `Max_PGD_NS` | Max North-South PGD over the preceding 2 minutes (cm) (number) |
| `Max_PGA_UD` | Max Vertical PGA over the preceding 2 minutes (cm/s²) (number) |
| `Max_PGV_UD` | Max Vertical PGV over the preceding 2 minutes (cm/s) (number) |
| `Max_PGD_UD` | Max Vertical PGD over the preceding 2 minutes (cm) (number) |
| `Shindo` | Composite intensity on the JMA scale (string) |
| `Max_Shindo` | Maximum intensity on the JMA scale over the preceding 2 minutes (string) |
| `CalcShindo` | Composite instrumental seismic intensity (JMA) (number) |
| `Max_CalcShindo` | Maximum instrumental seismic intensity (JMA) over the preceding 2 minutes (number) |
| `Intensity` | Composite intensity on the CSIS scale (number) |
| `Max_Intensity` | Maximum intensity on the CSIS scale over the preceding 2 minutes (number) |
| `LPGM` | Long-period ground motion class (number) |
| `Max_LPGM` | Maximum long-period ground motion class over the preceding 2 minutes (number) |
| `Sva30` | Maximum horizontal absolute velocity response over the preceding 30 seconds, across oscillator periods of 1.6 to 7.8 seconds at 5% damping (cm/s, number) |
| `Max_Sva30` | Highest `Sva30` recorded over the preceding 2 minutes (cm/s, number) |
| `error_code` | Error codes reported by station (array of numbers) |
| `reverse` | Reserved field for server-side validation (string) |
| `is_desktop` | Indicates if the client is a desktop (boolean) |
| `High_Precision` | Indicates if the station is high-precision (boolean) |
| `update_at` | Data update timestamp (string) |
| `create_at` | JSON generation timestamp (string) |

## Connection check

```text
ping
```

## WebSocket message format

### Common field

| Field | Description |
| --- | --- |
| `type` | Message type or station UUID (string) |

### Heartbeat (`heartbeat`)

| Field | Description |
| --- | --- |
| `type` | `heartbeat` (string) |
| `ver` | Server version (number) |
| `id` | Client connection UUID (string) |
| `timestamp` | Time the message was sent, in milliseconds (string) |

### Reply to ping (`pong`)

| Field | Description |
| --- | --- |
| `type` | `pong` (string) |
| `timestamp` | Time the message was sent, in milliseconds (string) |
