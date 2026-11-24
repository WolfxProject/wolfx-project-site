# Cloudflare cache guidance

Workers Assets serves the contents of `.output/public` for `wolfx.jp`. The WolfxMC pages use the same host under `/mc`.

The generated top-level JavaScript and CSS bundles in `/_nuxt/` have content-hashed filenames. `public/_headers` gives those bundles a one-year browser lifetime with `immutable`. Keep the default revalidation policy for HTML, `_payload.json`, `/_nuxt/builds/latest.json`, API examples, legal pages, sitemaps and the search index. An updated release can change the content at any of those URLs.

The Worker delegates the localized home pages and the standalone tools at `/ipleak.html` and `/geiger/` to the assets binding. It forwards the request method, query string and conditional headers so that GET, HEAD and ETag revalidation use the same asset. When publishing another standalone HTML file, update the public paths in `worker/index.ts`, `wrangler.jsonc` and `deploy/nginx-cache.conf`. Cover the published URL and any extensionless alias inferred by Workers Assets in the shared delivery check.

The same prerendered 404 document serves missing pages and bundles. It includes recovery links for each language and works with JavaScript disabled. Its headers allow revalidation even when the requested path looks like a fingerprinted bundle.

Workers Assets applies `_headers` by path. A POST to an existing hashed bundle receives 405 with the bundle's cache header. The response has no `Content-Location`, which HTTP requires for a cached POST response to satisfy a later GET or HEAD. [RFC 9110, section 9.3.3](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.3)

Check the zone's Cache Rules before publishing. A dashboard rule for all of `/_nuxt/*` can give the build manifest a stale one-year lifetime. Limit any edge TTL overrides to successful responses for the fingerprinted bundles. [Cloudflare static asset headers](https://developers.cloudflare.com/workers/static-assets/headers/)
