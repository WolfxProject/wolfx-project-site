---
title: "Wolfx SeisJS API 利用ガイド"
description: "SeisJS 観測点、WebSocket 接続、観測データフィールドの仕様。"
locale: ja
layout: docs
updated: 2025-07-04
version: v20250704
source: seisapi.html
---
## 概要

- 各観測点からのデータ送信間隔：1秒
- 震度算出基準：気象庁震度階級
- 烈度算出基準：中国地震烈度基準（GB/T 17742-2020 参照）
- 本APIは、WebSocket形式でSeisJS観測点からのリアルタイムデータを提供します
- ハートビート方式：サーバーは接続確立時および毎分、heartbeatパケットを送信します。クライアント側でのping応答は任意（推奨）
- 免責事項：本APIはSeisJS観測点のデータのみを提供し、合法的な研究・開発目的のみに利用可能です。その他の目的での使用は禁止です。

## 提供観測点一覧

- 観測点一覧のJSON： [https://api.wolfx.jp/seis\_list.json](https://api.wolfx.jp/seis_list.json)
- 注意：開発者はこのAPIから観測点の状態を取得し、クラウド制御に利用可能です。リストは10分ごとに更新されます。

## WebSocket 接続アドレス

- すべての観測点からのJSONデータを受信：

```text
wss://seisjs.wolfx.jp/all_seis
```

## JSONフィールドの説明（データ型）

| Field | Description |
| --- | --- |
| `type` | 観測点UUID（文字列型） |
| `region` | 観測点の所在地（文字列型） |
| `latitude` | 観測点の緯度（数値型） |
| `longitude` | 観測点の経度（数値型） |
| `version` | SeisJSバージョン（数値型） |
| `PGA` | 合成ピーク地震加速度（cm/s²）（数値型） |
| `PGV` | 合成ピーク地震速度（cm/s）（数値型） |
| `PGD` | 合成ピーク地震変位（cm）（数値型） |
| `PGA_EW` | 東西方向ピーク加速度（cm/s²）（数値型） |
| `PGV_EW` | 東西方向ピーク速度（cm/s）（数値型） |
| `PGD_EW` | 東西方向ピーク変位（cm）（数値型） |
| `PGA_NS` | 南北方向ピーク加速度（cm/s²）（数値型） |
| `PGV_NS` | 南北方向ピーク速度（cm/s）（数値型） |
| `PGD_NS` | 南北方向ピーク変位（cm）（数値型） |
| `PGA_UD` | 上下方向ピーク加速度（cm/s²）（数値型） |
| `PGV_UD` | 上下方向ピーク速度（cm/s）（数値型） |
| `PGD_UD` | 上下方向ピーク変位（cm）（数値型） |
| `Max_PGA` | 過去2分間の最大合成PGA（cm/s²）（数値型） |
| `Max_PGV` | 過去2分間の最大合成PGV（cm/s）（数値型） |
| `Max_PGD` | 過去2分間の最大合成PGD（cm）（数値型） |
| `Max_PGA_EW` | 過去2分間の最大東西方向PGA（cm/s²）（数値型） |
| `Max_PGV_EW` | 過去2分間の最大東西方向PGV（cm/s）（数値型） |
| `Max_PGD_EW` | 過去2分間の最大東西方向PGD（cm）（数値型） |
| `Max_PGA_NS` | 過去2分間の最大南北方向PGA（cm/s²）（数値型） |
| `Max_PGV_NS` | 過去2分間の最大南北方向PGV（cm/s）（数値型） |
| `Max_PGD_NS` | 過去2分間の最大南北方向PGD（cm）（数値型） |
| `Max_PGA_UD` | 過去2分間の最大上下方向PGA（cm/s²）（数値型） |
| `Max_PGV_UD` | 過去2分間の最大上下方向PGV（cm/s）（数値型） |
| `Max_PGD_UD` | 過去2分間の最大上下方向PGD（cm）（数値型） |
| `Shindo` | 合成JMA震度（文字列型） |
| `Max_Shindo` | 過去2分間の最大合成JMA震度（文字列型） |
| `CalcShindo` | 合成JMA計測震度（数値型） |
| `Max_CalcShindo` | 過去2分間の最大合成JMA計測震度（数値型） |
| `Intensity` | 合成CSIS烈度（数値型） |
| `Max_Intensity` | 過去2分間の最大CSIS烈度（数値型） |
| `LPGM` | 長周期地震動階級（数値型） |
| `Max_LPGM` | 過去2分間の最大長周期地震動階級（数値型） |
| `Sva30` | 加速度応答スペクトル値（数値型） |
| `Max_Sva30` | 過去2分間の最大加速度応答スペクトル値（数値型） |
| `error_code` | 観測点側のエラーコード（数値型の配列） |
| `reverse` | 予約フィールド（サーバー内部検証用）（文字列型） |
| `is_desktop` | デスクトップ端末かどうか（ブール型） |
| `High_Precision` | 高精度観測点かどうか（ブール型） |
| `update_at` | データの更新時刻（文字列型） |
| `create_at` | JSON生成時刻（文字列型） |

## WebSocket 手動クエリコマンド

- Ping：

```text
ping
```

## WebSocket JSON データ仕様

- 共通のJSONフィールド：

| Field | Description |
| --- | --- |
| `type` | データタイプ / 観測点UUID（文字列型） |

- WebSocket ハートビートパケットのJSONフィールド：

| Field | Description |
| --- | --- |
| `type` | heartbeat（文字列型） |
| `ver` | サーバーバージョン（数値型） |
| `id` | クライアント固有ID（文字列型） |
| `timestamp` | ミリ秒単位の送信タイムスタンプ（文字列型） |

- WebSocket PongパケットのJSONフィールド：

| Field | Description |
| --- | --- |
| `type` | pong（文字列型） |
| `timestamp` | ミリ秒単位の送信タイムスタンプ（文字列型） |

## APIドキュメントバージョン: v20250704
