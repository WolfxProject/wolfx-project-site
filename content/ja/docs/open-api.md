---
title: "Wolfx Open API 利用説明"
description: "Wolfx Open API（地震・緊急地震速報 EEW）の利用説明。JSON、GET、WebSocket に対応。"
locale: ja
layout: docs
updated: 2026-07-29
version: v20260729
source: apidoc.html
---
## Wolfx Open API ご利用にあたっての注意事項

- Wolfx Open API をご利用いただきありがとうございます。ご利用前に、本ページ下部の「プライバシーポリシー」および「利用規約」をご確認ください。ご不明な点は、contact@mtf.edu.kg までお問い合わせください。Wolfx Project は、いかなる国・地域の政府機関、気象機関、地震関連機関とも関係のない非公式プロジェクトです。本サービスの情報は参考目的であり、公式の緊急地震速報、災害情報、避難情報などを代替するものではありません。災害時は、必ず公的機関の最新情報をご確認ください。

## WebSocket API 利用説明

- 詳細については、こちらをご覧ください：[/docs/websocket](/docs/websocket)

## JMA 緊急地震速報 JSON API

- 説明: 日本気象庁が発表する緊急地震速報をリアルタイムで取得。 低遅延受信協力: [t0729](https://x.com/t0729_)
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/jma_eew.json
```

- WebSocket APIアドレス:

```text
wss://ws-api.wolfx.jp/jma_eew
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `type` | （WebSocket専用）jma_eew（文字列型） |
| `Title` | 緊急地震速報のヘッダー（文字列型） |
| `CodeType` | 発表区分の説明（文字列型） |
| `Issue.Source` | 発表機関の位置（文字列型） |
| `Issue.Status` | 発表ステータス（文字列型） |
| `EventID` | 緊急地震速報のイベントID（文字列型） |
| `Serial` | 速報回数（数値型） |
| `AnnouncedTime` | 発表時刻（UTC+9）（文字列型） |
| `OriginTime` | 地震発生時刻（UTC+9）（文字列型） |
| `Hypocenter` | 震源地（文字列型） |
| `Latitude` | 震源地の緯度（数値型） |
| `Longitude` | 震源地の経度（数値型） |
| `Magunitude` | マグニチュード（数値型） |
| `Depth` | 震源の深さ（数値型） |
| `MaxIntensity` | 最大震度（弱/強）（文字列型） |
| `Accuracy.Epicenter` | 震央の精度に関する情報（文字列型） |
| `Accuracy.Depth` | 深さの精度に関する情報（文字列型） |
| `Accuracy.Magnitude` | マグニチュードの精度に関する情報（文字列型） |
| `MaxIntChange.String` | 最大震度の変化に関する説明（文字列型） |
| `MaxIntChange.Reason` | 最大震度変更の理由（文字列型） |
| `WarnArea` | 警報対象地域の一覧（配列型 / JSON値） |
| `WarnArea[].Chiiki` | 警報対象地域（文字列型） |
| `WarnArea[].Shindo1` | 地域の最大震度（弱/強）（文字列型） |
| `WarnArea[].Shindo2` | 地域の最小震度（弱/強）（文字列型） |
| `WarnArea[].Time` | 地域における警報発表時刻（文字列型） |
| `WarnArea[].Type` | 地域の発表種別、「予報」または「警報」（文字列型） |
| `WarnArea[].Arrive` | その地域に地震波が到達したかどうか（実際のレスポンスに準拠） |
| `isSea` | 海域地震かどうか（真偽型） |
| `isTraining` | 訓練報かどうか（真偽型） |
| `isAssumption` | 仮定震源要素の使用有無（真偽型） |
| `isWarn` | 警報かどうか（真偽型） |
| `isFinal` | 最終報かどうか（真偽型） |
| `isCancel` | 取消報かどうか（真偽型） |
| `OriginalText` | 気象庁が発表した原文（文字列型） |

## 気象庁 地震情報 JSON API

- 説明: 日本気象庁が発表した最新の地震情報（最大50件）を取得
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/jma_eqlist.json
```

- WebSocket APIアドレス:

```text
wss://ws-api.wolfx.jp/jma_eqlist
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `type` | （WebSocket専用）jma_eqlist（文字列型） |
| `Title` | 発表ヘッダー（文字列型） |
| `No(1~50)` | 地震情報の通し番号（発表時刻順）（文字列型） |
| `time` | 地震発生時刻（UTC+9）（文字列型） |
| `location` | 震源地（文字列型） |
| `magnitude` | マグニチュード（文字列型） |
| `shindo` | 最大震度（−/＋）（文字列型） |
| `depth` | 震源の深さ（文字列型） |
| `latitude` | 震源の緯度（文字列型） |
| `longitude` | 震源の経度（文字列型） |
| `info` | 津波情報（最初の1件のみ提供）（文字列型） |
| `md5` | 地震情報の更新チェック用ハッシュ値（文字列型） |

## 中国地震台網 地震情報 JSON API

- 説明: 中国地震台網が発表した最新の地震情報（最大50件）を取得
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/cenc_eqlist.json
```

- WebSocket APIアドレス:

```text
wss://ws-api.wolfx.jp/cenc_eqlist
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `type` | （WebSocket専用）cenc_eqlist（文字列型） |
| `No(1~50)` | 地震情報の通し番号（発表時刻順）（文字列型） |
| `type` | 情報種別："automatic"（自動）または "reviewed"（検証済み）（文字列型） |
| `time` | 地震発生時刻（UTC+8）（文字列型） |
| `location` | 震源地（文字列型） |
| `magnitude` | マグニチュード（文字列型） |
| `depth` | 震源の深さ（文字列型） |
| `latitude` | 震源地の緯度（文字列型） |
| `longitude` | 震源地の経度（文字列型） |
| `intensity` | 最大烈度（文字列型） |
| `md5` | 地震情報の更新チェック用ハッシュ値（文字列型） |

## 四川省地震局 地震速報 JSON API

- 説明: 四川省地震局が発表する地震速報をリアルタイムで取得
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/sc_eew.json
```

- WebSocket APIアドレス:

```text
wss://ws-api.wolfx.jp/sc_eew
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `type` | （WebSocket専用）sc_eew（文字列型） |
| `ID` | 警報ID（数値型） |
| `EventID` | イベントID（文字列型） |
| `ReportTime` | 発表時刻（UTC+8）（文字列型） |
| `ReportNum` | 速報回数（数値型） |
| `OriginTime` | 地震発生時刻（UTC+8）（文字列型） |
| `HypoCenter` | 震源地（文字列型） |
| `Latitude` | 震源地の緯度（数値型） |
| `Longitude` | 震源地の経度（数値型） |
| `Magunitude` | マグニチュード（数値型） |
| `Depth` | 震源の深さ（nullの可能性がある）（数値型） |
| `MaxIntensity` | 最大烈度（数値型） |

## 中国地震台網 地震速報 JSON API

- 説明: 中国地震台網が発表する地震速報をリアルタイムで取得
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/cenc_eew.json
```

- WebSocket APIアドレス:

```text
wss://ws-api.wolfx.jp/cenc_eew
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `type` | （WebSocket専用）cenc_eew（文字列型） |
| `ID` | 警報ID（文字列型） |
| `EventID` | イベントID（文字列型） |
| `ReportTime` | 発表時刻（UTC+8）（文字列型） |
| `ReportNum` | 速報回数（数値型） |
| `OriginTime` | 地震発生時刻（UTC+8）（文字列型） |
| `HypoCenter` | 震源地（文字列型） |
| `Latitude` | 震源地の緯度（数値型） |
| `Longitude` | 震源地の経度（数値型） |
| `Magnitude` | マグニチュード（数値型） |
| `Depth` | 震源の深さ (nullの可能性がある)（数値型） |
| `MaxIntensity` | 最大烈度（数値型） |

## 福建省地震局 地震速報 JSON API

- 説明: 福建省地震局が発表する地震速報をリアルタイムで取得
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/fj_eew.json
```

- WebSocket APIアドレス:

```text
wss://ws-api.wolfx.jp/fj_eew
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `type` | （WebSocket専用）fj_eew（文字列型） |
| `ID` | 警報ID（数値型） |
| `EventID` | イベントID（文字列型） |
| `ReportTime` | 発表時刻（UTC+8）（文字列型） |
| `ReportNum` | 速報回数（数値型） |
| `OriginTime` | 地震発生時刻（UTC+8）（文字列型） |
| `HypoCenter` | 震源地（文字列型） |
| `Latitude` | 震源の緯度（数値型） |
| `Longitude` | 震源の経度（数値型） |
| `Magunitude` | マグニチュード（数値型） |
| `isFinal` | 最終報かどうか（真偽型） |

## 重庆市地震局 地震速報 JSON API

- 説明: 重庆市地震局が発表する地震速報をリアルタイムで取得
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/cq_eew.json
```

- WebSocket APIアドレス:

```text
wss://ws-api.wolfx.jp/cq_eew
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `type` | （WebSocket専用）cq_eew（文字列型） |
| `ID` | 警報ID（文字列型） |
| `EventID` | イベントID（文字列型） |
| `ReportTime` | 発表時刻（UTC+8）（文字列型） |
| `ReportNum` | 速報回数（数値型） |
| `OriginTime` | 地震発生時刻（UTC+8）（文字列型） |
| `HypoCenter` | 震源地（文字列型） |
| `Latitude` | 震源地の緯度（数値型） |
| `Longitude` | 震源地の経度（数値型） |
| `Magnitude` | マグニチュード（数値型） |
| `Depth` | 震源の深さ (nullの可能性がある)（数値型） |
| `MaxIntensity` | 最大烈度（数値型） |

## 中国気象実況ランキング JSON API

- 説明: 毎時、国家級気象観測所の気温・降水量・風速の実況ランキングを提供
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/weather_rank.json
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `YYYYMMDDHH00` | 直近8時間以内の全国気象実況ランキングを提供（UTC+8）（文字列型） |
| `tempRank` | 気温ランキング（高い順に10件）（文字列型） |
| `rainRank` | 降水量ランキング（多い順に10件）（文字列型） |
| `windSRank` | 風速ランキング（速い順に10件）（文字列型） |
| `md5` | ランキングデータの更新確認用ハッシュ（文字列型） |

## IPアドレス情報照会 JSON API

- 説明: リクエスト元または指定されたIPアドレスに関する情報を取得
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/geoip.php
```

 

```text
https://api.wolfx.jp/geoip.php?ip=<IPアドレス>
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `ip` | リクエストされたIPアドレス（文字列型） |
| `country_code` | 国・地域のコード（文字列型） |
| `country_name` | 国・地域名（文字列型） |
| `country_name_zh` | 国・地域名（中国語）（文字列型） |
| `province_code` | 州・省のコード（文字列型） |
| `province_name` | 州・省名（文字列型） |
| `province_name_zh` | 州・省名（中国語）（文字列型） |
| `city` | 市区町村名（文字列型） |
| `city_zh` | 市区町村名（中国語）（文字列型） |
| `latitude` | 緯度（取得できない場合があります）（数値型） |
| `longitude` | 経度（取得できない場合があります）（数値型） |

## 最新サーバー時刻取得 JSON API

- 説明: 時刻同期用に最新かつ正確なサーバー時刻を提供
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/ntp.json
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `JST` | 日本標準時（UTC+9）（文字列型） |
| `CST` | 中国標準時（UTC+8）（文字列型） |
| `str` | 現在の日付と時刻（文字列型） |
| `int` | 現在の日付と時刻（数値型） |
| `timestamp` | 現在のUNIXタイムスタンプ（数値型） |

## パブリックIPアドレス取得 PLAIN API

- 説明: リクエスト元のパブリックIPアドレスをプレーンテキスト形式で取得する
- HTTP GET API アドレス:

```text
https://api.wolfx.jp/ip.php
```

## ランダムアニメ画像取得 JPEG API

- 説明: ランダムにアニメ画像を取得する
- HTTP GET API アドレス:

```text
https://api.wolfx.jp/img.php
```

 

```text
https://api.wolfx.jp/img.php?return=<img/json>
```

## API ステータス

クライアント数と統計グラフは、ページ表示後に Wolfx Project の API サービスから読み込まれます。

::api-status-panel{locale="ja"}
::

## Doc version: v20260729
