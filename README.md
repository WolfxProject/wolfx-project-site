# Wolfx Project ウェブサイト

Wolfx Project の公式ウェブサイトおよび公開ドキュメントサイトです。日本語をデフォルト言語とし、簡体字中国語と英語にも対応しています。トップページ、API ドキュメント、法的文書の本文はすべて Markdown / Nuxt Content MDC で管理し、Nginx または Cloudflare Workers Assets にデプロイするために静的生成します。

## 技術スタック

- Nuxt 4、Vue 3、TypeScript（厳格モード）
- Nuxt Content 3、Nuxt UI 4
- `@nuxtjs/i18n`、`@nuxtjs/sitemap`
- pnpm、ESLint、Playwright によるリリース前検証
- Nitro による静的生成。本番用の出力ディレクトリは `.output/public`

## 動作要件

- Node.js 20.19 以降（現行の LTS を推奨）
- pnpm 12.3.4
- Wrangler 4（プロジェクトの開発依存関係としてバージョンを固定済み）

## 開発と検証

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

`pnpm check` は、3 言語のファイル、静的検索、主要な API エンドポイント、SEO、外部リソース、生成物、現行ルート、404 の挙動を検証します。`pnpm test:e2e` は通常の静的 HTTP サーバーを起動し、360–2560px の 7 段階のビューポートで、検索、モバイルナビゲーション、ライト／ダークテーマ、ページのはみ出し、見出し階層、コンテンツの配置、初回読み込み時の外部リクエストを検証します。ブラウザーのバイナリをインストールする必要があるのは初回のみです。`pnpm content:audit` は、同じ親ディレクトリにある旧サイト `../wolfx-project` を読み取り専用で比較し、タイトル、セクション、リンク、エンドポイント、コード、表、フィールドを検証します。

## コンテンツのディレクトリ構成

