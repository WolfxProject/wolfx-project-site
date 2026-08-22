# Wolfx Project website

Wolfx Project 的官方网站与公共文档站。站点以日语为默认语言，同时提供简体中文和英语；首页、API 文档与法律正文均由 Markdown / Nuxt Content MDC 驱动，并静态生成给 Nginx 或 Cloudflare Workers Assets 部署。

## 技术栈

- Nuxt 4、Vue 3、TypeScript（严格模式）
- Nuxt Content 3、Nuxt UI 4
- `@nuxtjs/i18n`、`@nuxtjs/sitemap`
- pnpm、ESLint、Playwright 发布验收
- Nitro 静态生成，生产目录为 `.output/public`

## 环境要求

- Node.js 20.19 或更高版本（推荐当前 LTS）
- pnpm 11
- Wrangler 4（已作为项目开发依赖锁定）

## 开发与验证

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
pnpm typecheck
pnpm lint
pnpm content:audit
pnpm generate
pnpm check
pnpm test:e2e
pnpm cf:dry-run
```

`pnpm check` 检查三语文件、静态搜索、关键 API 端点、SEO、外部资源、生成产物、当前路由与 404 行为。`pnpm test:e2e` 会启动普通静态服务器，在 360–2560px 的七档视口检查搜索、移动导航、明暗主题、页面溢出、标题层级、内容对齐和初始外部请求；浏览器二进制只需首次安装。`pnpm content:audit` 只读对比同级的 `../wolfx-project` 旧站，检查标题、章节、链接、端点、代码、表格与字段。

## 内容目录

```text
content/
├── ja/                    # 默认语言，对外不带前缀
├── zh/                    # /zh/...
└── en/                    # /en/...

<locale>/
├── index.md               # 首页
├── donate.md              # 捐赠页
├── projects.md            # 项目列表
├── docs/
│   ├── open-api.md
│   ├── websocket.md
│   └── seisjs-api.md
├── legal/
│   ├── privacy.md
│   └── terms.md
└── mc/                    # /mc、/zh/mc、/ja/mc、/en/mc
    ├── index.md
    ├── rules.md
    ├── join.md
    └── vote.md
