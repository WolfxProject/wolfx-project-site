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

**JSON 响应示例**

以下为历史紧急地震速报的 JSON 响应示例，仅供开发者参考和测试，不代表当前实际地震预警状态。

- [第一报（预报）](/examples/jma_eew/forecast_first.json){external}
- [续报（预报）](/examples/jma_eew/forecast_update.json){external}
- [最终报](/examples/jma_eew/forecast_final.json){external}
- [紧急地震速报（警报）](/examples/jma_eew/warning.json){external}
- [レベル法（最大预测震度单独发布）](/examples/jma_eew/level_method.json){external}
- [包含 PLUM 法的预报](/examples/jma_eew/plum_forecast.json){external}
- [包含 PLUM 法的警报](/examples/jma_eew/plum_warning.json){external}
- [取消报](/examples/jma_eew/cancelled.json){external}
- [假定震源要素](/examples/jma_eew/assumed_hypocenter.json){external}
- [海域地震](/examples/jma_eew/sea_earthquake.json){external}

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

- 描述: 获取各地震事件的震源、震度与长周期地震动观测、官方说明及报告状态
- HTTP GET API地址:

```text
https://api.wolfx.jp/jma_earthquake_detail.json
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `events` | 最近最多100个事件，包括取消事件和独立长周期观测事件；仅提供 HTTP，不支持 WebSocket（对象数组） |
| `events[].eventId` | 官方事件ID（字符串型） |
| `events[].status` | `preliminary`：仅暂定摘要；`reported`：有有效报告；`cancelled`：保留的产品报告均已取消（字符串型） |
| `events[].completeness` | `pending`：历史补全中；`complete`：可取得的历史已补全；`partial`：部分历史无法恢复。`complete` 不保证所有字段均有值（字符串型） |
| `events[].hypocenters` | 去重后的震源；`name`、`code` 为字符串或 null，可选 `description` 保留“ごく浅い”等官方描述（对象数组） |
| `events[].hypocenters[].latitude`, `events[].hypocenters[].longitude` | 十进制度经纬度，未知为 null（数值型 / null） |
| `events[].hypocenters[].depth` | 深度（km，向下为正），未知为 null（数值型 / null） |
| `events[].reports` | 各产品最新状态及仍提供有效字段的报告，不是完整历史档案（对象数组） |
| `events[].reports[].id` | 报告的电文ID（字符串型） |
| `events[].reports[].product` | 产品代码：`VXSE51`、`VXSE52`、`VXSE53`、`VXSE61`、`VXSE62`（字符串型） |
| `events[].reports[].time`, `events[].reports[].issuedAt`, `events[].reports[].targetTime` | 发布时间及可选的发送、对象时间，均为 UTC RFC 3339，未知为 null（字符串型 / null） |
| `events[].reports[].status` | `issued`：发布；`corrected`：订正；`cancelled`：取消。取消作用于对应产品（字符串型） |
| `events[].reports[].originTime`, `events[].reports[].arrivalTime` | 发震时间、检知时间，均为 UTC RFC 3339，不能混用（字符串型 / null，可选） |
| `events[].reports[].hypocenter` | 当前事件 `hypocenters` 的整数索引，`0` 有效（整数型，可选） |
| `events[].reports[].magnitude` | 震级，未知或无法数值化的定性表示为 null（数值型 / null，可选） |
| `events[].reports[].magnitudeType`, `events[].reports[].magnitudeText`, `events[].reports[].magnitudeCondition` | 震级类型（如 `Mj`）、定性描述及状态（字符串型，可选） |
| `events[].reports[].observation` | 本报告的观测，不应把不同产品、不同时间的观测拼成同时刻数据（对象型，可选） |
| `events[].reports[].observation.maxIntensity`, `events[].reports[].observation.maxLongPeriod` | 最大震度、最大长周期地震动阶级；震度保留 `5-`、`5+` 等官方字符串（字符串型，可选） |
| `events[].reports[].observation.prefs` | 都道府县，含 `code`、`name` 及可选 `int`（震度）、`lg`（长周期阶级）等（对象数组，可选） |
| `events[].reports[].observation.areas` | 细分区域，`pref` 为本次观测内 `prefs` 的整数索引，`0` 有效（对象数组，可选） |
| `events[].reports[].observation.cities` | 市町村，`area` 为本次观测内 `areas` 的整数索引，`0` 有效（对象数组，可选） |
| `events[].reports[].observation.areas[].stations`, `events[].reports[].observation.cities[].stations` | 区域、市町村的观测站，含 `code`、`name` 及可选 `int`、`lg`；长周期观测还可含 `sva`（数值/null，cm/s）、`periods`（各周期带的 `period`、`class`、`sva`）（对象数组，可选） |
| `events[].reports[].comments` | 官方说明；可选 `forecast`、`warning`、`note`、`text` 为字符串，`urls` 为字符串数组（对象型，可选） |
| `events[].reports[].text` | 官方正文、取消说明（字符串型，可选） |
| `events[].summary` | 尚无原始电文时的暂定摘要，含 `originTime`、`hypocenter` 索引、`magnitude`、`maxIntensity` 及可选 `magnitudeText`（对象型，可选） |
| `md5` | 标识内容变化的哈希值（字符串型） |

## JMA 海啸情报 JSON API

- 描述: 获取全国海啸警报、预报状态及官方海啸观测报告
- HTTP GET API地址:

```text
https://api.wolfx.jp/jma_tsunami.json
```

- WebSocket API地址:

```text
wss://ws-api.wolfx.jp/jma_tsunami
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `type` | （WebSocket专用）jma_tsunami（字符串型） |
| `status` | `uninitialized`：尚未取得；`unknown`：状态不明，不表示安全；`active`：存在警报、注意报；`forecast_only`：仅预报；`cleared`：官方解除；`expired`：官方期限已过，不等于解除；`none_reported`：官方明确分类为无海啸（字符串型） |
| `reason` | 状态原因，不能单独用于风险判断（字符串型） |
| `trusted` | 是否满足核对当前权威状态后的信任条件；true 不代表没有海啸风险（布尔型） |
| `validUntil` | 可信期限（UTC RFC 3339）。仅当 `trusted=true` 且期限有效非空、当前时刻早于期限时，才处于可信期限内；断线或无新消息时也须由客户端判断失效（字符串型 / null） |
| `report` | 最新全国快照 `VTSE41`，含 `id`、`product`、`time`、`status` 及 `eventIds`（字符串数组）；时间采用 UTC RFC 3339（对象型 / null） |
| `areas` | 官方警报、预报区域，含 `code`、`name`、分类、波信息及观测站；空数组不代表安全（对象数组） |
| `areas[].level` | `major_warning`：大海啸警报；`warning`：海啸警报；`advisory`：注意报；`forecast`：预报；`cleared`：解除；`none`：无海啸（字符串型） |
| `areas[].kind`, `areas[].previousKind` | 官方分类代码、上一分类代码；`previousKind` 可选（字符串型） |
| `areas[].firstWave`, `areas[].maxWave` | 第一波、最大波，含可选 `time`（UTC RFC 3339）、`height`（数值/null，m）、`text` 及状态；“巨大”“高い”“10m超”“以上”是定性或下界表达，不能视为精确实测值（对象型，可选） |
| `areas[].stations` | 区域观测站，含 `code`、`name` 及可选满潮时间 `highTide`、`firstWave`、`maxWave` 等（对象数组，可选） |
| `observations` | 相关 `VTSE51`、`VTSE52` 最新观测报告，各自保留ID、时间及取消状态，不覆盖 `VTSE41` 警报区域（对象数组） |
| `observations[].observed`, `observations[].estimated` | 实测、沿岸推定的区域、观测站及波信息；不同报告的观测时间可能不同（对象数组，可选） |
| `lastKnown` | 不可信时保留的最后已知区域、观测及说明，仅供参考，不是当前有效警报（对象型，可选） |
| `comments` | 官方说明；可选 `forecast`、`warning`、`note`、`text` 为字符串，`urls` 为字符串数组（对象型，可选） |
| `text` | 官方正文（字符串型，可选） |
| `md5` | 内容变化标识，也可能因可信期限续期而变化，不代表 JMA 发布了新警报（字符串型） |

