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

- 説明: 地震イベントごとに、震源・震度・長周期地震動の観測、公式説明、訂正・取消および履歴補完の状態を取得します。情報源は、気象庁発表 / DMDATA.JP配信 / Wolfx Project加工・提供です。以下の津波・特別地震情報 API も同じ情報源です。
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/jma_earthquake_detail.json
```

この API は HTTP のみで、独立した WebSocket 接続先や手動クエリはありません。`all_eew` にも含まれません。

### 新しい3 APIの共通形式

以下の地震詳細・津波情報・特別地震情報に適用します。従来の `jma_eqlist.json` の文字列型や JST の時刻形式とは異なります。

- 時刻は UTC RFC 3339（例: `2026-11-15T00:00:00.000Z`）。緯度・経度は十進度、深さは km（下向きを正）、津波の高さは m、長周期地震動の `sva` は cm/s です。
- コード・イベントID・情報番号は文字列で、先頭のゼロを保持します。震度は `5-`、`5+` などの公式文字列です。長周期地震動階級も文字列で、不明値をゼロに変換しません。
- `null` は不明または信頼できる数値・時刻に変換できない値です。省略された項目は、その報告が提供していない項目、または同じ製品の別の有効な報告が提供する項目です。省略をゼロや取消と解釈しないでください。
- 配列の参照は0始まりの整数です。`0` は有効な索引で、永続的な識別子ではありません。空配列は公開対象がないことを示すだけで、安全を保証しません。

各 API の報告オブジェクトには次の共通メタデータがあります。「任意」の項目は省略されます。

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | DMDATA の電文ID。下記の公式サンプル由来の例ではオフライン識別子 |
| `product` | string | `VXSE53` などの公式製品コード |
| `time` | string / null | 公式発表時刻（Head/ReportDateTime）。発震時刻とは別 |
| `status` | string | `issued`（発表）、`corrected`（訂正）、`cancelled`（取消） |
| `issuedAt` | string / null、任意 | Control/DateTime。`time` と異なる場合に提供し、報告の並び順と訂正処理の基準に使用 |
| `targetTime` | string / null、任意 | Head/TargetDateTime。`time` と異なる場合に提供。発震時刻の代わりにはしない |
| `title` | string、任意 | 公式表題。従来の表記互換のため「震源・震度に関する情報」は「震源・震度情報」と表示 |
| `serial` | string、任意 | 公式の情報番号 |
| `validUntil` | string / null、任意 | 公式の Head/ValidDateTime。津波 API の根の同名フィールドとは別の期限 |

`comments` は任意の公式説明オブジェクトです。`forecast`、`warning`、`note`、`text` は文字列、`urls` は文字列配列です。同種の複数段落は原順で空行を挟んで連結します。

### 内容の更新とMD5

3 API の根の `md5`（string）は内容の変更を識別する32桁の小文字16進数です。根の `md5` を除くオブジェクトを、サービスが出力するキー順のままコンパクトな UTF-8 JSON に直列化したバイト列から計算します。言語間でキーを並べ替える規範化 JSON ハッシュではなく、電子署名や認証にも使えません。

地震詳細・特別地震情報は業務内容に変化がなければ、通常は内容と MD5 が安定します。津波情報では、公式警報の新規発表がなくても、必要な `validUntil` の更新で MD5 が変わります。MD5 の変化だけで新しい地震や津波の発表と判定しないでください。従来の地震リストの MD5 は前節の既存仕様に従います。ファイル間で同一時点のスナップショットを保証するものではありません。

### イベント・震源・報告

| Field | Type | Description |
| --- | --- | --- |
| `events` | object[] | 最近の最大100イベント。取消済み・長周期地震動のみのイベントも含み、従来の50件リストより広い集合。既知の発震時刻、イベントIDの降順 |
| `events[].eventId` | string | 気象庁のイベントID |
| `events[].status` | string | `preliminary`: GD の暫定概要のみ。`reported`: 有効な製品報告あり。`cancelled`: 保持する製品報告がすべて取消済み |
| `events[].completeness` | string | `pending`: 履歴補完中。`complete`: 取得可能な履歴の補完済み。`partial`: 復元可能な範囲外の履歴があり、完全には再現できない |
| `events[].hypocenters` | object[] | 重複を除いた公式震源。報告ごとの修正を参照で表現 |
| `events[].reports` | object[] | 製品ごとの最新状態と、現在も有効な項目の提供元の報告。公式伝送時刻の昇順。完全な履歴ではない |
| `events[].summary` | object、任意 | 原電文がまだない GD（地震イベント一覧・詳細）の暫定概要。`originTime`、`hypocenter`、`magnitude`、`maxIntensity` と任意の `magnitudeText` |
| `md5` | string | 前述の内容識別子 |

`complete` は履歴の補完状態であり、すべての公式項目に値があることを保証しません。

`events[].hypocenters[]` の項目:

| Field | Type | Description |
| --- | --- | --- |
| `name`, `code` | string / null | 震央地名・公式コード |
| `latitude`, `longitude`, `depth` | number / null | 十進度の緯度・経度、km の深さ。欠測深度を0にしない |
| `detail`, `detailCode`, `location` | string、任意 | 詳細な震央地名・コード、参照地点からの位置 |
| `source` | string、任意 | PTWC など公式の震源決定機関 |
| `description` | string、任意 | 「ごく浅い」「700km以上」や不明など、数値だけでは表せない公式記述 |

`events[].reports[]` は共通メタデータに加え、次の項目を必要に応じて提供します。

| Field | Type | Description |
| --- | --- | --- |
| `originTime` | string / null、任意 | 公式の発震時刻 |
| `arrivalTime` | string / null、任意 | 公式の検知時刻。VXSE51 の対象時刻はここに入り、発震時刻と混同しない |
| `hypocenter` | integer、任意 | 同じイベントの `hypocenters` の索引。`0` も有効 |
| `magnitude` | number / null、任意 | 公式震級。不明・定性的な巨大地震表現を0にしない |
| `magnitudeType` | string、任意 | `Mj` などの震級種別 |
| `magnitudeText`, `magnitudeCondition` | string、任意 | 震級の定性的な説明・状態 |
| `observation` | object、任意 | その報告に属する震度・長周期地震動観測 |
| `comments`, `text` | object / string、任意 | 公式説明、本文または取消説明 |

対象製品は VXSE51（震度速報）、VXSE52（震源に関する情報）、VXSE53（震源・震度情報、遠地地震に関する情報）、VXSE61（顕著な地震の震源要素更新のお知らせ）、VXSE62（長周期地震動に関する観測情報）です。同じ製品の訂正は直前の版を置き換え、取消はその製品の有効な系列を取り消します。他製品の報告は引き続き有効な場合があります。以前の報告が公式説明などを提供し続ける場合、その報告自身のID・時刻を保持します。

### 震度・長周期地震動の観測

`events[].reports[].observation` は報告ごとに保持します。異なる製品・発表時刻の観測を同時刻の観測として合成しないでください。

- `maxIntensity`、`maxLongPeriod`、`longPeriodCategory`（任意の string）: 最大震度、最大長周期地震動階級、公式の長周期区分。
- `prefs[]`: 都道府県。`code`、`name`（string）、任意の `int`（震度）、`lg`（長周期地震動階級）、`condition`（観測状態）、`revise`（修正表示）は string。
- `areas[]`: 地震情報の細分区域。同種の項目と `pref`（同じ観測内の `prefs` の整数索引）。長周期観測点はこの区域の `stations[]` に属します。
- `cities[]`: 市町村。同種の項目と `area`（同じ観測内の `areas` の整数索引）。震度観測点はこの市町村の `stations[]` に属します。
- `stations[]`: `code`、`name` と、任意の `int`、`lg`、`condition`、`revise`。長周期観測では `sva`（number / null、cm/s）と `periods[]` も提供されます。
- `periods[]`: `period`（number、1〜7の秒台の周期帯）、任意の `class`（string、階級）・`sva`（number / null、cm/s）。空の観測配列は省略されます。

### 地震詳細のJSON例

公開レスポンスを縮小した構造例です。イベント・観測配列と任意の項目を省略し、親への索引を保持しています。MD5 はこの例の内容で再計算しています。リアルタイムの地震情報ではありません。

```json
{
  "events": [
    {
      "eventId": "20261116132447",
      "status": "reported",
      "completeness": "complete",
      "hypocenters": [{"name":"石川県能登地方","code":"390","latitude":37.3,"longitude":137,"depth":280}],
      "reports": [
        {
          "id": "2184996cd2b67304661c5461e1e2f41a8f53ce84f8f663a87f53ba253e83b08a00da334789d890022c9018fbdebed11a",
          "product": "VXSE53",
          "time": "2026-11-16T04:29:00.000Z",
          "status": "issued",
          "issuedAt": "2026-11-16T04:29:02.000Z",
          "title": "震源・震度情報",
          "serial": "1",
          "originTime": "2026-11-16T04:24:00.000Z",
          "arrivalTime": "2026-11-16T04:24:00.000Z",
          "hypocenter": 0,
          "magnitude": 5.1,
          "magnitudeType": "Mj",
          "observation": {
            "maxIntensity": "1",
            "prefs": [{"code":"02","name":"青森県","int":"1"}],
            "areas": [{"code":"202","name":"青森県三八上北","int":"1","pref":0}],
            "cities": [{"code":"0220300","name":"八戸市","int":"1","area":0,"stations":[{"code":"0220302","name":"八戸市湊町","int":"1"}]}]
          },
          "comments": {"note":"＊印は気象庁以外の震度観測点についての情報です。","forecast":"この地震による津波の心配はありません。"}
        }
      ]
    }
  ],
  "md5": "b5ccb8340333f0b3d1682416a8ca9074"
}
```

## JMA 津波情報 JSON API

- 説明: 全国の公式警報・予報の状態と、独立した津波観測報告を取得します。気象庁発表 / DMDATA.JP配信 / Wolfx Project加工・提供。
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/jma_tsunami.json
```

