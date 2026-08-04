# Repository rules

- This repository is the Nuxt 4 website for Wolfx Project. Japanese (`ja`) is the default locale and has no URL prefix.
- Keep visitor-facing body copy, API field descriptions, disclaimers, and legal text in `content/**/*.md`. Vue components are for layout, interaction, and reusable presentation only.
- Do not summarize, machine-normalize, or casually rewrite legal text. Preserve each language's existing meaning and differences.
- Never guess or rename API fields, endpoints, service behavior, versions, credits, or partner links. Suspicious legacy spellings are part of the public contract until evidence says otherwise.
- When changing one language, inspect the corresponding Japanese, Simplified Chinese, and English pages.
- Maintain old public routes only in `data/legacy-redirects.json`, then regenerate the Nginx and Worker redirect outputs. It is the single trusted redirect source.
- `../wolfx-project` is a read-only public migration source. Never modify, format, delete, or commit files there.
- Do not add tracking, ads, third-party font CDNs, automatic external iframes, or forced browser-language redirects.
- Keep SSR and prerendering safe. Browser-only APIs belong in client lifecycle hooks or `.client` files.
- The default deployment mode is static generation. Cloudflare Worker code is limited to legacy redirects and Workers Assets; do not move ordinary pages to dynamic SSR without an explicit requirement.
- Search must work on a plain static HTTP server and must not depend on a Server API, runtime filesystem access, database, or external search provider.
- When adding or changing any third-party resource, inspect and update all three privacy-policy versions. Do not introduce external fonts, tracking scripts, ads, or promotional iframes.
- After deployment-code changes, test both the Nginx/static-output path and the local Wrangler path, including redirects, query strings, assets, and 404 behavior.
- Never perform a real deployment, `git commit`, or `git push` from repository-maintenance tasks.
- Before handoff, run `pnpm typecheck`, `pnpm lint`, `pnpm content:audit`, `pnpm generate`, `pnpm check`, `pnpm test:e2e`, and `pnpm cf:dry-run`.
