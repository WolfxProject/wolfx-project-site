---
title: "Wolfx SeisJS API 使用指南"
description: "SeisJS 测站列表、WebSocket 接入方式，以及震度、烈度和地面运动观测值的单位。"
locale: zh
layout: docs
updated: 2026-11-25
source: seisapi_zh.html
---

## 简介

每个 SeisJS 测站每秒通过 WebSocket 推送一次观测数据。

震度采用日本气象厅震度分级，烈度参考《中国地震烈度表》（GB/T 17742-2020）计算。

连接建立时及之后每分钟，服务器都会发送一次 `heartbeat`。建议客户端回复 `ping`，也可以不回复。

**使用限制**　本 API 仅提供 SeisJS 测站数据，限用于合法研究和开发，禁止用于其他目的。

## 测站列表

[测站列表（JSON）](https://api.wolfx.jp/seis_list.json)

列表每 10 分钟更新一次，可用于查询状态和远程管理测站。

## WebSocket 连接地址

通过一个连接即可接收所有测站的 JSON 数据。

```text
wss://seisjs.wolfx.jp/all_seis
```

## 观测数据字段

| 字段 | 说明 |
| --- | --- |
| `type` | 测站 UUID（字符串型） |
| `region` | 测站所在位置（字符串型） |
| `latitude` | 测站纬度（数值型） |
| `longitude` | 测站经度（数值型） |
| `version` | 测站运行的 SeisJS 版本（数值型） |
| `PGA` | 合成峰值地面加速度（cm/s²）（数值型） |
| `PGV` | 合成峰值地面速度（cm/s）（数值型） |
| `PGD` | 合成峰值地面位移（cm）（数值型） |
| `PGA_EW` | 东西向峰值地面加速度（cm/s²）（数值型） |
| `PGV_EW` | 东西向峰值地面速度（cm/s）（数值型） |
| `PGD_EW` | 东西向峰值地面位移（cm）（数值型） |
| `PGA_NS` | 南北向峰值地面加速度（cm/s²）（数值型） |
| `PGV_NS` | 南北向峰值地面速度（cm/s）（数值型） |
| `PGD_NS` | 南北向峰值地面位移（cm）（数值型） |
| `PGA_UD` | 竖直向峰值地面加速度（cm/s²）（数值型） |
| `PGV_UD` | 竖直向峰值地面速度（cm/s）（数值型） |
| `PGD_UD` | 竖直向峰值地面位移（cm）（数值型） |
| `Max_PGA` | 最近 2 分钟内的最大合成 PGA（cm/s²）（数值型） |
| `Max_PGV` | 最近 2 分钟内的最大合成 PGV（cm/s）（数值型） |
| `Max_PGD` | 最近 2 分钟内的最大合成 PGD（cm）（数值型） |
| `Max_PGA_EW` | 最近 2 分钟内的最大东西向 PGA（cm/s²）（数值型） |
| `Max_PGV_EW` | 最近 2 分钟内的最大东西向 PGV（cm/s）（数值型） |
| `Max_PGD_EW` | 最近 2 分钟内的最大东西向 PGD（cm）（数值型） |
| `Max_PGA_NS` | 最近 2 分钟内的最大南北向 PGA（cm/s²）（数值型） |
| `Max_PGV_NS` | 最近 2 分钟内的最大南北向 PGV（cm/s）（数值型） |
| `Max_PGD_NS` | 最近 2 分钟内的最大南北向 PGD（cm）（数值型） |
| `Max_PGA_UD` | 最近 2 分钟内的最大竖直向 PGA（cm/s²）（数值型） |
| `Max_PGV_UD` | 最近 2 分钟内的最大竖直向 PGV（cm/s）（数值型） |
| `Max_PGD_UD` | 最近 2 分钟内的最大竖直向 PGD（cm）（数值型） |
| `Shindo` | 合成分量计算的日本气象厅震度（字符串型） |
| `Max_Shindo` | 最近 2 分钟内的最大日本气象厅震度（字符串型） |
| `CalcShindo` | 合成分量计算的日本气象厅计测震度（数值型） |
| `Max_CalcShindo` | 最近 2 分钟内的最大日本气象厅计测震度（数值型） |
| `Intensity` | 合成分量计算的中国地震烈度（CSIS）（数值型） |
| `Max_Intensity` | 最近 2 分钟内的最大烈度（CSIS）（数值型） |
| `LPGM` | 长周期地震动等级（数值型） |
| `Max_LPGM` | 最近 2 分钟内的最大长周期地震动等级（数值型） |
| `Sva30` | 水平地震动的绝对速度反应谱最大值。在自振周期 1.6～7.8 秒、阻尼比 5% 的条件下，取最近 30 秒内的最大值（cm/s，数值型） |
| `Max_Sva30` | 最近 2 分钟内记录的 `Sva30` 最大值（cm/s，数值型） |
| `error_code` | 测站端错误代码（数值型数组） |
| `reverse` | 保留字段，供服务端校验使用（字符串型） |
| `is_desktop` | 是否为桌面端（布尔型） |
| `High_Precision` | 是否为高精度测站（布尔型） |
| `update_at` | 数据更新时间（字符串型） |
| `create_at` | JSON 生成时间（字符串型） |

## WebSocket 手动查询命令

```text
ping
```

## WebSocket 消息格式

### 通用字段

| 字段 | 说明 |
| --- | --- |
| `type` | 消息类型或测站 UUID（字符串型） |

### 心跳消息（`heartbeat`）

| 字段 | 说明 |
| --- | --- |
| `type` | `heartbeat`（字符串型） |
| `ver` | 服务端版本号（数值型） |
| `id` | 本次连接的唯一 ID（字符串型） |
| `timestamp` | 发送时间戳（毫秒）（字符串型） |

### ping 响应（`pong`）

| 字段 | 说明 |
| --- | --- |
| `type` | `pong`（字符串型） |
| `timestamp` | 发送时间戳（毫秒）（字符串型） |
