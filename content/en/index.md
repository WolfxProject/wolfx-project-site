---
title: "Wolfx Project"
description: "Free public APIs for earthquake early warnings and seismic observations, plus weather and network tools."
locale: en
layout: landing
updated: 2026-11-24
---

::hero-section{eyebrow="EARTHQUAKE MONITORING" title="Earthquake alerts and observations, open to everyone" primary-label="API documentation" primary-href="/en/docs/open-api" secondary-label="Explore projects" secondary-href="/en/projects"}
Wolfx Project is an independent public-interest project. Developers and the public can use its free services to follow earthquakes, receive earthquake early warnings (EEW), and explore station observations.

#features

- HTTP / WebSocket
- Open documentation
- No behavioral tracking
::

## Public services

::project-grid
:::project-card{title="Wolfx Open API" eyebrow="DATA API" href="/en/docs/open-api" image="/images/cards/API.webp" action="Read the specification"}
Get earthquake reports, early warnings, and utility data over HTTP. Subscribe to supported sources over WebSocket.
:::
:::project-card{title="Wolfx Real-time Earthquake Monitoring" eyebrow="MONITORING" href="https://bs.wolfx.jp/about.html" image="/images/cards/WREM.webp" action="Open WREM"}
A monitoring service that aggregates real-time earthquake observations and provides public modules.
:::
:::project-card{title="Wolfx SeisJS" eyebrow="CITIZEN SENSING" href="https://seis.wolfx.jp/" image="/images/cards/seisJS.webp" action="Join SeisJS"}
Record ground motion with a mobile device’s accelerometer. Station observations are available through the public API.
:::
:::project-card{title="Seismic Stations Viewer" eyebrow="SEISMIC VIEWER" href="https://ssv.wolfx.jp" image="/images/cards/SSV.webp" action="Use SSV"}
A public viewer for SeisJS observation data.
:::
:::project-card{title="ACG.kr" eyebrow="UTILITY" href="https://acg.kr" image="/images/cards/ACGKR.webp" action="Shorten a URL"}
A public-interest URL shortening service based on YOURLS.
:::
:::project-card{title="Service Status" eyebrow="OPERATIONS" href="https://status.wolfx.jp" icon="i-lucide-circle-gauge" action="View service status"}
Operational status and incident information for Wolfx Project public services.
:::
::

## Developer documentation

::service-links
:::service-link{title="Open API" href="/en/docs/open-api" icon="i-lucide-braces"}
Earthquake, EEW, weather, and network APIs
:::
:::service-link{title="WebSocket" href="/en/docs/websocket" icon="i-lucide-radio-tower"}
Subscription endpoints and query commands
:::
:::service-link{title="SeisJS API" href="/en/docs/seisjs-api" icon="i-lucide-audio-waveform"}
Station observations and field definitions
:::
::

::content-notice{type="warning" title="About this unofficial project"}
Wolfx Project is an independently operated, unofficial project. It is not affiliated with any government, meteorological, or earthquake-related authority. Information is provided for reference and does not replace official earthquake warnings, disaster information, or evacuation notices. Always verify the latest information from public authorities during an emergency.
::
