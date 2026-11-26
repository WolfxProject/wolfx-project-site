---
title: "Wolfx Project"
description: "Wolfx Project 的地震预警和地震信息 API、SeisJS 测站数据，以及气象和网络工具。"
locale: zh
layout: landing
updated: 2026-11-26
---

::hero-section{title="Wolfx Project" primary-label="API 文档" primary-href="/zh/docs/open-api" secondary-label="查看项目" secondary-href="/zh/projects"}
Wolfx Project 免费提供地震数据 API。
::

## 公共服务

::project-grid
:::project-card{title="Wolfx Open API" href="/zh/docs/open-api" image="/images/cards/API.webp" action="查看 API 文档"}
通过 HTTP GET 查询地震信息和预警，部分数据源支持 WebSocket 订阅。
:::
:::project-card{title="Wolfx Real-time Earthquake Monitoring" href="https://bs.wolfx.jp/about.html" image="/images/cards/WREM.webp" action="了解 WREM"}
在同一页面查看中日两地的地震目录和测站波形。
:::
:::project-card{title="Wolfx SeisJS" href="https://seis.wolfx.jp/" image="/images/cards/seisJS.webp" action="参与观测"}
用移动设备的加速度计记录地面振动，通过 API 共享测站数据。
:::
:::project-card{title="Seismic Stations Viewer" href="https://ssv.wolfx.jp" image="/images/cards/SSV.webp" action="打开测站查看器"}
查看 SeisJS 各测站记录的振动波形。
:::
:::project-card{title="ACG.kr" href="https://acg.kr" image="/images/cards/ACGKR.webp" action="创建短链接"}
基于 YOURLS 的短链接服务。
:::
:::project-card{title="服务状态" href="https://status.wolfx.jp" icon="i-lucide-circle-gauge" action="查看服务状态"}
各项服务的运行情况和故障记录。
:::
::

## 开发者文档

::service-links
:::service-link{title="Open API" href="/zh/docs/open-api" icon="i-lucide-braces"}
地震、气象、IP 归属地和服务器时间
:::
:::service-link{title="WebSocket" href="/zh/docs/websocket" icon="i-lucide-radio-tower"}
订阅地址、过滤参数和查询命令
:::
::