**JSON 响应示例**

以下为海啸情报的 JSON 响应示例，仅供开发者参考和测试，不代表当前实际海啸警报状态。

- [海啸预报](/examples/jma_tsunami/forecast_only.json){external}
- [海啸注意报](/examples/jma_tsunami/advisory.json){external}
- [海啸警报](/examples/jma_tsunami/warning.json){external}
- [大海啸警报](/examples/jma_tsunami/major_warning.json){external}
- [取消](/examples/jma_tsunami/cancelled.json){external}
- [官方解除](/examples/jma_tsunami/cleared.json){external}
- [有效期已过](/examples/jma_tsunami/expired.json){external}
- [包含海啸观测数据](/examples/jma_tsunami/with_observations.json){external}

## JMA 特别地震情报 JSON API

- 描述: 获取南海海槽及北海道、三陆近海相关产品的最新官方报告
- HTTP GET API地址:

```text
https://api.wolfx.jp/jma_special_eq.json
```

- WebSocket API地址:

```text
wss://ws-api.wolfx.jp/jma_special_eq
```

- JSON字段解析(数据类型):

| Field | Description |
| --- | --- |
| `type` | （WebSocket专用）jma_special_eq（字符串型） |
| `reports` | 各产品最新一份，合计最多四份；不是完整历史，报告存在不代表当前警戒仍然有效（对象数组） |
| `reports[].id` | 报告的电文ID（字符串型） |
| `reports[].product` | `VYSE50`：南海海槽地震临时信息；`VYSE51`：南海海槽地震临时信息解说；`VYSE52`：南海海槽地震相关解说信息；`VYSE60`：北海道、三陆近海后续地震注意信息。定期解说不等于临时警戒（字符串型） |
| `reports[].time` | 官方发布时间（UTC RFC 3339）（字符串型 / null） |
| `reports[].status` | `issued`：发布；`corrected`：订正；`cancelled`：取消，保留对应最新报告状态（字符串型） |
| `reports[].eventIds` | 官方关联事件ID（字符串数组） |
| `reports[].kind`, `reports[].code`, `reports[].label`, `reports[].title` | 官方信息类型、信息编号代码及名称、报告标题（字符串型，可选） |
| `reports[].text`, `reports[].notice`, `reports[].next` | 官方正文、取消说明等补充文字、下次发布说明（字符串型，可选） |
| `reports[].appendix` | 根 `appendices` 数组的整数索引，`0` 有效（整数型，可选） |
| `appendices` | 去重后的官方附录（字符串数组） |
| `md5` | 标识内容变化的哈希值（字符串型） |

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
