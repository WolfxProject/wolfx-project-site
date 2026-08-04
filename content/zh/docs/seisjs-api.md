---
title: "Wolfx SeisJS API 调用说明"
description: "SeisJS 测站、WebSocket 连接与观测数据字段说明。"
locale: zh
layout: docs
updated: 2025-07-04
version: v20250704
source: seisapi_zh.html
---
## 简介

- 单个测站数据推送间隔: 1秒
- 震度计算标准: 日本气象厅震度标准
- 烈度计算标准: 中国地震烈度标准(参考GB/T 17742-2020)
- 说明：本API以WebSocket的形式提供来自SeisJS测站的实时资料
- 心跳包机制：服务端将在每分钟和建立连接后发送一个heartbeat心跳包以保持连接，客户端可选回复ping包（推荐）
- 免责声明：本API仅提供来自SeisJS的测站资料，仅供合法研究和开发使用，不可用于其他用途

## 提供测站列表

- 测站列表JSON地址: [https://api.wolfx.jp/seis\_list.json](https://api.wolfx.jp/seis_list.json)
- 注意: 若要进行程序开发，建议使用该测站列表API来获取测站状态信息，以实现测站云控功能，列表每10分钟更新一次

## WebSocket 调用地址

- 接收来自所有测站的 JSON API 推送:

```text
wss://seisjs.wolfx.jp/all_seis
```

## JSON 字段解析(数据类型)

| Field | Description |
| --- | --- |
| `type` | 测站UUID(字符串型) |
| `region` | 测站所在位置(字符串型) |
| `latitude` | 测站所在纬度(数值型) |
| `longitude` | 测站所在经度(数值型) |
| `version` | 测站运行SeisJS版本(数值型) |
| `PGA` | 合成峰值地面加速度(cm/s²)(数值型) |
| `PGV` | 合成峰值地面速度(cm/s)(数值型) |
| `PGD` | 合成峰值地面位移(cm)(数值型) |
| `PGA_EW` | 东西向峰值地面加速度(cm/s²)(数值型) |
| `PGV_EW` | 东西向峰值地面速度(cm/s)(数值型) |
| `PGD_EW` | 东西向峰值地面位移(cm)(数值型) |
| `PGA_NS` | 南北向峰值地面加速度(cm/s²)(数值型) |
| `PGV_NS` | 南北向峰值地面速度(cm/s)(数值型) |
| `PGD_NS` | 南北向峰值地面位移(cm)(数值型) |
| `PGA_UD` | 垂直向峰值地面加速度(cm/s²)(数值型) |
| `PGV_UD` | 垂直向峰值地面速度(cm/s)(数值型) |
| `PGD_UD` | 垂直向峰值地面位移(cm)(数值型) |
| `Max_PGA` | 2分内最大合成PGA(cm/s²)(数值型) |
| `Max_PGV` | 2分内最大合成PGV(cm/s)(数值型) |
| `Max_PGD` | 2分内最大合成PGD(cm)(数值型) |
| `Max_PGA_EW` | 2分内最大东西向PGA(cm/s²)(数值型) |
| `Max_PGV_EW` | 2分内最大东西向PGV(cm/s)(数值型) |
| `Max_PGD_EW` | 2分内最大东西向PGD(cm)(数值型) |
| `Max_PGA_NS` | 2分内最大南北向PGA(cm/s²)(数值型) |
| `Max_PGV_NS` | 2分内最大南北向PGV(cm/s)(数值型) |
| `Max_PGD_NS` | 2分内最大南北向PGD(cm)(数值型) |
| `Max_PGA_UD` | 2分内最大垂直向PGA(cm/s²)(数值型) |
| `Max_PGV_UD` | 2分内最大垂直向PGV(cm/s)(数值型) |
| `Max_PGD_UD` | 2分内最大垂直向PGD(cm)(数值型) |
| `Shindo` | 合成JMA震度(字符串型) |
| `Max_Shindo` | 2分内最大合成JMA震度(字符串型) |
| `CalcShindo` | 合成JMA计测震度(数值型) |
| `Max_CalcShindo` | 2分内最大合成JMA计测震度(数值型) |
| `Intensity` | 合成CSIS烈度(数值型) |
| `Max_Intensity` | 2分内最大合成CSIS烈度(数值型) |
| `LPGM` | 长周期地震动阶级(数值型) |
| `Max_LPGM` | 2分内最大长周期地震动阶级(数值型) |
| `Sva30` | 加速度反应谱值(数值型) |
| `Max_Sva30` | 2分内最大加速度反应谱值(数值型) |
| `error_code` | 测站端错误代码(数值型数组) |
| `reverse` | 保留字段，供服务端校验使用(字符串型) |
| `is_desktop` | 是否为桌面端(布尔型) |
| `High_Precision` | 是否为高精度测站(布尔型) |
| `update_at` | 数据更新时间(字符串型) |
| `create_at` | JSON生成时间(字符串型) |

## WebSocket 手动查询指令

- Ping:

```text
ping
```

## WebSocket JSON 资料说明

- 共有JSON字段解析:

| Field | Description |
| --- | --- |
| `type` | 资料类型/测站UUID(字符串型) |

- WebSocket 心跳包JSON字段解析:

| Field | Description |
| --- | --- |
| `type` | heartbeat(字符串型) |
| `ver` | 服务端版本号(数值型) |
| `id` | 客户端连接唯一ID(字符串型) |
| `timestamp` | 心跳包发送毫秒级时间戳(字符串型) |

- WebSocket Pong包JSON字段解析:

| Field | Description |
| --- | --- |
| `type` | pong(字符串型) |
| `timestamp` | Pong包发送毫秒级时间戳(字符串型) |

## API文档版本: v20250704
