---
title: "Wolfx WebSocket API Call Instructions"
description: "Wolfx WebSocket endpoints, manual query commands, and JSON data specification."
locale: en
layout: docs
updated: 2026-04-15
version: v20260415
source: wsapi_en.html
---
## Introduction to WebSocket

- The WebSocket API automatically pushes relevant information to all clients when the server receives an EEW
- Heartbeat mechanism: The server sends a heartbeat packet every minute or after the connection is established to maintain the connection. The client can optionally reply with a ping packet (recommended).

## WebSocket Call URLs

- Receive all JSON API pushes:

```text
wss://ws-api.wolfx.jp/all_eew
```

- Sichuan Earthquake Early Warning JSON API:

```text
wss://ws-api.wolfx.jp/sc_eew
```

- JMA Earthquake Early Warning JSON API:

```text
wss://ws-api.wolfx.jp/jma_eew
```

- Fujian Earthquake Early Warning JSON API:

```text
wss://ws-api.wolfx.jp/fj_eew
```

- Chongqing Earthquake Early Warning JSON API:

```text
wss://ws-api.wolfx.jp/cq_eew
```

- China Earthquake Networks Center Earthquake Early Warning JSON API:

```text
wss://ws-api.wolfx.jp/cenc_eew
```

- China Earthquake Networks Center Earthquake Information JSON API:

```text
wss://ws-api.wolfx.jp/cenc_eqlist
```

- JMA Earthquake Information JSON API:

```text
wss://ws-api.wolfx.jp/jma_eqlist
```

- For detailed JSON field parsing, refer to: [https://api.wolfx.jp](https://api.wolfx.jp)

## WebSocket Manual Query Commands

- Ping:

```text
ping
```

- Sichuan Earthquake Early Warning JSON:

```text
query_sceew
```

- JMA Earthquake Early Warning JSON:

```text
query_jmaeew
```

- Fujian Earthquake Early Warning JSON:

```text
query_fjeew
```

- Chongqing Earthquake Early Warning JSON:

```text
query_cqeew
```

- China Earthquake Networks Center Earthquake Early Warning JSON:

```text
query_cenceew
```

- China Earthquake Networks Center Earthquake Information JSON:

```text
query_cenceqlist
```

- JMA Earthquake Information JSON:

```text
query_jmaeqlist
```

## WebSocket JSON Data Specification

- Common JSON Field Description:

| Field | Description |
| --- | --- |
| `type` | Data type / data source (see API homepage for specific values) (String) |

- WebSocket Heartbeat Packet - JSON Field Description:

| Field | Description |
| --- | --- |
| `type` | heartbeat (String) |
| `ver` | Server version number (Number) |
| `id` | Client connection UUID (String) |
| `timestamp` | Heartbeat sent timestamp in milliseconds (String) |

- WebSocket Pong Packet - JSON Field Description:

| Field | Description |
| --- | --- |
| `type` | pong (String) |
| `timestamp` | Pong sent timestamp in milliseconds (String) |

## Doc version: v20260415