```text
content/
├── ja/                    # デフォルト言語。公開 URL にプレフィックスなし
├── zh/                    # /zh/...
└── en/                    # /en/...

<locale>/
├── index.md               # トップページ
├── donate.md              # 寄付ページ
├── projects.md            # プロジェクト一覧
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

長文の本文、API フィールドの表、法的文書は Markdown のみで管理してください。Vue コンポーネントは、レイアウト、操作への応答、再利用可能な表示のみを担当します。

メインサイトは引き続き、プレフィックスのない日本語をデフォルト言語とします。WolfxMC では意図的に異なる言語別 URL 構成を採用しています。`/mc` は簡体字中国語の優先 URL、`/zh/mc` は言語を明示した簡体字中国語、`/ja/mc` は日本語、`/en/mc` は英語です。言語を明示した中国語ページの canonical は、対応するプレフィックスのない `/mc` ページを指します。

### ページの追加・編集

1. `content/ja`、`content/zh`、`content/en` の同じ相対パスにファイルを作成します。
2. frontmatter に `title`、`description`、`locale`、`layout`、`updated` を指定します。API ドキュメントでは `updated` のみで最終更新日を示し、ドキュメントのバージョンメタデータや本文中のバージョン見出しは管理しません。
3. 公開ルートを追加する場合は、`nuxt.config.ts` の `mainContentRoutes`（WolfxMC の場合は `wolfxMcRouteFamilies`）にパスを追加し、3 言語のルートが静的プリレンダリングと sitemap に含まれるようにします。
4. ドキュメントナビゲーション（`app/components/site/DocsSidebar.vue`）を更新し、すべての検証を実行します。

### プロジェクトの追加

トップページとプロジェクトページのカードは、各言語の `index.md` / `projects.md` に記述します。MDC を使用します。

```mdc
::project-grid
:::project-card{title="Project" eyebrow="API" href="https://example.com" icon="i-lucide-activity" action="Open"}
プロジェクトの説明は Markdown に記述します。
:::
::
```

3 言語を同時に更新してください。プロジェクト名と外部リンクには、確認可能な公開情報を使用する必要があります。

### API ドキュメントの編集

API フィールドには引き続き Markdown の表を使用し、1 列目には元のフィールド名をそのまま記載してください。誤りに見えるスペルも修正しないでください。HTTP / HTTPS / WSS のアドレスには、コードブロックまたは `ApiEndpoint` を使用します。

```mdc
::api-endpoint{method="GET" address="https://api.example.com/data.json" label="Endpoint"}
::
```

既存の移行済みドキュメントは、`node scripts/migrate-legacy-content.mjs` で再生成できます。このコマンドは `docs/` と `legal/` にある 15 個の Markdown ファイルを上書きするため、旧サイトから再移行する必要がある場合にのみ実行してください。再生成後は必ず Git diff を確認し、`../wolfx-project` は変更しないでください。

### 法的文書の編集

プライバシーポリシーと利用規約は、それぞれ `content/*/legal/privacy.md` と `terms.md` にあります。法的文書を要約したり、3 言語間の差異を機械的に統一したり、根拠なく書き換えたりしないでください。いずれかの言語を変更する場合は、残りの 2 言語も必ず確認し、更新日時、免責事項、連絡先情報を維持してください。

プライバシーポリシーの変更前後には、生成されたページの実際のネットワークリクエスト、ブラウザーストレージ、Cookie、デプロイ設定を確認してください。サードパーティーのリソース、外部スクリプト、サービスを追加する場合は、3 言語を併せて確認する必要があります。このサイトでは、外部フォント、トラッキングスクリプト、広告、宣伝用 iframe を自動的に読み込んではいけません。

### 静的検索

`pnpm generate` のライフサイクルでは、先に `scripts/generate-search-index.mjs` を実行し、36 個の Markdown ファイルから `public/search-index.json` を生成して、`.output/public/search-index.json` にコピーします。検索はブラウザー内で実行され、Server API、データベース、外部検索サービスは不要です。コンテンツを変更した後は、`pnpm generate` を再実行してください。次のコマンドを単独で実行することもできます。

```bash
pnpm search:generate
```

検索インデックスを手動で管理したり、実行時のファイル走査や `/api/search` を再導入したりしないでください。

### 利用可能な MDC コンポーネント

- `HeroSection`、`PageIntro`
- `ProjectGrid`、`ProjectCard`
- `ServiceLinks`、`ServiceLink`
- `ContentNotice`（`info` / `warning` / `note` / `danger`）
- `ContentSection`（`reading` / `wide` のコンテンツコンテナーと Markdown のスタイル適用範囲）
- `ApiEndpoint`、`DonationAddress`、`ExternalLink`

ページ全体の構造には `site-container`、長文の本文には `reading-container` を使用します。Hero、Markdown のセクション、コンポーネント内部の見出しは、それぞれのスコープで制御します。連続する Markdown と MDC コンポーネントを同じ本文幅にそろえる場合は `ContentSection` を使用し、隣接するノードに個別に幅を指定したり、生成後の `nth-child` 構造に依存したりしないでください。

## 言語の追加

1. `i18n/locales/` に UI テキストを追加します。
2. `nuxt.config.ts` の `i18n.locales` に言語を追加し、プレフィックスの方針を設定します。
3. `content/<locale>` に対応するすべてのページを作成します。
4. `usePublicPath`、canonical / hreflang、sitemap のルート、検証スクリプトを更新します。

ブラウザーの言語に基づいてサイト全体で強制リダイレクトを行う機能は有効にしないでください。各言語のページには、常に直接アクセスでき、クローラーが取得できる必要があります。

## Nginx への静的デプロイ

ビルド成果物：

```bash
pnpm generate
# .output/public をサーバーにアップロード
```

Nginx の設定例：

```nginx
server {
    server_name wolfx.jp;
    root /srv/wolfx/.output/public;

    include /srv/wolfx/deploy/nginx-cache.conf;

    error_page 404 /404.html;
    location = /404.html { internal; }
}
```

`deploy/nginx-cache.conf` は、`/_nuxt/*` に 1 年間の `immutable` キャッシュを適用し、HTML と `search-index.json` には再検証を求める方針を適用します。また、`try_files ... =404` により、存在しないパスにトップページをステータス 200 で返さないようにします。`/mc` とその配下のページも、他の Nuxt 静的ルートと同様に同じ `wolfx.jp` サイトから配信するため、個別の server ブロックは不要です。実際のパスはサーバーのディレクトリ構成に合わせて調整できます。デプロイ前に `nginx -t` で Nginx 設定全体を検証してください。

WolfxMC のウェブページは `https://wolfx.jp/mc` にあります。Minecraft プレイヤーが使用するサーバーアドレスは `wolfx.jp` に統一しており、ブラウザーからの mcapi.us へのステータス問い合わせも `wolfx.jp` を対象とします。

## Cloudflare Workers Assets へのデプロイ

Cloudflare でのデフォルト構成は「Nuxt による静的生成 + 最小限の Worker + Workers Assets」で、配信対象は `wolfx.jp` のみです。

- 静的アセットのディレクトリ：`.output/public`
- Worker のエントリーポイント：`worker/index.ts`
- 通常のコンテンツページ：動的 SSR を介さず、Workers Assets から直接配信
- Worker：現行の `/zh/`、`/en/` のトップページ URL 形式を維持し、`.html` パスへの GET / HEAD を 404 として処理し、リクエストを Workers Assets に渡す
- 常駐する Node.js サーバーも、通常のページをレンダリングする SSR Worker も不要

ローカルプレビューと HTTP 検証：

```bash
pnpm cf:dev
# 別のターミナルで実行
pnpm cf:test
```

`cf:dev` は、サイト全体を生成してからローカルの Workers Assets サービスを起動します。旧 URL には互換エイリアスを設けず、通常の存在しないパスと同様に 404 を返す必要があります。

デプロイせずにパッケージングのみを実行：

```bash
pnpm cf:dry-run
```

初回は信頼できるターミナルで手動ログインした後、本番環境にデプロイします。

```bash
pnpm exec wrangler login
pnpm cf:deploy
```

`cf:deploy` は、型チェック、lint、旧コンテンツの監査、静的生成、リリース前検証を実行してから Wrangler を呼び出します。API Token、アカウント ID、`.dev.vars`、その他の認証情報をリポジトリに書き込まないでください。CI では、Cloudflare がサポートするシークレットストアを通じて認証情報を注入してください。この作業および通常のコード変更では、実際のデプロイを実行してはいけません。

Cloudflare のキャッシュに関する推奨設定は `deploy/cloudflare-cache.md` を参照してください。長期間の `immutable` キャッシュに適しているのは `/_nuxt/*` のみです。HTML、法的文書、API ドキュメント、sitemap、検索インデックスは再検証が可能でなければなりません。

## コンテンツとプライバシーに関するルール

- Google Fonts、アクセス解析、広告、宣伝用 iframe を読み込まない。
- テーマと言語の選択はブラウザー内にのみ保存する。
- コンポーネントに長文の多言語本文をハードコードしない。
- 読み取り専用の移行元 `../wolfx-project` を変更しない。
- 旧 URL のエイリアスや互換リダイレクトを維持しない。今後の作業で明示的に要求されない限り、旧パスは 404 のままにする。
- リリース前に `pnpm typecheck && pnpm lint && pnpm content:audit && pnpm generate && pnpm check && pnpm test:e2e && pnpm cf:dry-run` を実行する。
