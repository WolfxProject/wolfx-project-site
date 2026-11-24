---
title: "Wolfx WebSocket API 使用指南"
description: "订阅地震预警、地震和海啸信息。包含各数据源的连接地址、all_eew 过滤参数、手动查询命令和消息格式。"
locale: zh
layout: docs
updated: 2026-11-24
source: wsapi_zh.html
---

## WebSocket 简介

订阅的数据源更新时，服务器会推送最新的 JSON 数据。服务器在连接建立后以及此后每分钟发送一次 `heartbeat` 心跳消息。建议客户端回复 `ping`，此操作可选。

## 连接复用

尽量复用已有连接，避免重复连接同一数据源或在短时间内频繁重连。需要订阅多个数据源时，可以使用聚合频道 `all_eew`。

## 聚合订阅与过滤

通过以下地址可同时订阅多个数据源。

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

## 单独订阅与手动查询

连接下表中的单个数据源即可接收该源的更新。向对应连接或 `all_eew` 发送查询命令，可获取该数据源缓存的 JSON 数据。

| 数据源 | 单独订阅地址 | 查询命令 |
| --- | --- | --- |
| 四川省地震局地震预警 | `wss://ws-api.wolfx.jp/sc_eew` | `query_sceew` |
| 日本气象厅紧急地震速报 | `wss://ws-api.wolfx.jp/jma_eew` | `query_jmaeew` |
| 福建省地震局地震预警 | `wss://ws-api.wolfx.jp/fj_eew` | `query_fjeew` |
| 重庆市地震局地震预警 | `wss://ws-api.wolfx.jp/cq_eew` | `query_cqeew` |
| 中国地震台网地震预警 | `wss://ws-api.wolfx.jp/cenc_eew` | `query_cenceew` |
| 中国地震台网地震信息 | `wss://ws-api.wolfx.jp/cenc_eqlist` | `query_cenceqlist` |
| 日本气象厅地震信息 | `wss://ws-api.wolfx.jp/jma_eqlist` | `query_jmaeqlist` |
| 日本气象厅海啸信息 | `wss://ws-api.wolfx.jp/jma_tsunami` | `query_jmatsunami` |
| 日本气象厅南海海槽及北海道、三陆近海相关信息 | `wss://ws-api.wolfx.jp/jma_special_eq` | `query_jmaspecialeq` |

各数据源的 JSON 字段见 [Open API 文档](/zh/docs/open-api)和 [API 首页](https://api.wolfx.jp)。

连接检测命令

```text
ping
```

## WebSocket 消息格式

### 通用字段

| 字段 | 说明 |
| --- | --- |
| `type` | 数据类型或数据来源（字符串型） |

### 心跳消息 (`heartbeat`)

| 字段 | 说明 |
| --- | --- |
| `type` | `heartbeat`（字符串型） |
| `ver` | 服务端版本号（数值型） |
| `id` | 本次连接的 UUID（字符串型） |
| `timestamp` | 发送时间戳（毫秒，字符串型） |

### ping 响应 (`pong`)

| 字段 | 说明 |
| --- | --- |
| `type` | `pong`（字符串型） |
| `timestamp` | 发送时间戳（毫秒，字符串型） |