- WebSocket APIアドレス:

```text
wss://ws-api.wolfx.jp/jma_tsunami
```

WebSocket の `type` は `jma_tsunami`、手動クエリは `query_jmatsunami` です。`all_eew` でも配信されます。HTTP JSON に `type` は付与されません。

### 津波情報の根フィールド

| Field | Type | Description |
| --- | --- | --- |
| `status`, `reason` | string | 状態とその理由。下記の区別が必要 |
| `trusted` | boolean | 上流の公式状態との照合による信頼条件を満たしているか |
| `validUntil` | string / null | 根の信頼期限。クライアント側でも必ず失効を判定 |
| `report` | object / null | 最新 VTSE41（全国の警報・予報スナップショット）の共通メタデータと `eventIds`（string[]） |
| `areas` | object[] | 信頼できる警報・予報・解除・津波なしの区域。信頼できないまたは公式期限切れでは空配列 |
| `observations` | object[] | 関連する VTSE51・VTSE52 の最新報告。各製品につき最大1件 |
| `comments`, `text` | object / string、任意 | 現在の公式説明・本文 |
| `lastKnown` | object、任意 | 信頼できないときだけ保持する最後に分かった `areas`、`observations` と任意の `comments`、`text`。現在有効な警報ではない |
| `md5` | string | 内容識別子。信頼期限の更新でも変化する |

