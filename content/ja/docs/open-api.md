---
title: "Wolfx Open API 利用説明"
description: "Wolfx Open API（地震・緊急地震速報 EEW）の利用説明。JSON、GET、WebSocket に対応。"
locale: ja
layout: docs
updated: 2026-11-16
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
| `Title` | 緊急地震速報の表題（文字列型） |
| `CodeType` | 緊急地震速報の発表区分。レベル法による最大予測震度のみの発表は「最大予測震度のみの緊急地震速報」と表示します。震源推定方法そのものを網羅的に示すものではありません（文字列型） |
| `Issue.Source` | 発表官署（文字列型） |
| `Issue.Status` | 発表ステータス（文字列型） |
| `EventID` | 緊急地震速報のイベントID（文字列型） |
| `Serial` | 速報回数（数値型） |
| `AnnouncedTime` | 発表時刻（UTC+9）（文字列型） |
| `OriginTime` | 地震発生時刻（UTC+9）。レベル法では互換性のため検知時刻が入るため、正確な発震時刻とは限りません（文字列型） |
| `Hypocenter` | 震源地（文字列型） |
| `Latitude` | 震源地の緯度（数値型） |
| `Longitude` | 震源地の経度（数値型） |
| `Magnitude` | マグニチュード。未知値の互換値 0 や「仮定震源要素」の固定値 1.0 は実測値ではありません（数値型、推奨） |
| `Magunitude` | **Deprecated**：歴史的なスペルミスです。既存クライアントとの後方互換性のため保持されています。値は常に `Magnitude` と同一です。新規実装では `Magnitude` を使用してください。このフィールドは将来削除される可能性があるため、早めの移行を推奨します。 |
| `Depth` | 震源の深さ（km）。レベル法や「仮定震源要素」の 10 km は仮定値で、未知値も互換値 0 になるため、実測値とは限りません（数値型） |
| `MaxIntensity` | 最大予測震度（弱/強）（文字列型） |
| `Accuracy.Epicenter` | 震央の精度に関する情報（文字列型） |
| `Accuracy.Depth` | 深さの精度に関する情報（文字列型） |
| `Accuracy.Magnitude` | マグニチュードの精度に関する情報（文字列型） |
| `MaxIntChange.String` | 最大震度の変化に関する説明（文字列型） |
| `MaxIntChange.Reason` | 最大震度変更の理由（文字列型） |
| `WarnArea` | 予報・警報対象地域の一覧（配列型 / JSON値） |
| `WarnArea[].Chiiki` | 予報・警報対象地域（文字列型） |
| `WarnArea[].Shindo1` | 地域の最大震度（弱/強）（文字列型） |
| `WarnArea[].Shindo2` | 地域の最小震度（弱/強）（文字列型） |
| `WarnArea[].Time` | 主要動到達予測時刻。PLUM の区分では、その震度を初めて予測した時刻です。警報発表時刻ではありません（UTC+9、HHMMSS、不明は //////、文字列型） |
| `WarnArea[].Type` | 地域の発表種別、「予報」または「警報」（文字列型） |
| `WarnArea[].Arrive` | 地域の到達予測・PLUM の区分を表す説明（文字列型） |
| `isSea` | 海域地震かどうか（真偽型） |
| `isTraining` | 訓練報かどうか（真偽型） |
| `isAssumption` | 気象庁が定義する正式な「仮定震源要素」の使用有無。レベル法による発表は対象外であり、false でも一部地域での PLUM 法の使用を否定するものではありません。取消時は直前の有効な情報の値を保持します（真偽型） |
| `isWarn` | 警報かどうか（真偽型） |
| `isFinal` | 最終報かどうか（真偽型） |
| `isCancel` | 取消報かどうか（真偽型） |
| `OriginalText` | 緊急地震速報の電文テキスト。提供できない場合は空文字列となります（文字列型） |

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
| `No(1~50)` | `No1`〜`No50` の50個のオブジェクト。最大50イベントを既知の発震時刻、イベントIDの降順で格納し、未使用枠は空文字列などの互換値 |
| `Title` | 各 `NoN` 内の発表表題（文字列型） |
| `EventID` | 各 `NoN` 内の公式イベントID（文字列型） |
| `time` | 各イベントの時刻（UTC+9）、`YYYY/MM/DD HH:mm`（文字列型） |
| `time_full` | 同じ時刻を秒まで表した `YYYY/MM/DD HH:mm:ss`（UTC+9、文字列型） |
| `location` | 震源地。不明時は「震源 調査中」（文字列型） |
| `magnitude` | 震級。「不明」や既存の互換表現を含む（文字列型） |
| `shindo` | 最大震度。`5-`、`5+`、「不明」などの公式表記（文字列型） |
| `depth` | `30km` などの深さ（文字列型） |
| `latitude` | 小数点以下1桁の緯度（文字列型） |
| `longitude` | 小数点以下1桁の経度（文字列型） |
| `info` | 各イベントの公式 ForecastComment/Text。津波の見通しなどを含み、全条目で保持・補完。未取得・公式説明なしでは空文字列（文字列型） |
| `md5` | 根の更新識別子。既存実装が `No1`〜`No50` 全体を実際のキー順でコンパクト UTF-8 JSON に直列化したバイト列の MD5。自身を含めない（文字列型） |

