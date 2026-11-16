---
title: "Wolfx WebSocket API 利用説明"
description: "Wolfx WebSocket API の接続先、手動クエリ、JSON データ仕様。"
locale: ja
layout: docs
updated: 2026-11-16
source: wsapi.html
---
## WebSocket の概要

- WebSocket API は、対応する業務 JSON が更新されると、購読先のクライアントへ関連情報を自動配信します。
- ハートビートメカニズム：サーバーは毎分、または接続確立後にハートビートパケットを送信して接続を維持します。クライアントは任意で ping パケットを返信することができます（推奨）。

## 接続および利用上の注意

- 可能な限り接続を再利用し、不要な重複接続や短時間での再接続の繰り返しを避けてください。
- 複数のデータ源を取得する場合は、下記の接続先の説明を確認し、`all_eew` 集約チャンネルの利用を検討してください。

## WebSocket 呼び出し URL

- 現在設定され、配信に対応している複数のデータ源の更新を受信:

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

- JMA 津波情報 JSON API:

```text
wss://ws-api.wolfx.jp/jma_tsunami
```

- JMA 特別地震情報 JSON API:

```text
wss://ws-api.wolfx.jp/jma_special_eq
```

- JSON フィールドの解析詳細は：[https://api.wolfx.jp](https://api.wolfx.jp) を参照ください。

## WebSocket 手動クエリコマンド

手動クエリは、対応するデータ源または `all_eew` の接続で、そのデータ源のキャッシュ済み JSON を取得します。

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

- JMA 津波情報 JSON API:

```text
query_jmatsunami
```

- JMA 特別地震情報 JSON API:

```text
query_jmaspecialeq
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