| status | 意味 |
| --- | --- |
| `uninitialized` | 接続は正常だが、権威ある VTSE41 が未取得 |
| `unknown` | 断線・照合失敗・解析不能・競合・取消・信頼期限切れなどにより現在の状態を証明できない。津波の危険がないという意味ではない |
| `active` | 大津波警報・津波警報・津波注意報あり |
| `forecast_only` | 津波予報のみ |
| `cleared` | 公式に解除された状態 |
| `expired` | 公式の ValidDateTime が経過した状態。公式解除ではない |
| `none_reported` | 公式区域分類が明示的に「津波なし」。空配列からは推定しない |

`reason` は `no_authoritative_snapshot`、`official_snapshot`、`report_cancelled`、`unsupported_or_conflicting_report`、`warning_requires_revalidation`、`clock_skew`、`source_unverified` です。理由だけで危険度を判定しないでください。

### 信頼期限の確認

公開の信頼期限は最大約90秒で、上流の権威ある状態との照合が成功した場合だけ更新されます。公式期限などにより短くなる場合もあります。`trusted=true` だけでは不十分です。有効な非空の期限と現在時刻を確認し、さらに `status` を解釈してください。

```js
const deadline = typeof data.validUntil === 'string' && data.validUntil.length > 0
  ? Date.parse(data.validUntil)
  : NaN
const usable = data.trusted === true
  && Number.isFinite(deadline)
  && Date.now() < deadline
```

`usable` は情報の信頼期限内であることを示すだけで、安全を示しません。有効な警報でも、照合済みの `expired` でも `trusted=true` になり得ます。WebSocket 切断、新着メッセージの停止、HTTP キャッシュの停滞時も、クライアント自身が期限切れを処理する必要があります。`areas=[]` を安全と解釈しないでください。

### 区域・波・観測

`areas[]` は `code`、`name`、`level`、`kind`（すべて string）、任意の `previousKind`（直前の公式分類コード）、`firstWave`、`maxWave`、`stations[]` を持ちます。`kind` は公式コードをそのまま保持し、`level` は次の対応です。

