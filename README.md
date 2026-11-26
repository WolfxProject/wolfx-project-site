# Wolfx Project ウェブサイト

Wolfx Project の公式ウェブサイトおよび公開ドキュメントサイトです。日本語をデフォルト言語とし、簡体字中国語と英語にも対応しています。トップページ、API ドキュメント、法的文書の本文はすべて Markdown / Nuxt Content MDC で管理し、Nginx または Cloudflare Workers Assets にデプロイするために静的生成します。

## 技術スタック

- Nuxt 4、Vue 3、TypeScript（厳格モード）
- Nuxt Content 3、Nuxt UI 4
- `@nuxtjs/i18n`、`@nuxtjs/sitemap`
- pnpm、ESLint、Playwright によるリリース前検証
- Nitro による静的生成。本番用の出力ディレクトリは `.output/public`

## 動作要件

- Node.js は Nuxt の対応範囲（22.22.3 以降の 22.x、24.15.0 以降の 24.x、または 26.0.0 以降）が必要です。
- pnpm 12.23.0（`package.json` の `packageManager` に固定）
- Wrangler 4（プロジェクトの開発依存関係としてバージョンを固定済み）

### Zod のセキュリティ情報

2026-11-24 時点の `pnpm audit` では、Nuxt Content 3.17.0 が依存する Zod 3.25.76 が 1 件報告されます。Nuxt Content は Zod 3 の API を公開し、`zod-to-json-schema` とともにコレクション定義をビルド時に処理します。このサイトの定義はリポジトリ内にあります。静的配信の Worker にバリデーターは含まれず、ブラウザーで Minecraft のステータスを検証するコードは `zod/mini` 4.6.7 を使います。[GitHub セキュリティアドバイザリ](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)

