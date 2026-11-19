---
title: "Wolfx WebSocket API Call Instructions"
description: "Wolfx WebSocket endpoints, all_eew source exclusions, manual query commands, and JSON data specification."
locale: en
layout: docs
updated: 2026-11-19
source: wsapi_en.html
---
## Introduction to WebSocket

- The WebSocket API automatically pushes updates to subscribers when the corresponding business JSON changes.
- Heartbeat mechanism: The server sends a heartbeat packet every minute or after the connection is established to maintain the connection. The client can optionally reply with a ping packet (recommended).

## Connection and Usage Guidelines

- Reuse connections where possible and avoid unnecessary duplicate connections or rapid repeated reconnection attempts.
- When you need multiple data sources, consider the `all_eew` aggregate channel based on the endpoint descriptions below.

## WebSocket Call URLs

- Subscribe to `all_eew` to receive updates from multiple data sources.

```text
wss://ws-api.wolfx.jp/all_eew
```

To receive fewer updates, use the optional `exclude` URL query parameter to list the sources you want to skip. Use the same source names as in the individual subscription URL paths. Separate multiple names with commas.

```text
wss://ws-api.wolfx.jp/all_eew?exclude=cenc_eew
wss://ws-api.wolfx.jp/all_eew?exclude=sc_eew,fj_eew,cq_eew
```

Set `exclude` when connecting. It applies only to automatic updates on that `all_eew` connection. Reconnect to change the list. If a source name is unknown, the server returns `HTTP 400` during the WebSocket handshake.

You can still use the existing manual query commands on the same connection to fetch cached JSON for excluded public sources.

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

- JMA Tsunami Information JSON API:

```text
wss://ws-api.wolfx.jp/jma_tsunami
```

- JMA Special Earthquake Information JSON API:

```text
wss://ws-api.wolfx.jp/jma_special_eq
```

- For detailed JSON field parsing, refer to: [https://api.wolfx.jp](https://api.wolfx.jp)

## WebSocket Manual Query Commands

Manual queries return the source’s cached JSON on its own connection or on `all_eew`.

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

- JMA Tsunami Information JSON API:

```text
query_jmatsunami
```

- JMA Special Earthquake Information JSON API:

```text
query_jmaspecialeq
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
