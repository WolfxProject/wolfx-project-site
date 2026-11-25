---
title: "Wolfx WebSocket API 使用指南"
description: "地震预警、地震和海啸信息的 WebSocket 订阅地址、过滤参数、查询命令和消息格式。"
locale: zh
layout: docs
updated: 2026-11-25
source: wsapi_zh.html
---

## WebSocket 简介

数据源更新时，服务器会推送新的 JSON。连接建立时及之后每分钟，服务器都会发送一次 `heartbeat`。建议客户端回复 `ping`，也可以不回复。

## 连接复用

尽量复用已有连接，避免重复连接同一数据源或在短时间内频繁重连。需要订阅多个数据源时，可以使用聚合频道 `all_eew`。

## 聚合订阅与过滤

```text
wss://ws-api.wolfx.jp/all_eew
```

用可选的 URL 参数 `exclude` 排除不需要的数据源。名称取自各订阅地址的路径，多个名称用英文逗号（`,`）分隔。

```text
wss://ws-api.wolfx.jp/all_eew?exclude=cenc_eew
wss://ws-api.wolfx.jp/all_eew?exclude=sc_eew,fj_eew,cq_eew
```

`exclude` 在建立连接时指定，仅对该 `all_eew` 连接的自动推送生效。更改排除项需要重新建立连接。指定不存在的数据源名称时，服务端会在 WebSocket 握手阶段返回 `HTTP 400`。

被排除的公开数据源仍可手动查询。在同一连接上发送该源的查询命令，即可取得缓存的 JSON。

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
