---
title: "Wolfx Project Privacy Policy"
description: "How Wolfx Project handles information across its public services."
locale: en
layout: legal
updated: 2026-08-21
source: privacy_policy_en.html
---
Wolfx Project (the “Project”) is an independently operated, unofficial project. This Policy explains how the Project handles information when providing its websites, public APIs, WebSocket services, earthquake and earthquake early warning information, SeisJS, network diagnostics, and other services (the “Services”).

## 1. Scope

This Policy applies to information received or handled by the Project through the Services. Third-party websites, applications, and services are governed by their own privacy policies.

## 2. Information We Handle

- **Access and communications information**: IP address, request time, path and method, HTTP request headers, User-Agent, Referrer, response status, API and WebSocket request and connection metadata, and error, security, and access logs.
- **Information provided by users**: content and contact details expressly submitted through email inquiries or other means.
- **SeisJS information**: location or region, device-motion, accelerometer and other sensor data, a UUID used to identify a device or installation, settings, and connection information when the user enables the relevant feature and grants the necessary device permission.
- **Network diagnostic information**: IP addresses, connection results, response times, and other technical information generated when a user runs an IP check, WebRTC/STUN, Ping, or another network test.

Request content may be processed by a server to generate a response and complete a communication, but this does not mean that all processed content is retained. Some settings, UUIDs, region information, and other information may be stored only on the user’s device. Some features cause the user’s browser or client to connect directly to a third-party service.

## 3. Purposes of Use

- To provide the websites, APIs, WebSocket services, SeisJS, and other features, and to transmit earthquake information and other responses;
- To control access, protect security, prevent abuse, investigate faults, and restore service;
- To measure performance, stability, and service use, and to maintain and improve the Services;
- To operate location, map, IP check, or network diagnostic features that the user chooses to enable; and
- To respond to inquiries and comply with obligations under applicable law.

Where applicable law requires consent, the Project will obtain the necessary consent or request the relevant device permission.

## 4. Storage Location and Processing Outside Japan

User data and service data for which the Project itself determines and manages the storage location are stored on servers in Japan. The Project does not currently use servers outside Japan as a permanent or primary storage location for such data.

This statement does not apply to information stored in localStorage or other storage on a user’s device, or to information processed or retained by a third party in its own systems. It also does not mean that network communications never transit outside Japan or that third parties never perform technical processing or retain their own logs outside Japan. In particular, Cloudflare’s network delivery and security processing, and logs retained independently by Cloudflare, are distinct from data stored in Japan by the Project itself.

## 5. Retention

The Project retains information only for as long as necessary for the purposes described in this Policy. The applicable period depends on the type of information, service and security needs, technical constraints, and obligations under applicable law. Ordinary access logs, API or WebSocket logs, security incident records, backups, and information that must be retained by law may have different retention periods. When information is no longer needed, the Project will delete or anonymize it using reasonable methods. Logs retained independently by third parties are subject to their own retention practices.

## 6. Third-Party Services and External Transmissions

The Services may use the following third-party services or categories of services:

- **Cloudflare**: DNS, content delivery, reverse proxy, security, and network error reporting. Depending on the deployment environment, this website distributes static files through Workers Assets and uses a Worker for permanent redirects from legacy URLs. During communications, Cloudflare may receive IP addresses, HTTP headers, User-Agent, Referrer, cookies or identifiers, and communications and error information, and may independently process access and security logs. Retention depends on Cloudflare-side settings, contracts, and applicable policies, so this Policy does not promise a fixed number of days.
- **STUN/WebRTC services**: when a user runs an IP check or network diagnostic, the browser may connect directly to configured STUN services operated by Cloudflare, Google, MiWiFi, or Bilibili and send network-address and connection information.
- **Third-party reverse-geocoding services**: only when a user uses the relevant location or reverse-geocoding feature, SeisJS uses BigDataCloud as the primary reverse-geocoding service for Browser GPS and uses GeoNames as a fallback for GPS location and to reverse-geocode manually entered or stored coordinates. These services may receive precise latitude and longitude, a language parameter, and ordinary network-connection metadata such as the IP address and HTTP headers. Each third party's processing of information is also governed by its own privacy policy.
- **WolfxMC server status**: when a user visits the WolfxMC home page, the browser sends a request directly to mcapi.us to obtain current availability and the online-player count. As a result, mcapi.us may receive the user's IP address, HTTP headers, and other ordinary request metadata. Information processed by mcapi.us is subject to that service's own practices.
- **Ping and network test endpoints**: network test pages may cause the browser to send requests directly to configured third-party endpoints in or outside Japan. Those endpoints may receive IP addresses, HTTP headers, and test-related information.
- **External links**: Service Status, GitHub, Donate, and other external links connect to their destinations only when a user chooses to open them. After leaving this website, the destination processes information under its own privacy policy.