表の `Title`〜`info` は各 `NoN` の項目です。`time` と `time_full` は発表時刻ではありません。通常は発震時刻ですが、震度速報のみの場合は互換仕様として検知時刻が入ることがあります。このリストには独立した発表時刻フィールドはなく、報告の発表時刻は地震詳細 API の `reports[].time` で確認してください。位置・震度・震級の不明値には既存の互換表現があり、`0km`・`0.0` などを常に実測のゼロと解釈しないでください。`info` の後日補完や訂正だけでも MD5 は変わります。

## JMA 地震詳細 JSON API

- 説明: 地震イベントごとの震源、震度・長周期地震動観測、公式説明と報告状態を取得
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/jma_earthquake_detail.json
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `events` | 最近の最大100イベント。取消済み・長周期観測のみのイベントを含む。HTTP のみで WebSocket 配信なし（オブジェクト配列） |
| `events[].eventId` | 公式イベントID（文字列型） |
| `events[].status` | `preliminary`: 暫定概要のみ、`reported`: 有効な報告あり、`cancelled`: 保持する製品報告がすべて取消済み（文字列型） |
| `events[].completeness` | `pending`: 履歴補完中、`complete`: 取得可能な履歴の補完済み、`partial`: 一部履歴を復元できない。`complete` でも欠測値はあり得る（文字列型） |
| `events[].hypocenters` | 重複を除いた震源。`name`・`code` は文字列または null、任意の `description` は「ごく浅い」などの公式記述（オブジェクト配列） |
| `events[].hypocenters[].latitude`, `events[].hypocenters[].longitude` | 十進度の緯度・経度。不明は null（数値型 / null） |
| `events[].hypocenters[].depth` | 深さ（km、下向きを正）。不明は null（数値型 / null） |
| `events[].reports` | 各製品の最新状態と、有効な項目を提供する報告。完全な履歴ではない（オブジェクト配列） |
| `events[].reports[].id` | 報告の電文ID（文字列型） |
| `events[].reports[].product` | 製品コード: `VXSE51`、`VXSE52`、`VXSE53`、`VXSE61`、`VXSE62`（文字列型） |
| `events[].reports[].time`, `events[].reports[].issuedAt`, `events[].reports[].targetTime` | 発表時刻、任意の発信・対象時刻。UTC RFC 3339、不明は null（文字列型 / null） |
| `events[].reports[].status` | `issued`: 発表、`corrected`: 訂正、`cancelled`: 取消。取消は該当製品に適用（文字列型） |
| `events[].reports[].originTime`, `events[].reports[].arrivalTime` | 発震時刻・検知時刻。UTC RFC 3339、両者を混同しない（文字列型 / null、任意） |
| `events[].reports[].hypocenter` | 同じイベントの `hypocenters` の索引。`0` は有効（整数型、任意） |
| `events[].reports[].magnitude` | 震級。不明・数値化できない定性的表現は null（数値型 / null、任意） |
| `events[].reports[].magnitudeType`, `events[].reports[].magnitudeText`, `events[].reports[].magnitudeCondition` | 震級種別（`Mj` など）、定性的説明・状態（文字列型、任意） |
| `events[].reports[].observation` | その報告の観測。異なる製品・時刻の観測を同時刻の値として合成しない（オブジェクト型、任意） |
| `events[].reports[].observation.maxIntensity`, `events[].reports[].observation.maxLongPeriod` | 最大震度・最大長周期地震動階級。震度は `5-`、`5+` などの公式文字列（文字列型、任意） |
| `events[].reports[].observation.prefs` | 都道府県。`code`・`name` と任意の `int`（震度）・`lg`（長周期階級）など（オブジェクト配列、任意） |
| `events[].reports[].observation.areas` | 細分区域。`pref` は同じ観測内の `prefs` の整数索引で、`0` も有効（オブジェクト配列、任意） |
| `events[].reports[].observation.cities` | 市町村。`area` は同じ観測内の `areas` の整数索引で、`0` も有効（オブジェクト配列、任意） |
| `events[].reports[].observation.areas[].stations`, `events[].reports[].observation.cities[].stations` | 区域・市町村の観測点。`code`・`name`、任意の `int`・`lg`。長周期では `sva`（数値/null、cm/s）、`periods`（周期帯ごとの `period`・`class`・`sva`）も提供（オブジェクト配列、任意） |
| `events[].reports[].comments` | 公式説明。任意の `forecast`・`warning`・`note`・`text` は文字列、`urls` は文字列配列（オブジェクト型、任意） |
| `events[].reports[].text` | 公式本文・取消説明（文字列型、任意） |
| `events[].summary` | 原電文がない場合の暫定概要。`originTime`、`hypocenter` 索引、`magnitude`、`maxIntensity`、任意の `magnitudeText`（オブジェクト型、任意） |
| `md5` | 内容の変更を識別するハッシュ値（文字列型） |