```

大段正文、API 字段表和法律文本只能在 Markdown 中维护。Vue 组件只负责布局、交互与可复用展示。

主站继续以无前缀日语为默认语言；WolfxMC 则有意采用不同的公开语言模型：`/mc` 为首选简体中文入口，`/zh/mc` 为显式简体中文，`/ja/mc` 为日语，`/en/mc` 为英语。显式中文页面 canonical 到对应的无前缀 `/mc` 页面。

### 新增或编辑页面

1. 在 `content/ja`、`content/zh`、`content/en` 的相同相对路径创建文件。
2. 使用 `title`、`description`、`locale`、`layout`、`updated` frontmatter；文档可以再写 `version`。
3. 若新增公开路由，把三语路径加入 `nuxt.config.ts` 的 `contentRoutes`，确保静态预渲染和 sitemap 收录。
4. 更新文档导航（`app/components/site/DocsSidebar.vue`）并运行完整验证。

### 新增项目

首页和项目页的卡片位于对应语言的 `index.md` / `projects.md`。使用 MDC：

```mdc
::project-grid
:::project-card{title="Project" eyebrow="API" href="https://example.com" icon="i-lucide-activity" action="Open"}
项目说明写在 Markdown 中。
:::
::
```

请同时更新三种语言；项目名和外链必须来自可核对的公开信息。

### 编辑 API 文档

API 字段继续使用 Markdown 表格，第一列保持原始字段名，不要修正看似可疑的拼写。HTTP / HTTPS / WSS 地址使用代码块或 `ApiEndpoint`：

```mdc
::api-endpoint{method="GET" address="https://api.example.com/data.json" label="Endpoint"}
::
```

现有迁移文档可由 `node scripts/migrate-legacy-content.mjs` 重建。该命令会覆盖 15 个 `docs/` 与 `legal/` Markdown 文件；除非确实要重新从旧站迁移，否则不要运行。重建后必须审查 Git diff，且不得修改 `../wolfx-project`。

### 编辑法律文本

隐私政策和使用条款分别在 `content/*/legal/privacy.md` 与 `terms.md`。法律文本不得概括、自动统一三语差异或在没有依据时改写。修改一种语言时必须检查另外两种语言，并保留更新时间、免责声明与联系信息。

修改隐私政策前后应检查生成页面的实际网络请求、浏览器存储、Cookie 和部署配置。新增第三方资源、外部脚本或服务时必须同步检查三种语言；本站不得自动加载外部字体、追踪脚本、广告或推广 iframe。

### 静态搜索

`pnpm generate` 的生命周期会先运行 `scripts/generate-search-index.mjs`，从 36 份 Markdown 生成 `public/search-index.json`，再复制到 `.output/public/search-index.json`。搜索在浏览器本地执行，不需要 Server API、数据库或外部搜索服务。修改内容后直接重新执行 `pnpm generate`；也可单独运行：

```bash
pnpm search:generate
```

不要手工维护搜索索引，也不要重新引入运行时文件扫描或 `/api/search`。

### 可用 MDC 组件

- `HeroSection`、`PageIntro`
- `ProjectGrid`、`ProjectCard`
- `ServiceLinks`、`ServiceLink`
- `ContentNotice`（`info` / `warning` / `note` / `danger`）
- `ContentSection`（`reading` / `wide` 内容容器与 Markdown 排版作用域）
- `ApiEndpoint`、`DonationAddress`、`ExternalLink`

页面骨架使用 `site-container`，长篇正文使用 `reading-container`；Hero、Markdown 章节和组件内部标题分别由各自作用域控制。需要把连续的 Markdown 与 MDC 组件放在同一阅读宽度时，使用 `ContentSection`，不要为相邻节点分别添加宽度或依赖生成后的 `nth-child` 结构。

## 新增语言

1. 在 `i18n/locales/` 新增界面短文案。
2. 在 `nuxt.config.ts` 的 `i18n.locales` 添加语言与前缀策略。
3. 创建完整的 `content/<locale>` 对应页面。
4. 更新 `usePublicPath`、canonical / hreflang、sitemap 路由与检查脚本。

不要启用基于浏览器语言的强制全局跳转。语言页面必须始终可被直接访问和抓取。

## Nginx 静态部署

构建产物：

```bash
pnpm generate
# 将 .output/public 上传到服务器
```

Nginx 示例：

```nginx
server {
    server_name wolfx.jp;
    root /srv/wolfx/.output/public;

    include /srv/wolfx/deploy/nginx-cache.conf;

    error_page 404 /404.html;
    location = /404.html { internal; }
}
```

`deploy/nginx-cache.conf` 对 `/_nuxt/*` 使用一年 `immutable` 缓存，对 HTML 和 `search-index.json` 使用重新验证策略，并以 `try_files ... =404` 保证不存在的路径不是首页 200。`/mc` 与其子页面和其他 Nuxt 静态路由一样由同一 `wolfx.jp` 站点提供，不需要单独的 server block。实际路径可按服务器布局调整；部署前用 `nginx -t` 检查完整 Nginx 配置。

WolfxMC 网站与 Minecraft 连接端点是不同概念：网站仅位于 `https://wolfx.jp/mc`；玩家通常连接 `Wolfx.jp`，海外玩家连接 `mc.wolfx.jp`，浏览器中的 mcapi.us 状态查询也使用 `mc.wolfx.jp`。`mc.wolfx.jp` 不得作为网站 origin、canonical、跳转目标或 Worker/Nginx 网站路由。

## Cloudflare Workers Assets 部署

默认 Cloudflare 形态是“Nuxt 静态生成 + 极小 Worker + Workers Assets”，只服务 `wolfx.jp`：

- 静态资源目录：`.output/public`
- Worker 入口：`worker/index.ts`
- 普通内容页面：直接由 Workers Assets 提供，不经过动态 SSR
- Worker：仅保留当前 `/zh/`、`/en/` 首页形式并把请求交给 Workers Assets
- 不需要常驻 Node.js 服务器，也不需要 SSR Worker 渲染普通页面

本地预览和 HTTP 验收：

```bash
pnpm cf:dev
# 另一个终端
pnpm cf:test
```

`cf:dev` 会先完整生成站点，再启动本地 Workers Assets 服务。历史 URL 没有兼容别名，应按普通不存在路径返回 404。

只打包、不发布：

```bash
pnpm cf:dry-run
```

首次由人工在可信终端登录，然后正式部署：

```bash
pnpm exec wrangler login
pnpm cf:deploy
```

`cf:deploy` 会先执行类型检查、lint、旧内容审计、静态生成与发布检查，再调用 Wrangler。不要把 API Token、账户 ID、`.dev.vars` 或其他凭据写入仓库；CI 应通过 Cloudflare 支持的密钥存储注入凭据。本任务和常规代码修改不得执行真实部署。

Cloudflare 缓存建议见 `deploy/cloudflare-cache.md`。仅 `/_nuxt/*` 适合长期 `immutable`；HTML、法律文本、API 文档、sitemap 和搜索索引必须允许重新验证。

## 内容与隐私约定

- 不加载 Google Fonts、分析、广告或推广 iframe。
- 主题与语言选择仅保存在浏览器本地。
- 不在组件里硬编码大段多语言正文。
- 不修改只读迁移来源 `../wolfx-project`。
- 不维护旧 URL 别名或兼容重定向；除非未来任务明确要求，历史路径应保持 404。
- 发布前运行 `pnpm typecheck && pnpm lint && pnpm content:audit && pnpm generate && pnpm check && pnpm test:e2e && pnpm cf:dry-run`。
