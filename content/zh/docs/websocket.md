---
title: "Wolfx WebSocket API 调用说明"
description: "Wolfx WebSocket API 连接地址、all_eew 数据源排除设置、手动查询指令与 JSON 数据说明。"
locale: zh
layout: docs
updated: 2026-11-19
source: wsapi_zh.html
---
## WebSocket 简介

- WebSocket API 在对应业务 JSON 更新时，向订阅该数据源的客户端自动推送相关信息。
- 心跳包机制：服务端将在每分钟和建立连接后发送一个heartbeat心跳包以保持连接，客户端可选回复ping包（推荐）

## 连接及使用规范

- 请尽可能复用连接，避免不必要的重复连接及短时间内反复重连。
- 需要获取多个数据源时，请结合下方连接地址的说明，考虑使用 `all_eew` 聚合频道。

## WebSocket 调用地址

- `all_eew` 聚合订阅可接收多个数据源的更新。

```text
wss://ws-api.wolfx.jp/all_eew
```

如需减少不必要的推送，可通过可选 URL 查询参数 `exclude` 指定要排除的数据源。使用各独立订阅入口 URL 路径中的数据源名称，多个名称用英文逗号（`,`）分隔。

```text
wss://ws-api.wolfx.jp/all_eew?exclude=cenc_eew
wss://ws-api.wolfx.jp/all_eew?exclude=sc_eew,fj_eew,cq_eew
```

`exclude` 在建立连接时指定，仅对该 `all_eew` 连接的自动推送生效。更改排除项需要重新建立连接。指定不存在的数据源名称时，服务端会在 WebSocket 握手阶段返回 `HTTP 400`。

在同一连接中，仍可使用原有手动查询指令获取被排除的公开数据源的缓存 JSON。

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

- JMA 海啸情报 JSON API:

```text
wss://ws-api.wolfx.jp/jma_tsunami
```

- JMA 特别地震情报 JSON API:

```text
wss://ws-api.wolfx.jp/jma_special_eq
```

- JSON字段解析详见：[https://api.wolfx.jp](https://api.wolfx.jp)

## WebSocket 手动查询指令

手动查询可在对应数据源或 `all_eew` 连接中取得该源缓存的 JSON。

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

- JMA 海啸情报 JSON API:

```text
query_jmatsunami
```

- JMA 特别地震情报 JSON API:

```text
query_jmaspecialeq
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