## JMA 津波情報 JSON API

- 説明: 全国の津波警報・予報の状態と公式の津波観測報告を取得
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/jma_tsunami.json
```

- WebSocket APIアドレス:

```text
wss://ws-api.wolfx.jp/jma_tsunami
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `type` | （WebSocket専用）jma_tsunami（文字列型） |
| `status` | `uninitialized`: 未取得、`unknown`: 状態不明で安全を意味しない、`active`: 警報・注意報あり、`forecast_only`: 予報のみ、`cleared`: 公式解除、`expired`: 公式期限切れで解除ではない、`none_reported`: 公式に「津波なし」と分類（文字列型） |
| `reason` | 状態の理由。単独で危険度を判断しない（文字列型） |
| `trusted` | 現在の公式状態との照合による信頼条件を満たすか。true は津波の危険がないという意味ではない（真偽型） |
| `validUntil` | 信頼期限（UTC RFC 3339）。`trusted=true` かつ有効な非空の期限より現在時刻が前である場合のみ信頼期限内。切断・新着停止時もクライアント側で失効を判定（文字列型 / null） |
| `report` | 最新の全国スナップショット `VTSE41`。`id`・`product`・`time`・`status` と `eventIds`（文字列配列）。時刻は UTC RFC 3339（オブジェクト型 / null） |
| `areas` | 公式の警報・予報区域。`code`・`name`、分類、波情報、観測点を含む。空配列は安全を意味しない（オブジェクト配列） |
| `areas[].level` | `major_warning`: 大津波警報、`warning`: 津波警報、`advisory`: 注意報、`forecast`: 予報、`cleared`: 解除、`none`: 津波なし（文字列型） |
| `areas[].kind`, `areas[].previousKind` | 公式分類コード・直前の分類コード。`previousKind` は任意（文字列型） |
| `areas[].firstWave`, `areas[].maxWave` | 第1波・最大波。任意の `time`（UTC RFC 3339）、`height`（数値/null、m）、`text`・状態を含む。「巨大」「高い」「10m超」「以上」は定性・下限表現で、精密な実測値ではない（オブジェクト型、任意） |
| `areas[].stations` | 区域の観測点。`code`・`name`、任意の満潮時刻 `highTide`、`firstWave`・`maxWave` など（オブジェクト配列、任意） |
| `observations` | 関連する `VTSE51`・`VTSE52` の最新観測報告。固有のID・時刻・取消状態を持ち、`VTSE41` の警報区域を上書きしない（オブジェクト配列） |
| `observations[].observed`, `observations[].estimated` | 実測・沿岸推定の区域と観測点、波情報。報告ごとに時刻が異なり得る（オブジェクト配列、任意） |
| `lastKnown` | 信頼できない場合の最後に分かった区域・観測・説明。参考用で、現在有効な警報ではない（オブジェクト型、任意） |
| `comments` | 公式説明。任意の `forecast`・`warning`・`note`・`text` は文字列、`urls` は文字列配列（オブジェクト型、任意） |
| `text` | 公式本文（文字列型、任意） |
| `md5` | 内容変更の識別子。信頼期限の更新でも変化し、新しい公式警報の発表とは限らない（文字列型） |