修正は Zod 4.6.6 に入りました。Zod 4 パッケージの `zod/v3` は従来の実装を提供します。Nuxt Content 側でも、単純なメジャーバージョン更新が型検査と公開 API の互換性に影響することを確認しています。Nuxt Content の更新時には `pnpm why zod` と `pnpm audit` で依存先を確認してください。公開入力をサーバーで検証する構成に変更する場合は、使用するスキーマとサイズ制限も再評価してください。[Zod の修正](https://github.com/colinhacks/zod/pull/6652) · [Zod のバージョン方針](https://zod.dev/v4/versioning) · [Nuxt Content のメンテナーによる説明](https://github.com/nuxt/content/pull/3922#issuecomment-6949003838)

## 開発と検証

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox webkit
pnpm dev
pnpm typecheck
pnpm lint
pnpm content:audit
pnpm generate
pnpm check
pnpm test:e2e
pnpm test:e2e:mobile
pnpm cf:dry-run
```

`pnpm check` は、3 言語のファイル、静的検索、主要な API エンドポイント、SEO、外部リソース、生成物、現行ルート、404 の挙動を検証します。`pnpm test:e2e` は `127.0.0.1` で静的ファイルサーバーを起動し、360–2560px の 7 段階のビューポートで、検索、モバイルナビゲーション、ライト／ダークテーマ、ページのはみ出し、見出し階層、コンテンツの配置、初回読み込み時の外部リクエストを検証します。ブラウザーのバイナリをインストールする必要があるのは初回のみです。

`pnpm content:audit` は現在の Markdown、`scripts/api-contract.mjs`、`public/examples/` をオフラインで検証します。3 言語のページ構成とメタデータを照合し、API ごとにフィールド名、JSON 型、接続先、WebSocket の購読 URL とコマンドの組み合わせ、メッセージの種類とサンプルを確認します。続いて `node:test` が、公開文書とは独立した小さな Markdown サンプルを使い、正しい編集が通ることと、フィールドやコマンドの誤りを検出できることを確認します。

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
│   └── websocket.md
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
4. ドキュメントナビゲーション（`app/composables/useDocsNavigation.ts`）を更新し、すべての検証を実行します。

### プロジェクトの追加

トップページとプロジェクトページのカードは、各言語の `index.md` / `projects.md` に記述します。MDC を使用します。

```mdc
::project-grid
:::project-card{title="Project" href="https://example.com" icon="i-lucide-activity" action="Open"}
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

API の変更をサービスの実装や実際のレスポンスで確認したら、`scripts/api-contract.mjs` と対象言語の文書を同時に更新します。契約には通信上の識別子と JSON 型、適用する言語を記述します。型は表の説明の末尾に各言語の括弧で示し、単位や任意指定も併記できます。`heartbeat` と `pong` のメッセージ表は、それぞれの識別子が入った見出しの下に置きます。地震・津波情報では、参照元に照らして警報の解除と期限切れ、欠測、情報の有効期間、観測値の単位といった説明を各言語で確認してください。

旧サイトのリポジトリは廃止されました。移行当時の HTML を含む Git アーカイブがある場合は、`WOLFX_LEGACY_ROOT` にそのパスを指定すると、`pnpm content:audit:legacy` で当時のコミット `8cd8387d334d8301d4f6c9ed7eeb5cc522fd8b42` との照合もできます。既定の参照先は `../wolfx-project` です。`pnpm content:migrate` は同じリビジョンを読み取り、Open API、WebSocket、法的文書の 3 言語分（12 文書）を `.data/legacy-migration/content/` に出力します。

### 法的文書の編集

プライバシーポリシーと利用規約は、それぞれ `content/*/legal/privacy.md` と `terms.md` にあります。法的文書を要約したり、3 言語間の差異を機械的に統一したり、根拠なく書き換えたりしないでください。いずれかの言語を変更する場合は、残りの 2 言語も必ず確認し、更新日時、免責事項、連絡先情報を維持してください。

ブラウザーテストは各言語の Markdown と公開ページの見出し・本文を照合します。JMA 緊急地震速報データの再提供条件など、特に重要な条項には個別の回帰テストもあります。正式に改定した条項は、該当するテストの期待値も併せて見直してください。

プライバシーポリシーの変更前後には、生成されたページの実際のネットワークリクエスト、ブラウザーストレージ、Cookie、デプロイ設定を確認してください。サードパーティーのリソース、外部スクリプト、サービスを追加する場合は、3 言語を併せて確認する必要があります。このサイトでは、外部フォント、トラッキングスクリプト、広告、宣伝用 iframe を自動的に読み込んではいけません。

### 静的検索

`pnpm generate` のライフサイクルでは、先に `scripts/generate-search-index.mjs` を実行し、`content/` 配下の各言語の Markdown から `public/search-index.json` を生成して、`.output/public/search-index.json` にコピーします。検索はブラウザー内で実行され、Server API、データベース、外部検索サービスは不要です。コンテンツを変更した後は、`pnpm generate` を再実行してください。次のコマンドを単独で実行することもできます。

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

初回訪問では URL で指定された言語を表示します。手動で選んだ言語はブラウザーに保存され、次にプレフィックスのない URL からアクセスする際に適用されます。各言語のページには、常に直接アクセスでき、クローラーが取得できる必要があります。

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

`deploy/nginx-cache.conf` は、`/_nuxt/` 直下のファイル名にハッシュを含む JS と CSS に 1 年間の `immutable` キャッシュを適用し、HTML、`/_nuxt/builds/latest.json`、`search-index.json` には再検証を求める方針を適用します。404 と、範囲指定または前提条件付きリクエストで生じる 416・412 にも再検証を求めます。バイト範囲が有効な場合は 206 と `Content-Range` を返します。`/mc` とその配下のページも、他の Nuxt 静的ルートと同様に同じ `wolfx.jp` サイトから配信するため、個別の server ブロックは不要です。生成された 404 ページには 3 言語の説明と各言語のホームへのリンクがあり、JavaScript を無効にしても利用できます。実際のパスはサーバーのディレクトリ構成に合わせて調整できます。デプロイ前に `nginx -t` で Nginx 設定全体を検証してください。

WolfxMC のウェブページは `https://wolfx.jp/mc` にあります。Minecraft プレイヤーが使用するサーバーアドレスは `wolfx.jp` に統一しており、ブラウザーからの mcapi.us へのステータス問い合わせも `wolfx.jp` を対象とします。

## Cloudflare Workers Assets へのデプロイ

Cloudflare でのデフォルト構成は「Nuxt による静的生成 + 最小限の Worker + Workers Assets」で、配信対象は `wolfx.jp` のみです。

`wolfx.jp` と Worker の紐付けは Cloudflare アカウント側で管理します。初回の公開前に対象のルートまたはカスタムドメインを確認してください。Wrangler の設定で `workers.dev` とバージョン別の公開プレビュー URL を無効にしています。

Workers Builds のルートはリポジトリ直下、ビルドコマンドは `pnpm build`、デプロイコマンドは `pnpm exec wrangler deploy --config wrangler.jsonc` です。`build` は `generate` を呼び出します。`pnpm cf:dry-run` は Workers Builds と同じ `WORKERS_CI=1` で通常のビルドと静的出力の検査を行い、公開用の Worker をローカルでパッケージします。

- 静的アセットのディレクトリ：`.output/public`
- Worker のエントリーポイント：`worker/index.ts`
- 通常のコンテンツページ：動的 SSR を介さず、Workers Assets から直接配信
- 言語別トップの正規 URL は `/zh` と `/en` です。末尾のスラッシュは他のページと同じく Workers Assets が 307 で取り除き、クエリ文字列を引き継ぎます。
- Worker は `/geiger/`、`/geiger/index.html`、`/ipleak.html` を対応する静的ファイルから配信します。存在しないページや Nuxt ページの `.html` 形式には、生成したエラーページを HTTP 404 で返します。
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

`cf:deploy` は、型チェック、lint、現在の API 契約と多言語コンテンツの検証、静的生成、リリース前検証を実行してから Wrangler を呼び出します。API Token、アカウント ID、`.dev.vars`、その他の認証情報をリポジトリに書き込まないでください。CI では、Cloudflare がサポートするシークレットストアを通じて認証情報を注入してください。この作業および通常のコード変更では、実際のデプロイを実行してはいけません。

Cloudflare のキャッシュに関する推奨設定は `deploy/cloudflare-cache.md` を参照してください。`/_nuxt/` 直下のハッシュ付き JS/CSS が長期の `immutable` キャッシュの対象です。HTML、法的文書、API ドキュメント、sitemap、検索インデックスは再検証が可能でなければなりません。

## コンテンツとプライバシーに関するルール

- Google Fonts、アクセス解析、広告、宣伝用 iframe を読み込まない。
- テーマと言語の選択はブラウザー内にのみ保存する。
- コンポーネントに長文の多言語本文をハードコードしない。
- 読み取り専用の移行元 `../wolfx-project` を変更しない。
- 旧 URL のエイリアスや互換リダイレクトを維持しない。今後の作業で明示的に要求されない限り、旧パスは 404 のままにする。
- リリース前に `pnpm typecheck && pnpm lint && pnpm content:audit && pnpm generate && pnpm check && pnpm test:e2e && pnpm cf:dry-run` を実行する。
