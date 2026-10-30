---
title: "Wolfx WebSocket API 调用说明"
description: "Wolfx WebSocket API 连接地址、手动查询指令与 JSON 数据说明。"
locale: zh
layout: docs
updated: 2026-10-30
version: v20260415
source: wsapi_zh.html
---
## WebSocket 简介

- WebSocket API 将在服务端收到EEW后自动向所有客户端推送相关信息
- 心跳包机制：服务端将在每分钟和建立连接后发送一个heartbeat心跳包以保持连接，客户端可选回复ping包（推荐）

## 连接及使用规范

- 原则上，同一个客户端同时只应向 Wolfx Project 的 EEW WebSocket 服务保持一条有效连接。避免因多个 UI 组件等原因建立不必要的重复连接，并尽可能复用已有连接。
- 应合理管理断线重连，避免无必要的反复连接和资源浪费。正常连接切换时短暂的新旧连接重叠，本身不被视为恶意重复连接。这是客户端合理使用要求，不表示服务端已实现精确限制为一条连接的强制机制。
- 如需同时获取多个 EEW 数据源，可根据实际需求及下方连接地址说明，优先考虑现有 `all_eew` 聚合频道；此说明不保证覆盖未经确认的数据。
- 禁止未经许可的数据再分发、向第三方再提供及公开独立数据 API。其他使用条件以[服务条款](/zh/legal/terms)及相应专项说明为准。

## WebSocket 调用地址

- 接收所有 JSON API 推送:

```text
wss://ws-api.wolfx.jp/all_eew
```

- 四川省地震局 地震预警 JSON API:

```text
wss://ws-api.wolfx.jp/sc_eew
```

- JMA 緊急地震速報 JSON API:

```text
wss://ws-api.wolfx.jp/jma_eew
```

- 福建省地震局 地震预警 JSON API:

```text
wss://ws-api.wolfx.jp/fj_eew
```

- 重庆市地震局 地震预警 JSON API:

```text
wss://ws-api.wolfx.jp/cq_eew
```

- 中国地震台网 地震预警 JSON API:

```text
wss://ws-api.wolfx.jp/cenc_eew
```

- 中国地震台网 地震信息 JSON API:

```text
wss://ws-api.wolfx.jp/cenc_eqlist
```

- JMA 地震情報 JSON API:

```text
wss://ws-api.wolfx.jp/jma_eqlist
```

- JSON字段解析详见：[https://api.wolfx.jp](https://api.wolfx.jp)

## WebSocket 手动查询指令

- Ping:

```text
ping
```

- 四川省地震局 地震预警 JSON:

```text
query_sceew
```

- JMA 緊急地震速報 JSON:

```text
query_jmaeew
```

- 福建省地震局 地震预警 JSON:

```text
query_fjeew
```

- 重庆市地震局 地震预警 JSON:

```text
query_cqeew
```

- 中国地震台网 地震预警 JSON:

```text
query_cenceew
```

- 中国地震台网 地震信息 JSON:

```text
query_cenceqlist
```

- JMA 地震情報 JSON:

```text
query_jmaeqlist
```

## WebSocket JSON 资料说明

- 共有JSON字段解析:

| Field | Description |
| --- | --- |
| `type` | 资料类型/提供源(对应值详见API主页)(字符串型) |

- WebSocket 心跳包JSON字段解析:

| Field | Description |
| --- | --- |
| `type` | heartbeat(字符串型) |
| `ver` | 服务端版本号(数值型) |
| `id` | 客户端连接UUID(字符串型) |
| `timestamp` | 心跳包发送毫秒级时间戳(字符串型) |

- WebSocket Pong包JSON字段解析:

| Field | Description |
| --- | --- |
| `type` | pong(字符串型) |
| `timestamp` | Pong包发送毫秒级时间戳(字符串型) |

## Doc version: v20260415
