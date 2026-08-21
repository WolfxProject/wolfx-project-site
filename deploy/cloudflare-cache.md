# Cloudflare cache guidance

The deployable site is generated into `.output/public`. The same Workers Assets deployment serves both `wolfx.jp` and `mc.wolfx.jp`; the Worker selects the WolfxMC static route tree from the request hostname. Configure Cloudflare Cache Rules so that:

- `/_nuxt/*` may use a one-year browser and edge TTL with `immutable`; Nuxt filenames are content-hashed.
- HTML, `search-index.json`, sitemap XML, and `robots.txt` should revalidate and must not be marked `immutable`.
- `404` responses and Worker redirect responses should not receive a long edge TTL while a release is being validated.

The Worker deliberately delegates asset responses without rebuilding their bodies or replacing `Content-Type`, `ETag`, `Range`, or conditional-request headers. Review Cloudflare's active Cache Rules when publishing changes to legal pages, API documentation, or the search index; repository configuration cannot determine dashboard-level cache overrides.

Before release, add `mc.wolfx.jp` as a Worker custom domain (or equivalent route) and confirm its proxied DNS record points to this Worker. No separate origin, Pages project, runtime rendering service, or archive proxy is required. Verify both hostnames after any dashboard route or DNS change.
