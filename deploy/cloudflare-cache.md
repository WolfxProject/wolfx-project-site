# Cloudflare cache guidance

The deployable site is generated into `.output/public`. Configure Cloudflare Cache Rules so that:

- `/_nuxt/*` may use a one-year browser and edge TTL with `immutable`; Nuxt filenames are content-hashed.
- HTML, `search-index.json`, sitemap XML, and `robots.txt` should revalidate and must not be marked `immutable`.
- `404` responses and Worker redirect responses should not receive a long edge TTL while a release is being validated.

The Worker deliberately delegates asset responses without rebuilding their bodies or replacing `Content-Type`, `ETag`, `Range`, or conditional-request headers. Review Cloudflare's active Cache Rules when publishing changes to legal pages, API documentation, or the search index; repository configuration cannot determine dashboard-level cache overrides.
