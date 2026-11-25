---
title: "Wolfx WebSocket API 利用ガイド"
description: "地震・津波情報の WebSocket 接続先、all_eew の除外設定、クエリコマンドと受信メッセージの形式。"
locale: ja
layout: docs
updated: 2026-11-25
source: wsapi.html
---

## WebSocket の概要

購読中のデータが更新されると、サーバーから新しい JSON が届きます。接続直後と以降 1 分ごとに `heartbeat` が届きます。`ping` の返信を推奨しますが、必須ではありません。

## 接続の再利用

同じデータを受信する接続は再利用し、短時間に接続を繰り返さないでください。複数のデータ源を購読するには、集約チャンネル `all_eew` を利用できます。

## 集約チャンネルと除外設定

```text
wss://ws-api.wolfx.jp/all_eew
```

配信から外すデータ源は、任意の URL パラメーター `exclude` で指定できます。個別の購読先の URL パスにある名前を使い、複数の名前はカンマ（`,`）で区切ります。

```text
wss://ws-api.wolfx.jp/all_eew?exclude=cenc_eew
wss://ws-api.wolfx.jp/all_eew?exclude=sc_eew,fj_eew,cq_eew
```

`exclude` は接続時に指定し、その `all_eew` 接続の自動配信にのみ適用されます。指定を変更するには再接続してください。存在しないデータ源名を指定すると、WebSocket のハンドシェイク時に `HTTP 400` が返ります。

配信から外した公開データ源も、同じ接続で個別のクエリコマンドを送れば、キャッシュ済みの JSON を取得できます。

## 個別の接続先と手動クエリ

下表の接続先では、各データ源の更新を受け取れます。対応するコマンドをその接続先または `all_eew` に送ると、キャッシュ済みの JSON を取得できます。

| データ源 | 個別の接続先 | クエリコマンド |
| --- | --- | --- |
| 四川省地震局の地震早期警報 | `wss://ws-api.wolfx.jp/sc_eew` | `query_sceew` |
| 気象庁の緊急地震速報 | `wss://ws-api.wolfx.jp/jma_eew` | `query_jmaeew` |
| 福建省地震局の地震早期警報 | `wss://ws-api.wolfx.jp/fj_eew` | `query_fjeew` |
| 重慶市地震局の地震早期警報 | `wss://ws-api.wolfx.jp/cq_eew` | `query_cqeew` |
| 中国地震台網の地震早期警報 | `wss://ws-api.wolfx.jp/cenc_eew` | `query_cenceew` |
| 中国地震台網の地震情報 | `wss://ws-api.wolfx.jp/cenc_eqlist` | `query_cenceqlist` |
| 気象庁の地震情報 | `wss://ws-api.wolfx.jp/jma_eqlist` | `query_jmaeqlist` |
| 気象庁の津波情報 | `wss://ws-api.wolfx.jp/jma_tsunami` | `query_jmatsunami` |
| 気象庁の南海トラフ・北海道・三陸沖関連情報 | `wss://ws-api.wolfx.jp/jma_special_eq` | `query_jmaspecialeq` |

配信される JSON の各フィールドについては [Open API ドキュメント](/docs/open-api) または [API トップページ](https://api.wolfx.jp) をご覧ください。

接続確認用のコマンド

```text
ping
```

## WebSocket メッセージの形式

### 共通フィールド

| フィールド | 説明 |
| --- | --- |
| `type` | データの種類または配信元（文字列型） |

### ハートビート (`heartbeat`)

| フィールド | 説明 |
| --- | --- |
| `type` | `heartbeat`（文字列型） |
| `ver` | サーバーのバージョン（数値型） |
| `id` | 接続ごとの UUID（文字列型） |
| `timestamp` | 送信時刻のタイムスタンプ（ミリ秒、文字列型） |

### ping への応答 (`pong`)

| フィールド | 説明 |
| --- | --- |
| `type` | `pong`（文字列型） |
| `timestamp` | 送信時刻のタイムスタンプ（ミリ秒、文字列型） |
