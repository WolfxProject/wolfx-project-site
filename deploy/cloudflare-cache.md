# Cloudflare cache guidance

The deployable site is generated into `.output/public` and served as one `wolfx.jp` website through Workers Assets. WolfxMC uses the ordinary `/mc` route tree. Configure Cloudflare Cache Rules so that:

- `/_nuxt/*` may use a one-year browser and edge TTL with `immutable`; Nuxt filenames are content-hashed.
- HTML, `search-index.json`, sitemap XML, and `robots.txt` should revalidate and must not be marked `immutable`.
- `404` responses should not receive a long edge TTL while a release is being validated.

The Worker delegates current locale-root requests to the assets binding without rebuilding response bodies or replacing `Content-Type`, `ETag`, `Range`, or conditional-request headers. Review Cloudflare's active Cache Rules when publishing changes to legal pages, API documentation, or the search index; repository configuration cannot determine dashboard-level cache overrides.

Only `wolfx.jp` should be attached to this website deployment. `mc.wolfx.jp` may remain a DNS endpoint for Minecraft connections and the mcapi.us status lookup, but it must not be attached as a Worker route, Custom Domain, website origin, redirect, or hostname fallback. No separate web origin, Pages project, runtime rendering service, or archive proxy is required.
