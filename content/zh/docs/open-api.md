---
title: "Wolfx Open API 使用指南"
description: "通过 HTTP GET 查询地震、海啸、气象等数据。支持推送的数据源也可通过 WebSocket 订阅。"
locale: zh
layout: docs
updated: 2026-11-25
source: apidoc_zh.html
---
## Wolfx Open API 使用须知

地震信息仅供参考。灾害期间，请以官方发布的最新预警和疏散信息为准。使用 API 前请阅读[服务条款](/zh/legal/terms)和[隐私政策](/zh/legal/privacy)。如有疑问，可联系 [contact@wolfx.jp](mailto:contact@wolfx.jp)。

## WebSocket 订阅指南

订阅地址、过滤参数和手动查询命令见 [WebSocket API 使用指南](/zh/docs/websocket)。

## JMA 紧急地震速报 JSON API

日本气象厅（JMA）发布的紧急地震速报，即日本的地震预警。感谢 [t0729](https://x.com/t0729_) 协助低延迟接收。

**HTTP GET**

```text
https://api.wolfx.jp/jma_eew.json
```

**WebSocket**

```text
wss://ws-api.wolfx.jp/jma_eew
```

| 字段 | 说明 |
| --- | --- |
| `type` | 仅通过 WebSocket 提供，值为 `jma_eew`（字符串型） |
| `Title` | 紧急地震速报的标题（字符串型） |
| `CodeType` | 紧急地震速报的发布类别。使用日本气象厅的“レベル法”仅发布最大预测震度时，取值为 `最大予測震度のみの緊急地震速報`。该字段不代表完整的震源推定方法分类（字符串型） |
| `Issue.Source` | 发布机构（字符串型） |
| `Issue.Status` | 发布状态（字符串型） |
| `EventID` | 紧急地震速报的事件 ID（字符串型） |
| `Serial` | 速报序号（数值型） |
| `AnnouncedTime` | 发布时间（UTC+9）（字符串型） |
| `OriginTime` | 地震发生时间（UTC+9）。采用“レベル法”时，该字段按兼容规则填入地震检测时间，不一定是准确的地震发生时间（字符串型） |
| `Hypocenter` | 震源地（字符串型） |
| `Latitude` | 震源纬度（数值型） |
| `Longitude` | 震源经度（数值型） |
| `Magnitude` | 震级。震级未知时取兼容值 0，采用气象厅定义的假定震源参数（仮定震源要素）时固定为 1.0。两者都不表示实际测得的震级（数值型，推荐使用） |
| `Magunitude` | **已弃用（Deprecated）**。历史拼写，值始终与 `Magnitude` 相同。为兼容旧客户端暂时保留，未来可能移除，请改用 `Magnitude`（数值型）。 |
| `Depth` | 震源深度（km）。采用“レベル法”或假定震源参数时，10 km 为假定深度，未知值也会映射为兼容值 0，不能一概视为实测结果（数值型） |
| `MaxIntensity` | 日本气象厅预测的最大震度，如 `5弱` 或 `6強`。未知时可为 `不明`（字符串型） |
| `Accuracy.Epicenter` | 震中位置的估算精度（字符串型） |
| `Accuracy.Depth` | 震源深度的估算精度（字符串型） |
| `Accuracy.Magnitude` | 震级的估算精度（字符串型） |
| `MaxIntChange.String` | 关于最大震度变化的说明（字符串型） |
| `MaxIntChange.Reason` | 最大震度变更的原因（字符串型） |
| `WarnArea` | 预报及警报对象地区列表（数组） |
| `WarnArea[].Chiiki` | 预报及警报对象地区（字符串型） |
| `WarnArea[].Shindo1` | 该地区预测震度的上限（字符串型） |
| `WarnArea[].Shindo2` | 该地区预测震度的下限，未知时为 `不明`（字符串型） |
| `WarnArea[].Time` | 预计强烈震动到达的时间。采用 PLUM 法时，表示首次预测该震度的时间，并非警报发布时间（UTC+9，`HHMMSS`，未知为 `//////`，字符串型） |
| `WarnArea[].Type` | 该地区的发布类别。原始值为 `予報`（预报）或 `警報`（警报）（字符串型） |
| `WarnArea[].Arrive` | 地区到达预测或 PLUM 类别的说明（字符串型） |
| `isSea` | 是否为海域地震（布尔型） |
| `isTraining` | 是否为演练报（布尔型） |
| `isAssumption` | 是否使用气象厅定义的假定震源参数。仅采用“レベル法”时不会设置此标志。即使取值为 `false`，部分地区仍可能采用 PLUM 法。取消时沿用上一份有效报告的值（布尔型） |
| `isWarn` | 是否为警报（布尔型） |
| `isFinal` | 是否为最终报（布尔型） |
| `isCancel` | 是否为取消报（布尔型） |
| `OriginalText` | 紧急地震速报的电文原文。无法提供时为空字符串（字符串型） |

**JSON 响应示例**

以下样例取自历史速报，供开发和测试使用，不代表当前预警。

- [第一报（预报）](/examples/jma_eew/forecast_first.json){external}
- [续报（预报）](/examples/jma_eew/forecast_update.json){external}
- [最终报](/examples/jma_eew/forecast_final.json){external}
- [紧急地震速报（警报）](/examples/jma_eew/warning.json){external}
- [レベル法（仅发布最大预测震度）](/examples/jma_eew/level_method.json){external}
- [包含 PLUM 法的预报](/examples/jma_eew/plum_forecast.json){external}
- [包含 PLUM 法的警报](/examples/jma_eew/plum_warning.json){external}
- [取消报](/examples/jma_eew/cancelled.json){external}
- [假定震源参数](/examples/jma_eew/assumed_hypocenter.json){external}
- [海域地震](/examples/jma_eew/sea_earthquake.json){external}

## JMA 地震信息 JSON API

获取日本气象厅发布的地震信息，最多包含最近 50 个地震事件。

**HTTP GET**

```text
https://api.wolfx.jp/jma_eqlist.json
```

**WebSocket**

```text
wss://ws-api.wolfx.jp/jma_eqlist
```

| 字段 | 说明 |
| --- | --- |
| `type` | 仅通过 WebSocket 提供，值为 `jma_eqlist`（字符串型） |
| `No(1~50)` | `No1`～`No50` 共 50 个对象，最多容纳 50 个事件，按已知发震时间、事件 ID 降序排列；未使用槽位保留空字符串等兼容值（对象型） |
| `Title` | 各 `NoN` 内的发报标题（字符串型） |
| `EventID` | 各 `NoN` 内的官方事件 ID（字符串型） |
| `time` | 各事件的时间（UTC+9），`YYYY/MM/DD HH:mm`（字符串型） |
| `time_full` | 同一时间的秒级格式 `YYYY/MM/DD HH:mm:ss`（UTC+9，字符串型） |
| `location` | 震源所在地区，未知时为 `震源 調査中`（字符串型） |
| `magnitude` | 震级，含“不明”等既有兼容表示（字符串型） |
| `shindo` | 最大震度，保留 `5-`、`5+`、“不明”等官方表示（字符串型） |
| `depth` | 深度，如 `30km`（字符串型） |
| `latitude` | 保留一位小数的纬度（字符串型） |
| `longitude` | 保留一位小数的经度（字符串型） |
| `info` | 各事件自身的官方 ForecastComment/Text，包含海啸展望等；所有条目均可保留并补全。尚未取得或官方没有说明时为空字符串（字符串型） |
| `md5` | 顶层更新标识。既有实现按实际键顺序将全部 `No1`～`No50` 紧凑序列化为 UTF-8 JSON，对其字节计算 MD5，不含自身（字符串型） |

表中从 `Title` 到 `info` 的字段均位于各 `NoN` 对象内。`time`、`time_full` 不是发布时间：通常表示发震时间，仅有震度速报时可能按兼容规则使用检测时间。列表未公开独立发布时间字段；各报告发布时间请查详情 API 的 `reports[].time`。位置、震度、震级等未知值使用既有兼容表示，不能把 `0km`、`0.0` 等一律视为实测零值。后续仅补全或订正 `info` 也会改变 MD5。

## JMA 地震详情 JSON API

按地震事件查询震源、震度、长周期地震动观测、官方说明和报告状态。

**HTTP GET**

```text
https://api.wolfx.jp/jma_earthquake_detail.json
```

| 字段 | 说明 |
| --- | --- |
| `events` | 最近最多 100 个事件，包括取消事件和独立长周期观测事件；仅提供 HTTP，不支持 WebSocket（对象数组） |
| `events[].eventId` | 官方事件 ID（字符串型） |
| `events[].status` | `preliminary`：仅暂定摘要；`reported`：有有效报告；`cancelled`：保留的产品报告均已取消（字符串型） |
| `events[].completeness` | `pending`：历史补全中；`complete`：可取得的历史已补全；`partial`：部分历史无法恢复。`complete` 不保证所有字段均有值（字符串型） |
| `events[].hypocenters` | 去重后的震源；`name`、`code` 为字符串或 null，可选 `description` 保留“ごく浅い”等官方描述（对象数组） |
| `events[].hypocenters[].latitude`, `events[].hypocenters[].longitude` | 十进制度经纬度，未知为 null（数值型 / null） |
| `events[].hypocenters[].depth` | 深度（km，向下为正），未知为 null（数值型 / null） |
| `events[].reports` | 各产品最新状态及仍提供有效字段的报告，不是完整历史档案（对象数组） |
| `events[].reports[].id` | 报告的电文 ID（字符串型） |
| `events[].reports[].product` | 产品代码：`VXSE51`、`VXSE52`、`VXSE53`、`VXSE61`、`VXSE62`（字符串型） |
| `events[].reports[].time`, `events[].reports[].issuedAt`, `events[].reports[].targetTime` | 发布时间及可选的发送、对象时间，均为 UTC RFC 3339，未知为 null（字符串型 / null） |
| `events[].reports[].status` | `issued`：发布；`corrected`：订正；`cancelled`：取消。取消作用于对应产品（字符串型） |
| `events[].reports[].originTime`, `events[].reports[].arrivalTime` | 发震时间、检测时间，均为 UTC RFC 3339，不能混用（字符串型 / null，可选） |
| `events[].reports[].hypocenter` | 当前事件 `hypocenters` 的整数索引，`0` 有效（整数型，可选） |
| `events[].reports[].magnitude` | 震级，未知或无法数值化的定性表示为 null（数值型 / null，可选） |
| `events[].reports[].magnitudeType`, `events[].reports[].magnitudeText`, `events[].reports[].magnitudeCondition` | 震级类型（如 `Mj`）、定性描述及状态（字符串型，可选） |
| `events[].reports[].observation` | 本报告的观测，不应把不同产品、不同时间的观测拼成同时刻数据（对象型，可选） |
| `events[].reports[].observation.maxIntensity`, `events[].reports[].observation.maxLongPeriod` | 最大震度、最大长周期地震动等级；震度保留 `5-`、`5+` 等官方字符串（字符串型，可选） |
| `events[].reports[].observation.prefs` | 都道府县，含 `code`、`name` 及可选 `int`（震度）、`lg`（长周期地震动等级）等（对象数组，可选） |
| `events[].reports[].observation.areas` | 细分区域，`pref` 为本次观测内 `prefs` 的整数索引，`0` 有效（对象数组，可选） |
| `events[].reports[].observation.cities` | 市町村，`area` 为本次观测内 `areas` 的整数索引，`0` 有效（对象数组，可选） |
| `events[].reports[].observation.areas[].stations`, `events[].reports[].observation.cities[].stations` | 区域、市町村的观测站，含 `code`、`name` 及可选 `int`、`lg`；长周期观测还可含 `sva`（数值/null，cm/s）、`periods`（各周期带的 `period`、`class`、`sva`）（对象数组，可选） |
| `events[].reports[].comments` | 官方说明；可选 `forecast`、`warning`、`note`、`text` 为字符串，`urls` 为字符串数组（对象型，可选） |
| `events[].reports[].text` | 官方正文、取消说明（字符串型，可选） |
| `events[].summary` | 尚无原始电文时的暂定摘要，含 `originTime`、`hypocenter` 索引、`magnitude`、`maxIntensity` 及可选 `magnitudeText`（对象型，可选） |
| `md5` | 标识内容变化的哈希值（字符串型） |

## JMA 海啸信息 JSON API

获取日本全国的海啸警报、注意报、预报状态及官方观测报告。

**HTTP GET**

```text
https://api.wolfx.jp/jma_tsunami.json
```

**WebSocket**

```text
wss://ws-api.wolfx.jp/jma_tsunami
```

| 字段 | 说明 |
| --- | --- |
| `type` | 仅通过 WebSocket 提供，值为 `jma_tsunami`（字符串型） |
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
| `observations` | 相关 `VTSE51`、`VTSE52` 最新观测报告，分别保留各自的 ID、时间及取消状态。`VTSE51` 示例中的 `areas` 属于观测报告，不能覆盖 `VTSE41` 的警报区域（对象数组） |
| `observations[].observed`, `observations[].estimated` | 实测、沿岸推定的区域、观测站及波信息；不同报告的观测时间可能不同（对象数组，可选） |
| `lastKnown` | 不可信时保留的最后已知区域、观测及说明，仅供参考，不是当前有效警报（对象型，可选） |
| `comments` | 官方说明；可选 `forecast`、`warning`、`note`、`text` 为字符串，`urls` 为字符串数组（对象型，可选） |
| `text` | 官方正文（字符串型，可选） |
| `md5` | 内容变化标识，也可能因可信期限续期而变化，不代表 JMA 发布了新警报（字符串型） |

**JSON 响应示例**

以下 JSON 样例供开发和测试使用，不代表当前海啸警报状态。

- [海啸预报](/examples/jma_tsunami/forecast_only.json){external}
- [海啸注意报](/examples/jma_tsunami/advisory.json){external}
- [海啸警报](/examples/jma_tsunami/warning.json){external}
- [大海啸警报](/examples/jma_tsunami/major_warning.json){external}
- [取消](/examples/jma_tsunami/cancelled.json){external}
- [官方解除](/examples/jma_tsunami/cleared.json){external}
- [有效期已过](/examples/jma_tsunami/expired.json){external}
- [包含海啸观测数据](/examples/jma_tsunami/with_observations.json){external}

## JMA 特别地震信息 JSON API

查询南海海槽及北海道、三陆近海的最新官方报告。

**HTTP GET**

```text
https://api.wolfx.jp/jma_special_eq.json
```

**WebSocket**

```text
wss://ws-api.wolfx.jp/jma_special_eq
```

| 字段 | 说明 |
| --- | --- |
| `type` | 仅通过 WebSocket 提供，值为 `jma_special_eq`（字符串型） |
| `reports` | 各产品最新一份，合计最多四份；不是完整历史，报告存在不代表当前警戒仍然有效（对象数组） |
| `reports[].id` | 报告的电文 ID（字符串型） |
| `reports[].product` | `VYSE50`：南海海槽地震临时信息；`VYSE51`：南海海槽地震临时信息解说；`VYSE52`：南海海槽地震相关解说信息；`VYSE60`：北海道、三陆近海后续地震注意信息。定期解说不等于临时警戒（字符串型） |
| `reports[].time` | 官方发布时间（UTC RFC 3339）（字符串型 / null） |
| `reports[].status` | `issued`：发布；`corrected`：订正；`cancelled`：取消，保留对应最新报告状态（字符串型） |
| `reports[].eventIds` | 官方关联事件 ID（字符串数组） |
| `reports[].kind`, `reports[].code`, `reports[].label`, `reports[].title` | 官方信息类型、信息编号代码及名称、报告标题（字符串型，可选） |
| `reports[].text`, `reports[].notice`, `reports[].next` | 官方正文、取消说明等补充文字、下次发布说明（字符串型，可选） |
| `reports[].appendix` | 顶层 `appendices` 数组的整数索引，`0` 有效（整数型，可选） |
| `appendices` | 去重后的官方附录（字符串数组） |
| `md5` | 标识内容变化的哈希值（字符串型） |

## 中国地震台网 地震信息 JSON API

获取中国地震台网发布的最近 50 条地震信息。

**HTTP GET**

```text
https://api.wolfx.jp/cenc_eqlist.json
```

**WebSocket**

```text
wss://ws-api.wolfx.jp/cenc_eqlist
```

| 字段 | 说明 |
| --- | --- |
| `type` | 仅通过 WebSocket 提供，值为 `cenc_eqlist`（字符串型） |
| `No(1~50)` | 按发布时间排列的地震条目，键名从 `No1` 到 `No50`（对象型） |
| `type` | 各 `NoN` 条目的发布类型，取值为 `automatic` 或 `reviewed`（字符串型） |
| `EventID` | 地震事件 ID（字符串型） |
| `ReportTime` | 该条地震信息的报告时间，例如 `2026-11-24 15:45:48`（字符串型） |
| `time` | 发震时间(UTC+8)（字符串型） |
| `location` | 已统一地名格式的震中位置（字符串型） |
| `placeName` | 数据源提供的原始震中地名（字符串型） |
| `magnitude` | 震级（字符串型） |
| `depth` | 震源深度（字符串型） |
| `latitude` | 震源地纬度（字符串型） |
| `longitude` | 震源地经度（字符串型） |
| `intensity` | 最大烈度（字符串型） |
| `md5` | 地震信息更新校验码（字符串型） |

## 四川省地震局 地震预警 JSON API

实时获取四川省地震局发布的地震预警。

**HTTP GET**

```text
https://api.wolfx.jp/sc_eew.json
```

**WebSocket**

```text
wss://ws-api.wolfx.jp/sc_eew
```

| 字段 | 说明 |
| --- | --- |
| `type` | 仅通过 WebSocket 提供，值为 `sc_eew`（字符串型） |
| `ID` | 预警报告 ID（数值型） |
| `EventID` | 地震事件 ID（字符串型） |
| `ReportTime` | 预警发布时间(UTC+8)（字符串型） |
| `ReportNum` | 预警报告序号（数值型） |
| `OriginTime` | 发震时间(UTC+8)（字符串型） |
| `HypoCenter` | 震源地（字符串型） |
| `Latitude` | 震源地纬度（数值型） |
| `Longitude` | 震源地经度（数值型） |
| `Magnitude` | 震级（数值型，推荐使用） |
| `Magunitude` | **已弃用（Deprecated）**。历史拼写，值始终与 `Magnitude` 相同。为兼容旧客户端暂时保留，未来可能移除，请改用 `Magnitude`（数值型）。 |
| `Depth` | 震源深度（数值型或 `null`） |
| `MaxIntensity` | 最大烈度（数值型） |

## 中国地震台网 地震预警 JSON API

实时获取中国地震台网发布的地震预警。

**HTTP GET**

```text
https://api.wolfx.jp/cenc_eew.json
```

**WebSocket**

```text
wss://ws-api.wolfx.jp/cenc_eew
```

| 字段 | 说明 |
| --- | --- |
| `type` | 仅通过 WebSocket 提供，值为 `cenc_eew`（字符串型） |
| `ID` | 预警报告 ID（字符串型） |
| `EventID` | 地震事件 ID（字符串型） |
| `ReportTime` | 预警发布时间(UTC+8)（字符串型） |
| `ReportNum` | 预警报告序号（数值型） |
| `OriginTime` | 发震时间(UTC+8)（字符串型） |
| `HypoCenter` | 震源地（字符串型） |
| `Latitude` | 震源地纬度（数值型） |
| `Longitude` | 震源地经度（数值型） |
| `Magnitude` | 震级（数值型） |
| `Depth` | 震源深度（数值型或 `null`） |
| `MaxIntensity` | 最大烈度（数值型） |

## 福建省地震局 地震预警 JSON API

实时获取福建省地震局发布的地震预警。

**HTTP GET**

```text
https://api.wolfx.jp/fj_eew.json
```

**WebSocket**

```text
wss://ws-api.wolfx.jp/fj_eew
```

| 字段 | 说明 |
| --- | --- |
| `type` | 仅通过 WebSocket 提供，值为 `fj_eew`（字符串型） |
| `ID` | 预警报告 ID（数值型） |
| `EventID` | 地震事件 ID（字符串型） |
| `ReportTime` | 预警发布时间(UTC+8)（字符串型） |
| `ReportNum` | 预警报告序号（数值型） |
| `OriginTime` | 发震时间(UTC+8)（字符串型） |
| `HypoCenter` | 震源地（字符串型） |
| `Latitude` | 震源地纬度（数值型） |
| `Longitude` | 震源地经度（数值型） |
| `Magnitude` | 震级（数值型，推荐使用） |
| `Magunitude` | **已弃用（Deprecated）**。历史拼写，值始终与 `Magnitude` 相同。为兼容旧客户端暂时保留，未来可能移除，请改用 `Magnitude`（数值型）。 |
| `isFinal` | 是否为最终报（布尔型） |

## 重庆市地震局 地震预警 JSON API

实时获取重庆市地震局发布的地震预警。

**HTTP GET**

```text
https://api.wolfx.jp/cq_eew.json
```

**WebSocket**

```text
wss://ws-api.wolfx.jp/cq_eew
```

| 字段 | 说明 |
| --- | --- |
| `type` | 仅通过 WebSocket 提供，值为 `cq_eew`（字符串型） |
| `ID` | 预警报告 ID（字符串型） |
| `EventID` | 地震事件 ID（字符串型） |
| `ReportTime` | 预警发布时间(UTC+8)（字符串型） |
| `ReportNum` | 预警报告序号（数值型） |
| `OriginTime` | 发震时间(UTC+8)（字符串型） |
| `HypoCenter` | 震源地（字符串型） |
| `Latitude` | 震源地纬度（数值型） |
| `Longitude` | 震源地经度（数值型） |
| `Magnitude` | 震级（数值型） |
| `Depth` | 震源深度（数值型或 `null`） |
| `MaxIntensity` | 最大烈度（数值型） |

## CWA 地震预警 JSON API（仅限中国大陆地区）

实时获取中央气象署（CWA）发布的地震预警。

**HTTP GET**

```text
https://api.wolfx.jp/cwa_eew.json
```

| 字段 | 说明 |
| --- | --- |
| `ID` | 预警报告 ID（数值型） |
| `ReportTime` | 预警发布时间(UTC+8)（字符串型） |
| `ReportNum` | 预警报告序号（数值型） |
| `OriginTime` | 发震时间(UTC+8)（字符串型） |
| `HypoCenter` | 震源地（字符串型） |
| `Latitude` | 震源地纬度（数值型） |
| `Longitude` | 震源地经度（数值型） |
| `Magnitude` | 震级（数值型，推荐使用） |
| `Magunitude` | **已弃用（Deprecated）**。历史拼写，值始终与 `Magnitude` 相同。为兼容旧客户端暂时保留，未来可能移除，请改用 `Magnitude`（数值型）。 |
| `Depth` | 震源深度（数值型） |
| `MaxIntensity` | 最大震度，按中央气象署的震度分级表示（字符串型） |

## 中国气象实况排行 JSON API

按小时提供中国国家级气象观测站的气温、降水量和风速排名。

**HTTP GET**

```text
https://api.wolfx.jp/weather_rank.json
```

| 字段 | 说明 |
| --- | --- |
| `YYYYMMDDHH00` | 最近 8 小时的逐小时排名。键名为 UTC+8 的时次，对应的对象包含下列三组排名（对象型） |
| `tempRank` | 全国气温最高的 10 条观测（对象数组） |
| `rainRank` | 全国降水量最大的 10 条观测（对象数组） |
| `windSRank` | 全国风速最大的 10 条观测（对象数组） |
| `md5` | 排行数据更新校验码（字符串型） |

`tempRank`、`rainRank` 和 `windSRank` 的每个条目都包含 `province`、`city` 和 `value`，分别表示省级地区、城市和观测值，三者均为字符串。

## IP 地址信息查询 JSON API

查询请求方或指定 IP 地址的归属地。

**HTTP GET**

```text
https://api.wolfx.jp/geoip.php
```

```text
https://api.wolfx.jp/geoip.php?ip=<IP位址>
```

| 字段 | 说明 |
| --- | --- |
| `ip` | 查询的 IP 地址（字符串型） |
| `country_code` | 国家或地区代码（字符串型） |
| `country_name` | 所在国家或地区（字符串型） |
| `country_name_zh` | 所在国家或地区(中文)（字符串型） |
| `province_code` | 所在省或州代码（字符串型） |
| `province_name` | 所在省或州（字符串型） |
| `province_name_zh` | 所在省或州(中文)（字符串型） |
| `city` | 所在城市（字符串型） |
| `city_zh` | 城市名称（中文）（字符串型） |
| `latitude` | 所在纬度(可能无法获取)（数值型） |
| `longitude` | 所在经度(可能无法获取)（数值型） |

## 服务器时间 JSON API

获取服务器的当前时间，供客户端同步时钟。

**HTTP GET**

```text
https://api.wolfx.jp/ntp.json
```

| 字段 | 说明 |
| --- | --- |
| `JST` | 日本标准时间(UTC+9)（字符串型） |
| `CST` | 中国标准时间(UTC+8)（字符串型） |
| `str` | 当前日期时间（字符串型） |
| `int` | 当前日期时间（数值型） |
| `timestamp` | 当前 Unix 时间戳（数值型） |

## 公网 IP 地址查询（纯文本）

以纯文本返回请求方的公网 IP 地址。

**HTTP GET**

```text
https://api.wolfx.jp/ip.php
```

## 随机动漫图片 API

从 Wolfx 自建图床随机返回一张动漫图片。

**HTTP GET**

```text
https://api.wolfx.jp/img.php
```

```text
https://api.wolfx.jp/img.php?return=<img/json>
```

## API 状态

::api-status-panel{locale="zh"}
::
