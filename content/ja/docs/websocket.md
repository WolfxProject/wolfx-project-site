---
title: "Wolfx WebSocket API 利用説明"
description: "Wolfx WebSocket API の接続先、手動クエリ、JSON データ仕様。"
locale: ja
layout: docs
updated: 2026-10-30
version: v20260415
source: wsapi.html
---
## WebSocket の概要

- WebSocket API は、サーバーが EEW を受信すると、すべてのクライアントに自動的に関連情報をプッシュ配信します。
- ハートビートメカニズム：サーバーは毎分、または接続確立後にハートビートパケットを送信して接続を維持します。クライアントは任意で ping パケットを返信することができます（推奨）。

## 接続および利用上の注意

- 原則として、同一のクライアントがWolfx ProjectのEEW WebSocketサービスに同時に維持する有効な接続は1本としてください。複数のUIコンポーネントごとに接続を作るなどの不要な重複接続を避け、可能な限り既存の接続を再利用してください。
- 切断後の再接続を適切に管理し、不必要な接続の反復やリソースの浪費を避けてください。通常の接続切替時に新旧の接続が短時間重なることだけをもって、悪意ある重複接続とはみなしません。これはクライアントの合理的利用に関する要件であり、サーバーが接続数を厳密に1本へ制限する機構を実装しているという説明ではありません。
- 複数のEEWデータ源を同時に取得する必要がある場合は、実際の要件と下記の接続先の説明に応じて、既存の`all_eew`集約チャンネルの利用を優先的に検討してください。この案内は、未確認のデータへの対応を保証するものではありません。
- 無許可のデータ再配布、第三者への再提供、および独立したデータAPIの公開は禁止されています。その他の利用条件は、[利用規約](/legal/terms)および該当する個別説明に従ってください。

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