| level | kind | 意味 |
| --- | --- | --- |
| `major_warning` | `52`, `53` | 大津波警報 |
| `warning` | `51` | 津波警報 |
| `advisory` | `62` | 津波注意報 |
| `forecast` | `71`, `72`, `73` | 津波予報 |
| `cleared` | `50`, `60` | 公式解除 |
| `none` | `00` | 津波なし |

`firstWave`・`maxWave` は公式の予想・観測・推定の文脈に従う波情報です。常に実測値とは限りません。

| Field | Type | Description |
| --- | --- | --- |
| `time` | string / null、任意 | 公式の到達・観測時刻 |
| `height` | number / null、任意 | m 単位の高さ。`text` と併せて解釈 |
| `text`, `heightCondition` | string、任意 | 高さの公式記述・状態。「巨大」「高い」「10m超」「不明」など |
| `condition` | string、任意 | 到達・観測状態。「観測中」「欠測」など |
| `initial`, `revise` | string、任意 | 初動（押し・引き）と修正表示 |

`height=10` と `text=１０ｍ超` は下限の表現で、正確な10 mではありません。「巨大」「高い」「不明」「観測中」「欠測」を通常の数値やゼロに置き換えないでください。

`stations[]` は `code`、`name`（string）、任意の `sensor`（string）、`highTide`（string / null、満潮時刻）、`firstWave`、`maxWave` を持ちます。

`observations[]` には共通報告メタデータと `eventIds`（string[]）、任意の `areas`（その報告の予想到達・満潮情報）、`observed`（実測）、`estimated`（沿岸推定）、`comments`、`text` があります。`observed[]`・`estimated[]` は `code`、`name` と任意の `stations`、`firstWave`、`maxWave` を持ち、海上観測の空の区域コードもそのまま保持します。

これらは独立した VTSE51/52 の報告で、根の VTSE41 の全国スナップショットを上書きしません。警報と共通のイベントIDを持つ最新観測でも、発表時刻は異なり得ます。観測から解除済み警報を再び有効にしてはいけません。訂正は対応する版を更新し、観測取消は取消メタデータ・本文だけを残して測定値を除きます。VTSE41 自体の取消は `unknown` となり、以前の警報に戻りません。照合失敗や断線時の `lastKnown` は参考用であり、現在の警報には使えません。

### 津波情報のJSON例

気象庁の公式形式サンプル `32-39_11_02_250206_VTSE41.xml` に基づく縮小構造例です。照合されていない状態を示し、警報区域は `lastKnown` 内だけにあります。MD5 は本例用に再計算しています。現在の津波状況を示すものではありません。

```json
{
  "status": "unknown",
  "reason": "source_unverified",
  "trusted": false,
  "validUntil": null,
  "report": {
    "id": "71fc2503ab7b8688052c52722c93dfa5",
    "product": "VTSE41",
    "time": "2011-03-11T05:49:00.000Z",
    "status": "issued",
    "issuedAt": "2011-03-11T05:49:59.000Z",
    "title": "大津波警報・津波警報・津波注意報・津波予報",
    "eventIds": ["20110311144640"]
  },
  "areas": [],
  "observations": [],
  "lastKnown": {
    "areas": [
      {
        "code": "210",
        "name": "岩手県",
        "level": "major_warning",
        "kind": "53",
        "previousKind": "00",
        "firstWave": {"condition":"津波到達中と推測"},
        "maxWave": {"height":null,"text":"巨大","heightCondition":"不明"}
      }
    ],
    "observations": []
  },
  "md5": "08c2827ce954f62bbed80484e44c17fd"
}
```

## JMA 特別地震情報 JSON API

- 説明: 各製品の最新の公式報告を取得します。現在有効な警戒状態の判定 API や完全な履歴ではありません。気象庁発表 / DMDATA.JP配信 / Wolfx Project加工・提供。
- HTTP GET APIアドレス:

```text
https://api.wolfx.jp/jma_special_eq.json
```

- WebSocket APIアドレス:

```text
wss://ws-api.wolfx.jp/jma_special_eq
```

WebSocket の `type` は `jma_special_eq`、手動クエリは `query_jmaspecialeq` です。`all_eew` でも配信されます。

| product | 公式製品 |
| --- | --- |
| `VYSE50` | 南海トラフ地震臨時情報 |
| `VYSE51` | 南海トラフ地震臨時情報に関する解説情報 |
| `VYSE52` | 南海トラフ地震関連解説情報（定例解説を含む） |
| `VYSE60` | 北海道・三陸沖後発地震注意情報 |

### 特別地震情報のフィールド

