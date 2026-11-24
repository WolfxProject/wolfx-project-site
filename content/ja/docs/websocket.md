---
title: "Wolfx WebSocket API 利用ガイド"
description: "地震情報などを WebSocket で購読する方法。接続先、all_eew の除外設定、手動クエリ、受信メッセージの形式を説明します。"
locale: ja
layout: docs
updated: 2026-11-24
source: wsapi.html
---

## WebSocket の概要

購読したデータ源の JSON が更新されると、新しいデータが配信されます。サーバーは接続直後とその後 1 分ごとに `heartbeat` を送ります。クライアントから `ping` を送ることもできます（任意、推奨）。

## 接続の再利用

同じデータを受信する接続は再利用し、短時間に接続を繰り返さないでください。複数のデータ源を購読するには、集約チャンネル `all_eew` を利用できます。

## 集約チャンネルと除外設定

複数のデータ源をまとめて購読する接続先です。

```text
wss://ws-api.wolfx.jp/all_eew
```

不要な更新を減らすには、任意の URL クエリパラメーター `exclude` に、受信対象から外したいデータ源の名前を指定します。個別の購読先の URL パスにあるデータ源名を使い、複数指定する場合はカンマ（`,`）で区切ります。

```text
wss://ws-api.wolfx.jp/all_eew?exclude=cenc_eew
wss://ws-api.wolfx.jp/all_eew?exclude=sc_eew,fj_eew,cq_eew
```

`exclude` は接続時に指定し、その `all_eew` 接続の自動配信にのみ適用されます。指定を変更するには再接続してください。存在しないデータ源名を指定すると、WebSocket のハンドシェイク時に `HTTP 400` が返ります。

除外した公開データ源のキャッシュ済み JSON は、同じ接続で従来の手動クエリコマンドを使って取得できます。

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
