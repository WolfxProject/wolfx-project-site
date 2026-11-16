---
title: "Wolfx 防灾（防災）实用类免费 API 接口"
description: "Wolfx Open API 地震、防灾与实用类接口文档，支持 JSON、GET 与 WebSocket。"
locale: zh
layout: docs
updated: 2026-11-16
source: apidoc_zh.html
---
## Wolfx Open API 使用须知

- 感谢您使用 Wolfx Open API。使用本服务前，请阅读本页面底部的《隐私政策》和《使用条款》。如有疑问，请联系 contact@mtf.edu.kg。Wolfx Project 是一个非官方项目，与任何国家或地区的政府机构、气象机构或地震相关机构均无隶属或合作关系。本服务提供的信息仅供参考，不能替代官方地震预警、灾害信息、疏散信息或其他官方警报渠道。灾害发生时，请务必以相关官方机构发布的最新信息为准。

## WebSocket API 使用须知

- 请前往此处查看详细：[/zh/docs/websocket\_zh](/zh/docs/websocket)

## JMA 緊急地震速報 JSON API

- 说明: 实时获取日本气象厅发布的紧急地震速报。低延迟接收协力: [t0729](https://x.com/t0729_)
- HTTP GET API地址:

```text
https://api.wolfx.jp/jma_eew.json
```

- WebSocket API地址:

```text
wss://ws-api.wolfx.jp/jma_eew
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `type` | （WebSocket专用）jma_eew（字符串类型） |
| `Title` | 紧急地震速报的标题（字符串类型） |
| `CodeType` | 紧急地震速报的发布类别。采用レベル法仅发布最大预测震度时，显示「最大予測震度のみの緊急地震速報」。该字段不代表完整的震源推定方法分类（字符串类型） |
| `Issue.Source` | 发布机构（字符串类型） |
| `Issue.Status` | 发布状态（字符串类型） |
| `EventID` | 紧急地震速报的事件 ID（字符串类型） |
| `Serial` | 速报序号（数值类型） |
| `AnnouncedTime` | 发布时间（UTC+9）（字符串类型） |
| `OriginTime` | 地震发生时间（UTC+9）。レベル法为保持兼容会填入检知时间，不一定是准确的地震发生时间（字符串类型） |
| `Hypocenter` | 震源地（字符串类型） |
| `Latitude` | 震源纬度（数值类型） |
| `Longitude` | 震源经度（数值类型） |
| `Magnitude` | 震级。未知值的兼容值 0，以及正式「仮定震源要素」的固定值 1.0，均不是实测值（数值类型，推荐使用） |
| `Magunitude` | **Deprecated**：历史拼写错误，仅为兼容旧客户端保留；值始终与 `Magnitude` 相同。新接入请使用 `Magnitude`。该字段未来可能被删除，请尽快迁移。 |
| `Depth` | 震源深度（km）。レベル法及正式「仮定震源要素」的 10 km 为假定值，未知值也会映射为兼容值 0，不能一概视为实测结果（数值类型） |
| `MaxIntensity` | 最大预测震度（弱/强）（字符串类型） |
| `Accuracy.Epicenter` | 关于震央精度的信息（字符串类型） |
| `Accuracy.Depth` | 关于深度精度的信息（字符串类型） |
| `Accuracy.Magnitude` | 关于震级精度的信息（字符串类型） |
| `MaxIntChange.String` | 关于最大震度变化的说明（字符串类型） |
| `MaxIntChange.Reason` | 最大震度变更的原因（字符串类型） |
| `WarnArea` | 预报及警报对象地区列表（数组类型 / JSON 值） |
| `WarnArea[].Chiiki` | 预报及警报对象地区（字符串类型） |
| `WarnArea[].Shindo1` | 地区最大震度（弱/强）（字符串类型） |
| `WarnArea[].Shindo2` | 地区最小震度（弱/强）（字符串类型） |
| `WarnArea[].Time` | 主要动预计到达时间；PLUM 类别中表示首次预测该震度的时间，并非警报发布时间（UTC+9，HHMMSS，未知为 //////，字符串类型） |
| `WarnArea[].Type` | 地区发布类型，“预报”或“警报”（字符串类型） |
| `WarnArea[].Arrive` | 地区到达预测或 PLUM 类别的说明（字符串类型） |
| `isSea` | 是否为海域地震（布尔类型） |
| `isTraining` | 是否为训练报（布尔类型） |
| `isAssumption` | 日本气象厅正式定义的「仮定震源要素」使用标志，不包含仅采用レベル法发布的情况。false 也不代表部分地区未采用 PLUM 法。取消时保留此前有效信息中的值（布尔类型） |
| `isWarn` | 是否为警报（布尔类型） |
| `isFinal` | 是否为最终报（布尔类型） |
| `isCancel` | 是否为取消报（布尔类型） |
| `OriginalText` | 紧急地震速报电文文本。无法提供时为空字符串（字符串类型） |

## JMA 地震情報 JSON API

- 描述: 获取日本気象庁发布的最新地震情報, 共50条
- HTTP GET API地址:

```text
https://api.wolfx.jp/jma_eqlist.json
```

- WebSocket API地址:

```text
wss://ws-api.wolfx.jp/jma_eqlist
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `type` | （WebSocket专用）jma_eqlist（字符串型） |
| `No(1~50)` | `No1`～`No50` 共50个对象，最多50个事件，按已知发震时间、事件ID降序排列；未使用槽位保留空字符串等兼容值 |
| `Title` | 各 `NoN` 内的发报标题（字符串型） |
| `EventID` | 各 `NoN` 内的官方事件ID（字符串型） |
| `time` | 各事件的时间（UTC+9），`YYYY/MM/DD HH:mm`（字符串型） |
| `time_full` | 同一时间的秒级格式 `YYYY/MM/DD HH:mm:ss`（UTC+9，字符串型） |
| `location` | 震源地，未知时为“震源 調査中”（字符串型） |
| `magnitude` | 震级，含“不明”等既有兼容表示（字符串型） |
| `shindo` | 最大震度，保留 `5-`、`5+`、“不明”等官方表示（字符串型） |
| `depth` | 深度，如 `30km`（字符串型） |
| `latitude` | 保留一位小数的纬度（字符串型） |
| `longitude` | 保留一位小数的经度（字符串型） |
| `info` | 各事件自身的官方 ForecastComment/Text，包含海啸展望等；所有条目均可保留、补全。尚未取得或官方没有说明时为空字符串（字符串型） |
| `md5` | 根更新标识。既有实现按实际键顺序将全部 `No1`～`No50` 紧凑序列化为 UTF-8 JSON，对其字节计算 MD5，不含自身（字符串型） |

表中 `Title`～`info` 均位于各 `NoN` 对象内。`time`、`time_full` 不是发布时间：通常表示发震时间，仅有震度速报时可能按兼容规则使用检知时间。列表未公开独立发布时间字段；各报告发布时间请查详情 API 的 `reports[].time`。位置、震度、震级等未知值使用既有兼容表示，不能把 `0km`、`0.0` 等一律视为实测零值。后续仅补全或订正 `info` 也会改变 MD5。

## JMA 地震详情 JSON API

- 描述: 按地震事件获取震源、官方震度与长周期地震动观测、官方说明、订正和取消，以及历史补全状态。来源：日本气象厅发布 / DMDATA.JP传输 / Wolfx Project加工提供。下方海啸及特别地震情报 API 的来源相同。
- HTTP GET API地址:

```text
https://api.wolfx.jp/jma_earthquake_detail.json
```

此接口仅提供 HTTP，没有独立 WebSocket 地址或手动查询指令，也未加入 `all_eew`。

### 三个新接口的共同格式

以下规则适用于地震详情、海啸和特别地震情报，与旧 `jma_eqlist.json` 的字符串字段和 JST 时间格式不同。

- 时间采用 UTC RFC 3339，例如 `2026-11-15T00:00:00.000Z`。经纬度为十进制度，深度为 km（向下为正），海啸高度为 m，长周期地震动的 `sva` 为 cm/s。
- 代码、事件ID、信息编号均为字符串，保留前导零。震度保留 `5-`、`5+` 等官方字符串；长周期地震动阶级也为字符串，不将未知值转换为零。
- `null` 表示未知，或无法可靠转换的数值、时间。字段省略表示该报告不提供该项，或由同产品的另一份有效报告提供；省略不表示清零或取消。
- 数组引用是从0开始的整数索引，`0` 有效，但不是持久标识。空数组只表示没有可公开的项目，不能据此判断安全。

各接口的报告对象使用以下共同元数据。标为“可选”的字段可能省略。

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | DMDATA 电文ID；下方官方样例派生示例使用离线标识 |
| `product` | string | 官方产品代码，如 `VXSE53` |
| `time` | string / null | 官方发布时间（Head/ReportDateTime），不是发震时间 |
| `status` | string | `issued`（发布）、`corrected`（订正）、`cancelled`（取消） |
| `issuedAt` | string / null，可选 | Control/DateTime，与 `time` 不同时提供；用于报告排序及订正处理 |
| `targetTime` | string / null，可选 | Head/TargetDateTime，与 `time` 不同时提供，不能代替发震时间 |
| `title` | string，可选 | 官方标题；为保持既有标题兼容，“震源・震度に関する情報”显示为“震源・震度情報” |
| `serial` | string，可选 | 官方信息编号 |
| `validUntil` | string / null，可选 | 官方 Head/ValidDateTime，与海啸根字段的同名信任期限不同 |

可选的 `comments` 是官方说明对象：`forecast`、`warning`、`note`、`text` 为字符串，`urls` 为字符串数组。同类多段文字按原顺序以空行连接。

### 内容更新与MD5

三个新接口根字段 `md5`（string）是用于识别内容变化的32位小写十六进制标识。计算时移除根 `md5`，按服务实际输出的键顺序，将剩余对象紧凑序列化为 UTF-8 JSON，对其字节计算 MD5。它不是跨语言重排键的规范化 JSON 哈希，也不是数字签名或身份认证机制。

地震详情和特别情报没有业务变化时，内容与 MD5 通常保持稳定。海啸即使没有新的官方警报，也可能因必要的 `validUntil` 续期而改变 MD5。不能仅凭 MD5 变化判断出现了新地震或新海啸。旧地震列表仍按上一节的既有规则计算 MD5。不同文件也不保证是同一时刻的事务快照。

### 事件、震源及报告

| Field | Type | Description |
| --- | --- | --- |
| `events` | object[] | 最近最多100个事件，包括取消事件及独立长周期地震动事件，范围大于旧50条列表。按已知发震时间、事件ID降序排列 |
| `events[].eventId` | string | 气象厅事件ID |
| `events[].status` | string | `preliminary`：仅有 GD 暂定摘要；`reported`：有有效产品报告；`cancelled`：保留的产品报告均已取消 |
| `events[].completeness` | string | `pending`：历史补全中；`complete`：可取得的历史补全完成；`partial`：部分历史超出可恢复范围，无法可靠重放 |
| `events[].hypocenters` | object[] | 去重后的官方震源，各报告通过索引引用相应修正 |
| `events[].reports` | object[] | 各产品最新状态及仍提供有效字段的报告，按官方传输时间升序排列；不是完整历史档案 |
| `events[].summary` | object，可选 | 尚无原始电文时的 GD（地震事件列表与详情）暂定摘要，含 `originTime`、`hypocenter`、`magnitude`、`maxIntensity` 及可选 `magnitudeText` |
| `md5` | string | 前述内容标识 |

`complete` 只说明历史补全状态，不保证所有官方字段都有值。

`events[].hypocenters[]` 字段：

| Field | Type | Description |
| --- | --- | --- |
| `name`, `code` | string / null | 震源地名称、官方代码 |
| `latitude`, `longitude`, `depth` | number / null | 十进制度经纬度、km 深度，缺失深度不转换为0 |
| `detail`, `detailCode`, `location` | string，可选 | 详细震源地名称、代码及相对参照地点的位置 |
| `source` | string，可选 | PTWC 等官方震源确定机构 |
| `description` | string，可选 | “ごく浅い”“700km以上”或未知等数值无法完整表达的官方描述 |

`events[].reports[]` 在共同元数据之外按实际报告提供以下字段：

| Field | Type | Description |
| --- | --- | --- |
| `originTime` | string / null，可选 | 官方发震时间 |
| `arrivalTime` | string / null，可选 | 官方检知时间；VXSE51 的对象时间归入此字段，不等于发震时间 |
| `hypocenter` | integer，可选 | 本事件 `hypocenters` 数组的索引，`0` 有效 |
| `magnitude` | number / null，可选 | 官方震级，未知或定性的巨大地震描述不伪造为0 |
| `magnitudeType` | string，可选 | 震级类型，如 `Mj` |
| `magnitudeText`, `magnitudeCondition` | string，可选 | 震级的定性描述、状态 |
| `observation` | object，可选 | 属于本报告的震度、长周期地震动观测 |
| `comments`, `text` | object / string，可选 | 官方说明、正文或取消说明 |

涵盖 VXSE51（震度速报）、VXSE52（震源信息）、VXSE53（震源与震度信息、远地地震信息）、VXSE61（显著地震震源要素更新）、VXSE62（长周期地震动观测信息）。同产品的订正替换紧邻上一版，取消清除该产品的有效系列，其他产品仍可能有效。较早的报告若仍提供有效官方说明等字段，会保留自身的ID和时间。

### 震度与长周期地震动观测

`events[].reports[].observation` 按报告分别保留，不能把不同产品、不同发布时间的观测拼成同一时刻的观测。

- `maxIntensity`、`maxLongPeriod`、`longPeriodCategory`（可选 string）：最大震度、最大长周期地震动阶级、官方长周期分类。
- `prefs[]`：都道府县，含 `code`、`name`（string）；可选的 `int`（震度）、`lg`（长周期地震动阶级）、`condition`（观测状态）、`revise`（修正标记）均为 string。
- `areas[]`：地震信息细分区域，含同类字段及 `pref`（本次观测内 `prefs` 的整数索引）。长周期观测站位于该区域的 `stations[]`。
- `cities[]`：市町村，含同类字段及 `area`（本次观测内 `areas` 的整数索引）。震度观测站位于该市町村的 `stations[]`。
- `stations[]`：含 `code`、`name` 及可选 `int`、`lg`、`condition`、`revise`；长周期观测还可含 `sva`（number / null，cm/s）与 `periods[]`。
- `periods[]`：`period`（number，1～7秒台周期带）、可选 `class`（string，阶级）和 `sva`（number / null，cm/s）。没有项目的观测数组省略。

### 地震详情JSON示例

以下是缩减公开响应后的结构示例，删减了事件、观测数组和部分可选项，并保留父级索引。MD5 已按本例内容重新计算，不代表实时地震信息。

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

## JMA 海啸情报 JSON API

- 描述: 获取全国官方海啸警报、预报状态，以及独立的海啸观测报告。来源：日本气象厅发布 / DMDATA.JP传输 / Wolfx Project加工提供。
- HTTP GET API地址:

```text
https://api.wolfx.jp/jma_tsunami.json
```

- WebSocket API地址:

```text
wss://ws-api.wolfx.jp/jma_tsunami
```

WebSocket 的 `type` 为 `jma_tsunami`，手动查询为 `query_jmatsunami`，也通过 `all_eew` 广播。HTTP JSON 不附加 `type`。

### 海啸情报根字段

| Field | Type | Description |
| --- | --- | --- |
| `status`, `reason` | string | 状态及原因，必须区分下列语义 |
| `trusted` | boolean | 是否满足与上游官方状态核对后的信任条件 |
| `validUntil` | string / null | 根级信任期限，客户端也必须自行判断失效 |
| `report` | object / null | 最新 VTSE41 全国警报、预报快照的共同元数据与 `eventIds`（string[]） |
| `areas` | object[] | 可信的警报、预报、解除及无海啸区域；不可信或官方到期时为空 |
| `observations` | object[] | 相关的最新 VTSE51、VTSE52 报告，各产品最多一份 |
| `comments`, `text` | object / string，可选 | 当前官方说明、正文 |
| `lastKnown` | object，可选 | 仅在不可信时保留最后已知的 `areas`、`observations` 及可选 `comments`、`text`，不是当前有效警报 |
| `md5` | string | 内容标识，可信期限续期也会改变它 |

| status | 含义 |
| --- | --- |
| `uninitialized` | 接入健康，但尚无权威 VTSE41 快照 |
| `unknown` | 断线、核对失败、解析失败、冲突、取消或可信期限失效等导致无法确认当前状态，不表示没有海啸风险 |
| `active` | 存在大海啸警报、海啸警报或海啸注意报 |
| `forecast_only` | 仅有海啸预报 |
| `cleared` | 官方明确解除 |
| `expired` | 官方 ValidDateTime 已到期，不是官方解除 |
| `none_reported` | 官方区域分类明确为“津波なし”，不能由空数组推断 |

`reason` 的值为 `no_authoritative_snapshot`、`official_snapshot`、`report_cancelled`、`unsupported_or_conflicting_report`、`warning_requires_revalidation`、`clock_skew`、`source_unverified`，不能独立用于风险判断。

### 检查可信期限

公开可信期限最长约90秒，仅在成功核对上游权威状态后续期，且可能受官方期限等条件进一步缩短。不能只判断 `trusted=true`；应验证有效非空时间、当前时刻，并结合 `status` 解释：

```js
const deadline = typeof data.validUntil === 'string' && data.validUntil.length > 0
  ? Date.parse(data.validUntil)
  : NaN
const usable = data.trusted === true
  && Number.isFinite(deadline)
  && Date.now() < deadline
```

`usable` 仅表示处于可信期限内，不表示安全。有效警报及已核对的 `expired` 状态均可能为 `trusted=true`。即使 WebSocket 断开、没有新消息或 HTTP 缓存未更新，客户端也必须自行处理期限失效。`areas=[]` 不代表安全。

### 区域、波信息及观测

`areas[]` 含 `code`、`name`、`level`、`kind`（均为 string），以及可选 `previousKind`（上一官方分类代码）、`firstWave`、`maxWave`、`stations[]`。`kind` 保留原官方代码，`level` 对应如下：

| level | kind | 含义 |
| --- | --- | --- |
| `major_warning` | `52`, `53` | 大海啸警报（大津波警報） |
| `warning` | `51` | 海啸警报 |
| `advisory` | `62` | 海啸注意报 |
| `forecast` | `71`, `72`, `73` | 海啸预报 |
| `cleared` | `50`, `60` | 官方解除 |
| `none` | `00` | 无海啸 |

`firstWave`、`maxWave` 是波信息对象，须按官方预报、观测、推定的具体语境理解，不能一律视为实测：

| Field | Type | Description |
| --- | --- | --- |
| `time` | string / null，可选 | 官方到达、观测时间 |
| `height` | number / null，可选 | 高度（m），必须结合 `text` 理解 |
| `text`, `heightCondition` | string，可选 | 高度的官方描述及状态，如“巨大”“高い”“10m超”“不明” |
| `condition` | string，可选 | 到达、观测状态，如“観測中”“欠測” |
| `initial`, `revise` | string，可选 | 初动方向（上涨、退落）及修正标记 |

`height=10` 配合 `text=１０ｍ超` 表达下界，不是精确10 m。“巨大”“高い”“不明”“観測中”“欠測”均不能直接转换为普通数值或零。

`stations[]` 含 `code`、`name`（string），以及可选 `sensor`（string）、`highTide`（string / null，满潮时间）、`firstWave`、`maxWave`。

`observations[]` 含共同报告元数据、`eventIds`（string[]），以及可选 `areas`（该报告的预想到达及满潮信息）、`observed`（实测）、`estimated`（沿岸推定）、`comments`、`text`。`observed[]`、`estimated[]` 含 `code`、`name` 及可选 `stations`、`firstWave`、`maxWave`；海上观测的空区域代码保留为空字符串。

这些独立的 VTSE51/52 报告不会覆盖根 VTSE41 全国警报快照。与警报事件ID相交的最新观测也可能有更早的发布时间，不能据此重新激活已解除警报。订正更新相应版本；观测取消仅保留取消元数据及正文，移除已取消测量值。VTSE41 本身取消时为 `unknown`，不会恢复上一份警报。核对失败、断线时的 `lastKnown` 仅供查阅，不能作为当前有效警报。

### 海啸情报JSON示例

以下结构示例基于气象厅官方格式样例 `32-39_11_02_250206_VTSE41.xml`，缩减了数组，展示未经核对的状态，警报区域仅位于 `lastKnown`。MD5 已按本例重新计算，不代表当前海啸状况。

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

## JMA 特别地震情报 JSON API

- 描述: 获取各产品的最新官方报告，不是当前有效警戒状态判断接口，也不是完整历史档案。来源：日本气象厅发布 / DMDATA.JP传输 / Wolfx Project加工提供。
- HTTP GET API地址:

```text
https://api.wolfx.jp/jma_special_eq.json
```

- WebSocket API地址:

```text
wss://ws-api.wolfx.jp/jma_special_eq
```

WebSocket 的 `type` 为 `jma_special_eq`，手动查询为 `query_jmaspecialeq`，也通过 `all_eew` 广播。

| product | 官方产品 |
| --- | --- |
| `VYSE50` | 南海海槽地震临时信息（南海トラフ地震臨時情報） |
| `VYSE51` | 南海海槽地震临时信息解说（南海トラフ地震臨時情報に関する解説情報） |
| `VYSE52` | 南海海槽地震相关解说信息（南海トラフ地震関連解説情報，含定期解说） |
| `VYSE60` | 北海道、三陆近海后续地震注意信息（北海道・三陸沖後発地震注意情報） |

### 特别地震情报字段

| Field | Type | Description |
| --- | --- | --- |
| `reports` | object[] | 每个产品最新一份官方报告，合计最多四份 |
| `appendices` | string[] | 去重后的官方附录 |
| `md5` | string | 内容标识 |

`reports[]` 使用共同的 `id`、`product`、`time`、`status`，并按实际提供可选 `issuedAt`、`targetTime`、`title`、`serial`、`validUntil`，另含：

| Field | Type | Description |
| --- | --- | --- |
| `eventIds` | string[] | 官方关联事件ID |
| `kind` | string，可选 | 正文中的官方信息类型（EarthquakeInfo/InfoKind） |
| `code`, `label` | string，可选 | 官方信息编号代码、名称（InfoSerial） |
| `text` | string，可选 | 官方正文 |
| `notice` | string，可选 | 与正文不同的 Body/Text，如取消说明 |
| `next` | string，可选 | 官方下次发布说明 |
| `appendix` | integer，可选 | 根 `appendices` 数组的索引，`0` 有效 |

订正和取消保留相应最新报告状态与官方正文，不回退到以前的警戒报告。VYSE52 的定期南海海槽解说不等于当前存在临时地震警戒。不能因为 API 保留旧报告就推算当前风险；应检查官方发布时间、状态和正文。

### 特别地震情报JSON示例

以下结构示例基于官方格式样例 `75_01_04_200512_VYSE52.xml`，省略可选 `text` 等字段，保留完整附录及有效索引 `0`。MD5 已按本例重新计算，历史日期的格式示例不代表当前警戒。

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

## 中国地震台网 地震信息 JSON API

- 描述: 获取中国地震台网发布的最新地震信息, 共50条
- HTTP GET API地址:

```text
https://api.wolfx.jp/cenc_eqlist.json
```

- WebSocket API地址:

```text
wss://ws-api.wolfx.jp/cenc_eqlist
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `type` | （WebSocket专用）cenc_eqlist(字符串型) |
| `No(1~50)` | 地震信息条目数，发布时间顺序(字符串型) |
| `type` | 信息类型，分为"automatic"和"reviewed"(字符串型) |
| `time` | 发震时间(UTC+8)(字符串型) |
| `location` | 震源地(对原数据进行了处理以保证国内地区格式一致性)(字符串型) |
| `placeName` | 震源地(未对原数据进行修改以保证数据的原始性)(字符串型) |
| `magnitude` | 震级(字符串型) |
| `depth` | 震源深度(字符串型) |
| `latitude` | 震源地纬度(字符串型) |
| `longitude` | 震源地经度(字符串型) |
| `intensity` | 最大烈度(字符串型) |
| `md5` | 地震信息更新校验码(字符串型) |

## 四川省地震局 地震预警 JSON API

- 描述: 实时获取四川省地震局发布的地震预警
- HTTP GET API地址:

```text
https://api.wolfx.jp/sc_eew.json
```

- WebSocket API地址:

```text
wss://ws-api.wolfx.jp/sc_eew
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `type` | （WebSocket专用）sc_eew(字符串型) |
| `ID` | EEW发报ID(数值型) |
| `EventID` | EEW发报事件ID(字符串型) |
| `ReportTime` | EEW发报时间(UTC+8)(字符串型) |
| `ReportNum` | EEW发报数(数值型) |
| `OriginTime` | 发震时间(UTC+8)(字符串型) |
| `HypoCenter` | 震源地(字符串型) |
| `Latitude` | 震源地纬度(数值型) |
| `Longitude` | 震源地经度(数值型) |
| `Magnitude` | 震级(数值型，推荐使用) |
| `Magunitude` | **Deprecated**：历史拼写错误，仅为兼容旧客户端保留；值始终与 `Magnitude` 相同。新接入请使用 `Magnitude`。该字段未来可能被删除，请尽快迁移。 |
| `Depth` | 震源深度(可能为null)(数值型) |
| `MaxIntensity` | 最大烈度(数值型) |

## 中国地震台网 地震预警 JSON API

- 描述: 实时获取中国地震台网发布的地震预警
- HTTP GET API地址:

```text
https://api.wolfx.jp/cenc_eew.json
```

- WebSocket API地址:

```text
wss://ws-api.wolfx.jp/cenc_eew
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `type` | （WebSocket专用）cenc_eew(字符串型) |
| `ID` | EEW发报ID(字符串型) |
| `EventID` | EEW发报事件ID(字符串型) |
| `ReportTime` | EEW发报时间(UTC+8)(字符串型) |
| `ReportNum` | EEW发报数(数值型) |
| `OriginTime` | 发震时间(UTC+8)(字符串型) |
| `HypoCenter` | 震源地(字符串型) |
| `Latitude` | 震源地纬度(数值型) |
| `Longitude` | 震源地经度(数值型) |
| `Magnitude` | 震级(数值型) |
| `Depth` | 震源深度(可能为null)(数值型) |
| `MaxIntensity` | 最大烈度(数值型) |

## 福建省地震局 地震预警 JSON API

- 描述: 实时获取福建省地震局发布的地震预警
- HTTP GET API地址:

```text
https://api.wolfx.jp/fj_eew.json
```

- WebSocket API地址:

```text
wss://ws-api.wolfx.jp/fj_eew
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `type` | （WebSocket专用）fj_eew(字符串型) |
| `ID` | EEW发报ID(数值型) |
| `EventID` | EEW发报事件ID(字符串型) |
| `ReportTime` | EEW发报时间(UTC+8)(字符串型) |
| `ReportNum` | EEW发报数(数值型) |
| `OriginTime` | 发震时间(UTC+8)(字符串型) |
| `HypoCenter` | 震源地(字符串型) |
| `Latitude` | 震源地纬度(数值型) |
| `Longitude` | 震源地经度(数值型) |
| `Magnitude` | 震级(数值型，推荐使用) |
| `Magunitude` | **Deprecated**：历史拼写错误，仅为兼容旧客户端保留；值始终与 `Magnitude` 相同。新接入请使用 `Magnitude`。该字段未来可能被删除，请尽快迁移。 |
| `isFinal` | 是否为最终报(布尔型) |

## 重庆市地震局 地震预警 JSON API

- 描述: 实时获取重庆市地震局发布的地震预警
- HTTP GET API地址:

```text
https://api.wolfx.jp/cq_eew.json
```

- WebSocket API地址:

```text
wss://ws-api.wolfx.jp/cq_eew
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `type` | （WebSocket专用）cq_eew(字符串型) |
| `ID` | EEW发报ID(字符串型) |
| `EventID` | EEW发报事件ID(字符串型) |
| `ReportTime` | EEW发报时间(UTC+8)(字符串型) |
| `ReportNum` | EEW发报数(数值型) |
| `OriginTime` | 发震时间(UTC+8)(字符串型) |
| `HypoCenter` | 震源地(字符串型) |
| `Latitude` | 震源地纬度(数值型) |
| `Longitude` | 震源地经度(数值型) |
| `Magnitude` | 震级(数值型) |
| `Depth` | 震源深度(可能为null)(数值型) |
| `MaxIntensity` | 最大烈度(数值型) |

## CWA 地震预警 JSON API (仅服务大陆地区)

- 描述: 实时获取CWA发布的地震预警
- HTTP GET API地址:

```text
https://api.wolfx.jp/cwa_eew.json
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `ID` | EEW发报ID(数值型) |
| `ReportTime` | EEW发报时间(UTC+8)(字符串型) |
| `ReportNum` | EEW发报数(数值型) |
| `OriginTime` | 发震时间(UTC+8)(字符串型) |
| `HypoCenter` | 震源地(字符串型) |
| `Latitude` | 震源地纬度(数值型) |
| `Longitude` | 震源地经度(数值型) |
| `Magnitude` | 震级(数值型，推荐使用) |
| `Magunitude` | **Deprecated**：历史拼写错误，仅为兼容旧客户端保留；值始终与 `Magnitude` 相同。新接入请使用 `Magnitude`。该字段未来可能被删除，请尽快迁移。 |
| `Depth` | 震源深度(数值型) |
| `MaxIntensity` | 最大震度(弱/強)(字符串型) |

## 中国气象实况排行 JSON API

- 描述: 提供每小时国家级气象观测站气温、降水、风速实况排行
- HTTP GET API地址:

```text
https://api.wolfx.jp/weather_rank.json
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `YYYYMMDDHH00` | 分别提供最近8小时内的全国气象实况排行(UTC+8)(字符串型) |
| `tempRank` | 气温排行(从高到低10条)(字符串型) |
| `rainRank` | 降水排行(从高到低10条)(字符串型) |
| `windSRank` | 风速排行(从高到低10条)(字符串型) |
| `md5` | 排行数据更新校验码(字符串型) |

## IP位址资讯查询 JSON API

- 描述: 获取请求方或指定IP位址的相关资讯
- HTTP GET API地址:

```text
https://api.wolfx.jp/geoip.php
```

 

```text
https://api.wolfx.jp/geoip.php?ip=<IP位址>
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `ip` | 请求IP(字符串型) |
| `country_code` | 所在国家或地区缩写(字符串型) |
| `country_name` | 所在国家或地区(字符串型) |
| `country_name_zh` | 所在国家或地区(中文)(字符串型) |
| `province_code` | 所在省或州代码(字符串型) |
| `province_name` | 所在省或州(字符串型) |
| `province_name_zh` | 所在省或州(中文)(字符串型) |
| `city` | 所在城市(字符串型) |
| `city_zh` | 所在城市(中文)(字符串型) |
| `latitude` | 所在纬度(可能无法获取)(数值型) |
| `longitude` | 所在经度(可能无法获取)(数值型) |

## 最新服务器时间获取 JSON API

- 描述: 提供最新的精确服务器时间, 供同步时间用
- HTTP GET API地址:

```text
https://api.wolfx.jp/ntp.json
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `JST` | 日本标准时间(UTC+9)(字符串型) |
| `CST` | 中国标准时间(UTC+8)(字符串型) |
| `str` | 当前日期时间(字符串型) |
| `int` | 当前日期时间(数值型) |
| `timestamp` | 当前时间戳(数值型) |

## 公网IP位址获取 PLAIN API

- 描述: 以纯文本的形式获取请求方的公网IP位址
- HTTP GET API地址:

```text
https://api.wolfx.jp/ip.php
```

## 随机动漫图片获取 JPEG API

- 描述: 使用自建图床，随机获取动漫图片
- HTTP GET API地址:

```text
https://api.wolfx.jp/img.php
```

 

```text
https://api.wolfx.jp/img.php?return=<img/json>
```

## API 状态

客户端数量与统计图表会在页面显示后从 Wolfx Project 自有 API 服务加载。

::api-status-panel{locale="zh"}
::