| Field | Type | Description |
| --- | --- | --- |
| `reports` | object[] | 製品ごとに最新1件、合計最大4件の公式報告 |
| `appendices` | string[] | 重複を除いた公式参考解説 |
| `md5` | string | 内容識別子 |

`reports[]` には共通の `id`、`product`、`time`、`status` と、必要に応じた `issuedAt`、`targetTime`、`title`、`serial`、`validUntil` があり、以下を追加します。

| Field | Type | Description |
| --- | --- | --- |
| `eventIds` | string[] | 公式の関連イベントID |
| `kind` | string、任意 | 本文の公式情報種別（EarthquakeInfo/InfoKind） |
| `code`, `label` | string、任意 | 公式の情報番号コードと名称（InfoSerial） |
| `text` | string、任意 | 公式本文 |
| `notice` | string、任意 | 本文と異なる Body/Text。取消説明など |
| `next` | string、任意 | 次回発表に関する公式説明 |
| `appendix` | integer、任意 | 根の `appendices` の索引。`0` は有効 |

訂正・取消は対応する最新報告の状態と公式本文を保持し、以前の警戒報告へ戻しません。VYSE52 の定例解説は、現在の臨時の地震警戒を意味しません。古い報告が残っていることから現在の危険度を推定しないでください。公式の発表時刻・状態・本文を確認してください。

### 特別地震情報のJSON例

公式形式サンプル `75_01_04_200512_VYSE52.xml` に基づく構造例です。任意の `text` などを省略し、参考解説と索引 `0` を保持しています。MD5 は本例用に再計算しています。過去の日付の形式例であり、現在の警戒を示しません。

```json
{
  "reports": [
    {
      "id": "2182f774aed16953ae288f821cb0aaf0",
      "product": "VYSE52",
      "time": "2020-05-12T07:44:00.000Z",
      "status": "issued",
      "issuedAt": "2020-05-12T07:44:52.000Z",
      "title": "南海トラフ地震関連解説情報",
      "eventIds": ["20200512164400"],
      "kind": "南海トラフ地震関連解説情報",
      "code": "200",
      "label": "定例解説",
      "appendix": 0
    }
  ],
  "appendices": ["＊＊　（参考）　南海トラフ地震に関連する情報の種類　＊＊\n【南海トラフ地震臨時情報】\n情報発表条件：\n○南海トラフ沿いで異常な現象が観測され、その現象が南海トラフ沿いの大規模な地震と関連するかどうか調査を開始した場合、または調査を継続している場合\n○観測された異常な現象の調査結果を発表する場合\n\n情報名に付記するキーワード：\n○「調査中」　下記のいずれかにより臨時に「南海トラフ沿いの地震に関する評価検討会」を開催する場合\n・監視領域内※１でマグニチュード６．８以上の地震※２が発生\n・１カ所以上のひずみ計での有意な変化と共に、他の複数の観測点でもそれに関係すると思われる変化が観測され、想定震源域内のプレート境界で通常と異なるゆっくりすべりが発生している可能性がある場合など、ひずみ計で南海トラフ地震との関連性の検討が必要と認められる変化を観測\n・その他、想定震源域内のプレート境界の固着状態の変化を示す可能性のある現象が観測される等、南海トラフ地震との関連性の検討が必要と認められる現象を観測\n○「巨大地震警戒」　想定震源域内のプレート境界において、モーメントマグニチュード８．０以上の地震が発生したと評価した場合\n○「巨大地震注意」\n・監視領域内※１において、モーメントマグニチュード７．０以上の地震※２が発生したと評価した場合（巨大地震警戒に該当する場合は除く）\n・想定震源域内のプレート境界において、通常と異なるゆっくりすべりが発生したと評価した場合\n○「調査終了」　（巨大地震警戒）、（巨大地震注意）のいずれにも当てはまらない現象と評価した場合\n※１　南海トラフの想定震源域及び想定震源域の海溝軸外側５０ｋｍ程度までの範囲\n※２　太平洋プレートの沈み込みに伴う震源が深い地震は除く\n\n【南海トラフ地震関連解説情報】\n情報発表条件：\n○観測された異常な現象の調査結果を発表した後の状況の推移等を発表する場合\n○「南海トラフ沿いの地震に関する評価検討会」の定例会合における調査結果を発表する場合（ただし南海トラフ地震臨時情報を発表する場合を除く）\n※すでに必要な防災対応がとられている際は、調査を開始した旨や調査結果を南海トラフ地震関連解説情報で発表する場合があります。"],
  "md5": "a61d13383d70499b764813701ae79211"
}
```

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