## JMA 特別地震情報 JSON API

- 説明: 南海トラフおよび北海道・三陸沖に関する各製品の最新の公式報告を取得
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/jma_special_eq.json
```

- WebSocket APIアドレス:

```text
wss://ws-api.wolfx.jp/jma_special_eq
```

- JSONフィールドの説明（データ型）:

| Field | Description |
| --- | --- |
| `type` | （WebSocket専用）jma_special_eq（文字列型） |
| `reports` | 製品ごとに最新1件、合計最大4件。完全な履歴ではなく、報告の存在は現在の警戒を意味しない（オブジェクト配列） |
| `reports[].id` | 報告の電文ID（文字列型） |
| `reports[].product` | `VYSE50`: 南海トラフ地震臨時情報、`VYSE51`: 南海トラフ地震臨時情報に関する解説情報、`VYSE52`: 南海トラフ地震関連解説情報、`VYSE60`: 北海道・三陸沖後発地震注意情報。定例解説は臨時の警戒を意味しない（文字列型） |
| `reports[].time` | 公式発表時刻（UTC RFC 3339）（文字列型 / null） |
| `reports[].status` | `issued`: 発表、`corrected`: 訂正、`cancelled`: 取消。対応する最新報告の状態を保持（文字列型） |
| `reports[].eventIds` | 公式の関連イベントID（文字列配列） |
| `reports[].kind`, `reports[].code`, `reports[].label`, `reports[].title` | 公式情報種別、情報番号コード・名称、報告表題（文字列型、任意） |
| `reports[].text`, `reports[].notice`, `reports[].next` | 公式本文、取消説明などの補足、次回発表に関する説明（文字列型、任意） |
| `reports[].appendix` | 根の `appendices` の整数索引。`0` は有効（整数型、任意） |
| `appendices` | 重複を除いた公式参考解説（文字列配列） |
| `md5` | 内容の変更を識別するハッシュ値（文字列型） |

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
| `Magnitude` | マグニチュード（数値型、推奨） |
| `Magunitude` | **Deprecated**：歴史的なスペルミスです。既存クライアントとの後方互換性のため保持されています。値は常に `Magnitude` と同一です。新規実装では `Magnitude` を使用してください。このフィールドは将来削除される可能性があるため、早めの移行を推奨します。 |
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
| `Magnitude` | マグニチュード（数値型、推奨） |
| `Magunitude` | **Deprecated**：歴史的なスペルミスです。既存クライアントとの後方互換性のため保持されています。値は常に `Magnitude` と同一です。新規実装では `Magnitude` を使用してください。このフィールドは将来削除される可能性があるため、早めの移行を推奨します。 |
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
