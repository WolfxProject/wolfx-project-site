---
title: "Wolfx Project"
description: "提供地震、地震预警（EEW）、防灾开放 API 与公共技术服务的公益项目。"
locale: zh
layout: landing
updated: 2026-11-24
---

::hero-section{eyebrow="公共服务 · 防灾技术" title="获取地震预警与实时观测数据" primary-label="API 文档" primary-href="/zh/docs/open-api" secondary-label="查看项目" secondary-href="/zh/projects"}
Wolfx Project 是一个独立公益项目，以地震、地震预警（EEW）和观测数据为核心，面向开发者与公众免费提供实用的开放服务。

#features

- HTTP / WebSocket
- 公开文档
- 无行为追踪
::

## 公共服务

::project-grid
:::project-card{title="Wolfx Open API" eyebrow="数据接口" href="/zh/docs/open-api" image="/images/cards/API.webp" action="查看规范"}
通过 HTTP GET 获取地震信息、地震预警等数据。支持推送的数据源也可通过 WebSocket 订阅。
:::
:::project-card{title="Wolfx Real-time Earthquake Monitoring" eyebrow="地震监测" href="https://bs.wolfx.jp/about.html" image="/images/cards/WREM.webp" action="打开 WREM"}
汇集实时地震观测信息，并提供可供使用的公开模块。
:::
:::project-card{title="Wolfx SeisJS" eyebrow="公众观测" href="https://seis.wolfx.jp/" image="/images/cards/seisJS.webp" action="加入 SeisJS"}
利用移动设备的加速度计记录地面振动，通过 API 共享各测站的观测数据。
:::
:::project-card{title="Seismic Stations Viewer" eyebrow="数据可视化" href="https://ssv.wolfx.jp" image="/images/cards/SSV.webp" action="使用 SSV"}
用于查看 SeisJS 观测信息的公开可视化工具。
:::
:::project-card{title="ACG.kr" eyebrow="网络工具" href="https://acg.kr" image="/images/cards/ACGKR.webp" action="创建短链接"}
基于 YOURLS 的公益网址缩短服务。
:::
:::project-card{title="服务状态" eyebrow="运维信息" href="https://status.wolfx.jp" icon="i-lucide-circle-gauge" action="查看运行状态"}
查看 Wolfx Project 公共服务的运行状态与故障信息。
:::
::

## 开发者文档

::service-links
:::service-link{title="Open API" href="/zh/docs/open-api" icon="i-lucide-braces"}
地震、预警、气象与网络 API
:::
:::service-link{title="WebSocket" href="/zh/docs/websocket" icon="i-lucide-radio-tower"}
连接地址与手动查询规范
:::
:::service-link{title="SeisJS API" href="/zh/docs/seisjs-api" icon="i-lucide-audio-waveform"}
测站数据与字段规范
:::
::

::content-notice{type="warning" title="数据来源与使用提醒"}
Wolfx Project 是独立运营的非官方项目，与任何政府、气象或地震相关机构无关。本站信息仅供参考，不能替代官方地震预警、灾害或疏散信息。发生灾害时，请以有关部门发布的最新信息为准。
::
