---
title: "Wolfx Project"
description: "Wolfx Project の地震情報・緊急地震速報 API、SeisJS の観測データ、気象・ネットワーク関連のツール。"
locale: ja
layout: landing
updated: 2026-11-26
---

::hero-section{title="Wolfx Project" primary-label="API ドキュメント" primary-href="/docs/open-api" secondary-label="プロジェクトを見る" secondary-href="/projects"}
Wolfx Project は地震情報を API で無料配信しています。
::

## 公開サービス

::project-grid
:::project-card{title="Wolfx Open API" href="/docs/open-api" image="/images/cards/API.webp" action="API 仕様を見る"}
地震情報や緊急地震速報を HTTP GET で取得できます。一部のデータは WebSocket でも配信しています。
:::
:::project-card{title="Wolfx Real-time Earthquake Monitoring" href="https://bs.wolfx.jp/about.html" image="/images/cards/WREM.webp" action="WREM について"}
日本と中国の地震情報を、観測点の波形とあわせて表示します。
:::
:::project-card{title="Wolfx SeisJS" href="https://seis.wolfx.jp/" image="/images/cards/seisJS.webp" action="観測に参加する"}
スマートフォンの加速度計で地面の揺れを記録し、各観測点のデータを API で共有します。
:::
:::project-card{title="Seismic Stations Viewer" href="https://ssv.wolfx.jp" image="/images/cards/SSV.webp" action="ビューアーを開く"}
SeisJS の観測点ごとに、観測値や波形を見られます。
:::
:::project-card{title="ACG.kr" href="https://acg.kr" image="/images/cards/ACGKR.webp" action="短縮 URL を作る"}
YOURLS を使った短縮 URL サービスです。
:::
:::project-card{title="サービスの稼働状況" href="https://status.wolfx.jp" icon="i-lucide-circle-gauge" action="稼働状況を見る"}
サービスごとの稼働状況と障害情報を掲載しています。
:::
::

## 開発者向けドキュメント

::service-links
:::service-link{title="Open API" href="/docs/open-api" icon="i-lucide-braces"}
地震・気象情報、IP アドレス、サーバー時刻
:::
:::service-link{title="WebSocket" href="/docs/websocket" icon="i-lucide-radio-tower"}
接続先、配信の絞り込み、クエリコマンド
:::
::
