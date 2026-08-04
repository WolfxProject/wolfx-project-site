---
title: "Wolfx Project"
description: "地震・緊急地震速報（EEW）・防災に関する公開 API とオープンな技術サービスを提供する公益プロジェクト。"
locale: ja
layout: landing
updated: 2026-08-04
---

::hero-section{eyebrow="PUBLIC INTEREST · DISASTER READINESS" title="静かな技術で、確かな情報経路を。" primary-label="API ドキュメント" primary-href="/docs/open-api" secondary-label="プロジェクトを見る" secondary-href="/projects"}
Wolfx Project は、地震・緊急地震速報（EEW）・観測データを中心に、開発者と一般利用者へ実用的な公開サービスを無償で提供する独立プロジェクトです。
::

## 公開サービス

::project-grid
:::project-card{title="Wolfx Open API" eyebrow="DATA API" href="/docs/open-api" image="/images/API.png" action="仕様を見る"}
地震・EEW と実用データを JSON で提供する公開 API。HTTP GET と WebSocket に対応します。
:::
:::project-card{title="Real-time Earthquake Monitoring" eyebrow="MONITORING" href="https://bs.wolfx.jp/about.html" image="/images/WREM.png" action="WREM を開く"}
リアルタイムの地震観測情報を集約し、公開モジュールとともに提供する監視サービスです。
:::
:::project-card{title="Wolfx SeisJS" eyebrow="CITIZEN SENSING" href="https://wolfx.jp/seisjs" image="/images/seisJS.png" action="SeisJS に参加"}
モバイル端末の加速度計を利用した地震観測プロジェクト。ネットワーク化した観測データを公開 API で提供します。
:::
:::project-card{title="Seismic Stations Viewer" eyebrow="SEISMIC VIEWER" href="https://ssv.wolfx.jp" image="/images/SSV.png" action="SSV を使う"}
SeisJS の観測情報を確認するための公開ビューアーです。
:::
:::project-card{title="ACG.kr" eyebrow="UTILITY" href="https://acg.kr" image="/images/ACGKR.png" action="短縮 URL を作る"}
YOURLS を基盤にした公益 URL 短縮サービスです。
:::
:::project-card{title="Service Status" eyebrow="OPERATIONS" href="https://status.wolfx.jp" icon="i-lucide-circle-gauge" action="稼働状況を見る"}
Wolfx Project の公開サービスの稼働状況と障害情報を確認できます。
:::
::

## 開発者向けドキュメント

::service-links
:::service-link{title="Open API" href="/docs/open-api" icon="i-lucide-braces"}
地震・EEW・気象・ネットワーク API
:::
:::service-link{title="WebSocket" href="/docs/websocket" icon="i-lucide-radio-tower"}
接続先と手動クエリ仕様
:::
:::service-link{title="SeisJS API" href="/docs/seisjs-api" icon="i-lucide-audio-waveform"}
観測点データとフィールド仕様
:::
::

::content-notice{type="warning" title="非公式プロジェクトについて"}
Wolfx Project は、政府機関、気象機関、地震関連機関とは関係のない独立した非公式プロジェクトです。掲載情報は参考目的であり、公式の緊急地震速報、災害情報、避難情報を代替しません。災害時は必ず公的機関の最新情報をご確認ください。
::