On initial page load, this website does not automatically request Google Fonts or jsDelivr, does not use Bootstrap, jQuery, analytics or behavioral-tracking scripts, and does not load advertising or promotional iframes. Site search queries a build-time static index in the browser and does not send search terms to an external search provider or a Project search API.

A direct browser connection does not necessarily constitute the Project providing its stored personal data to a third party. However, the third party may process technical information generated by the connection under its own policy and may process or retain that information outside Japan.

## 7. Cookies and Local Storage

This website uses localStorage to save the theme setting as `wolfx-color-mode` and the language choice as `wolfx-locale`; language-specific pages are identified by their URLs. Search terms and results are not written to localStorage and do not persist across a page reload. This website’s code does not set cookies and does not use cookies or web beacons for advertising or behavioral tracking.

SeisJS and other Project services may use localStorage to retain a UUID, region, display preferences, permission status, and other settings on the user’s device. This information remains on the device unless the relevant feature needs to transmit it to a server. Users can remove local data through their browser settings. Cloudflare or another third party may set or receive cookies or similar identifiers necessary for security or service delivery.

## 8. Additional Information About SeisJS

This Policy also applies to general matters concerning SeisJS, including server logs, IP addresses, retention, security measures, third-party infrastructure, user rights, revisions to this Policy, and contact information. The SeisJS Service-specific Privacy Notice supplements this Policy with details specific to SeisJS sensors, stations, location information, and public data; both apply together.

## 9. Sharing and Disclosure

The Project does not sell personal information. The Project may entrust information to third parties, under appropriate oversight and only to the extent necessary to provide, operate, protect, or troubleshoot the Services. The Project may also disclose information to competent authorities or other third parties where required by law, lawfully necessary to protect a person’s life, body, or property, or lawfully necessary to protect rights or service security. Entrusted processing, direct communications from a user’s browser to a third party, and a third-party provision under applicable law are handled according to their respective technical and legal relationships.

## 10. Security Measures and Security Incidents

The Project applies reasonable safeguards according to the nature and risk of the information, including access controls, least privilege, protections in transit, log and anomaly monitoring, software and system maintenance, and backups and recovery measures where necessary.

If a security incident occurs, the Project will promptly investigate, contain its effects, and keep necessary records according to the nature of the incident. Where required by applicable law, the Project will report to the competent authority and notify affected individuals in a timely manner.

## 11. User Rights

Users may request access to, correction or deletion of, cessation of use of, or otherwise exercise rights regarding their information under applicable law. The Project may request reasonable information to verify the requester’s identity. A request may not be fulfilled in whole or in part because of a legal obligation, security needs, third-party rights, technical limitations, or because the Project does not hold the relevant information. The Project will handle such requests in accordance with applicable law.

## 12. Changes to This Policy

The Project may update this Policy in response to changes in the Services or applicable law. The updated Policy will be published on this website, and material changes will be highlighted through reasonable means. Where applicable law requires consent, the Project will obtain it separately.

## 13. Contact Information

If you have any questions about this Privacy Policy or our data handling practices, you can contact us via email at: [contact@mtf.edu.kg](mailto:contact@mtf.edu.kg)

Last updated: August 21, 2026
