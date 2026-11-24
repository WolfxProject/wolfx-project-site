---
title: "Wolfx WebSocket API"
description: "Subscribe to earthquake and tsunami feeds, filter the all_eew stream, and request cached JSON using text commands."
locale: en
layout: docs
updated: 2026-11-24
source: wsapi_en.html
---

## How updates work

When a subscribed feed changes, the server sends the updated JSON. It sends a `heartbeat` message when the connection opens and once per minute after that. Clients are encouraged to reply with `ping`, but a reply is optional.

## Reusing connections

Reuse existing connections and avoid reconnecting in rapid succession. To receive updates from several sources over one connection, use the `all_eew` channel.

## Aggregate subscriptions and filters

Subscribe here to receive updates from multiple sources.

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

## Individual subscriptions and query commands

Connect to an individual feed below to receive its updates. To retrieve its cached JSON, send the corresponding command over that connection or over `all_eew`.

| Source | Subscription endpoint | Query command |
| --- | --- | --- |
| Sichuan earthquake early warnings | `wss://ws-api.wolfx.jp/sc_eew` | `query_sceew` |
| Japan Meteorological Agency (JMA) Earthquake Early Warnings | `wss://ws-api.wolfx.jp/jma_eew` | `query_jmaeew` |
| Fujian earthquake early warnings | `wss://ws-api.wolfx.jp/fj_eew` | `query_fjeew` |
| Chongqing earthquake early warnings | `wss://ws-api.wolfx.jp/cq_eew` | `query_cqeew` |
| China Earthquake Networks Center (CENC) earthquake early warnings | `wss://ws-api.wolfx.jp/cenc_eew` | `query_cenceew` |
| CENC earthquake information | `wss://ws-api.wolfx.jp/cenc_eqlist` | `query_cenceqlist` |
| JMA earthquake information | `wss://ws-api.wolfx.jp/jma_eqlist` | `query_jmaeqlist` |
| JMA tsunami information | `wss://ws-api.wolfx.jp/jma_tsunami` | `query_jmatsunami` |
| JMA Nankai Trough and Hokkaido/Sanriku information | `wss://ws-api.wolfx.jp/jma_special_eq` | `query_jmaspecialeq` |

For the JSON fields in each feed, see the [Open API reference](/en/docs/open-api) and the [API homepage](https://api.wolfx.jp).

Connection check

```text
ping
```

## WebSocket message format

### Common field

| Field | Description |
| --- | --- |
| `type` | Message type or data source (string) |

### Heartbeat (`heartbeat`)

| Field | Description |
| --- | --- |
| `type` | `heartbeat` (string) |
| `ver` | Server version (number) |
| `id` | UUID for this connection (string) |
| `timestamp` | Time the message was sent, in milliseconds (string) |

### Reply to ping (`pong`)

| Field | Description |
| --- | --- |
| `type` | `pong` (string) |
| `timestamp` | Time the message was sent, in milliseconds (string) |
