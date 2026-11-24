---
title: "Wolfx Project"
description: "地震・緊急地震速報（EEW）・防災に関する公開 API とオープンな技術サービスを提供する公益プロジェクト。"
locale: ja
layout: landing
updated: 2026-11-24
---

::hero-section{eyebrow="防災・観測" title="地震情報と観測データを、誰でも使える形で。" primary-label="API ドキュメント" primary-href="/docs/open-api" secondary-label="プロジェクトを見る" secondary-href="/projects"}
Wolfx Project は、地震・緊急地震速報（EEW）・観測データを中心に、開発者と一般利用者へ実用的な公開サービスを無償で提供する独立プロジェクトです。

#features

- HTTP / WebSocket
- ドキュメント公開
- 行動追跡なし
::

## 公開サービス

::project-grid
:::project-card{title="Wolfx Open API" eyebrow="データ API" href="/docs/open-api" image="/images/cards/API.webp" action="仕様を見る"}
地震情報や緊急地震速報などを HTTP GET で取得できます。対応するデータは WebSocket でも購読できます。
:::
:::project-card{title="Wolfx Real-time Earthquake Monitoring" eyebrow="地震観測" href="https://bs.wolfx.jp/about.html" image="/images/cards/WREM.webp" action="WREM を開く"}
リアルタイムの地震観測情報を集約し、公開モジュールを提供します。
:::
:::project-card{title="Wolfx SeisJS" eyebrow="市民観測" href="https://seis.wolfx.jp/" image="/images/cards/seisJS.webp" action="SeisJS に参加"}
モバイル端末の加速度計を利用した地震観測プロジェクト。各観測点のデータを API で公開しています。
:::
:::project-card{title="Seismic Stations Viewer" eyebrow="可視化" href="https://ssv.wolfx.jp" image="/images/cards/SSV.webp" action="SSV を使う"}
SeisJS の観測情報を確認するための公開ビューアーです。
:::
:::project-card{title="ACG.kr" eyebrow="ネットワークツール" href="https://acg.kr" image="/images/cards/ACGKR.webp" action="短縮 URL を作る"}
YOURLS を基盤にした公益 URL 短縮サービスです。
:::
:::project-card{title="サービスの稼働状況" eyebrow="運用情報" href="https://status.wolfx.jp" icon="i-lucide-circle-gauge" action="稼働状況を見る"}
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
