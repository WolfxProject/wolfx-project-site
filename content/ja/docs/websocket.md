---
title: "Wolfx WebSocket API 利用説明"
description: "Wolfx WebSocket API の接続先、手動クエリ、JSON データ仕様。"
locale: ja
layout: docs
updated: 2026-04-15
version: v20260415
source: wsapi.html
---
## WebSocket の概要

- WebSocket API は、サーバーが EEW を受信すると、すべてのクライアントに自動的に関連情報をプッシュ配信します。
- ハートビートメカニズム：サーバーは毎分、または接続確立後にハートビートパケットを送信して接続を維持します。クライアントは任意で ping パケットを返信することができます（推奨）。

## WebSocket 呼び出し URL

- すべての JSON API プッシュを受信:

```text
wss://ws-api.wolfx.jp/all_eew
```

- 四川省地震局 地震速報 JSON API:

```text
wss://ws-api.wolfx.jp/sc_eew
```

- JMA 緊急地震速報 JSON API:

```text
wss://ws-api.wolfx.jp/jma_eew
```

- 福建省地震局 地震速報 JSON API:

```text
wss://ws-api.wolfx.jp/fj_eew
```

- 重庆市地震局 地震速報 JSON API:

```text
wss://ws-api.wolfx.jp/cq_eew
```

- 中国地震台網 地震速報 JSON API:

```text
wss://ws-api.wolfx.jp/cenc_eew
```

- 中国地震台網 地震情報 JSON API:

```text
wss://ws-api.wolfx.jp/cenc_eqlist
```

- JMA 地震情報 JSON API:

```text
wss://ws-api.wolfx.jp/jma_eqlist
```

- JSON フィールドの解析詳細は：[https://api.wolfx.jp](https://api.wolfx.jp) を参照ください。

## WebSocket 手動クエリコマンド

- Ping:

```text
ping
```

- 四川省地震局 地震速報 JSON:

```text
query_sceew
```

- JMA 緊急地震速報 JSON:

```text
query_jmaeew
```

- 福建省地震局 地震速報 JSON:

```text
query_fjeew
```

- 重庆市地震局 地震速報 JSON:

```text
query_cqeew
```

- 中国地震台網 地震速報 JSON:

```text
query_cenceew
```

- 中国地震台網 地震情報 JSON:

```text
query_cenceqlist
```

- JMA 地震情報 JSON:

```text
query_jmaeqlist
```

## WebSocket JSON データ仕様

- 共通のJSONフィールドの説明:

| Field | Description |
| --- | --- |
| `type` | データの種類／提供元（対応する値はAPIホームページを参照）（文字列型） |

- WebSocket ハートビート（heartbeat）パケットのJSONフィールド説明:

| Field | Description |
| --- | --- |
| `type` | heartbeat（文字列型） |
| `ver` | サーバーバージョン（数値型） |
| `id` | クライアント接続のUUID（文字列型） |
| `timestamp` | ハートビート送信のミリ秒単位タイムスタンプ（文字列型） |

- WebSocket Pong パケットのJSONフィールド説明:

| Field | Description |
| --- | --- |
| `type` | pong（文字列型） |
| `timestamp` | Pongパケット送信のミリ秒単位タイムスタンプ（文字列型） |

## Doc version: v20260415
