# シナログ（Sinalog）

クトゥルフ神話TRPGシナリオのレビューサイト。

**ゼロから公開までの手順・使い方は [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) にまとめています。まずそちらを参照してください。**

## 技術構成

- Next.js（App Router） + TypeScript
- Tailwind CSS v4（CSS変数ベースのデザイントークンと連携）
- Supabase（DB・認証・ストレージ）

詳細は `implementation_spec.md`（モックアップと一緒に共有されているドキュメント）を参照。

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.local に Supabase の URL / anon key を設定
npm run dev
```

## 実装状況

主要ページは一通り実装済みです。

| ページ | 状態 |
|---|---|
| トップページ（`app/page.tsx`） | 実装済み。Supabaseから新着シナリオを取得して表示 |
| ログイン（`app/login/`） | 実装済み。Google OAuth + メールMagic Link |
| シナリオ詳細（`app/scenarios/[id]/`） | 実装済み。おすすめ度・要素タグ集計・レビュー一覧・お気に入り・通報 |
| シナリオ登録（`app/scenarios/new/`） | 実装済み。OGP自動取得＋タグ選択 |
| シナリオ編集（`app/scenarios/[id]/edit/`） | 実装済み。登録者本人のみ |
| レビュー投稿・編集（`app/scenarios/[id]/review/new/`） | 実装済み。既存レビューがあれば内容をプリフィルして編集扱いになる |
| 検索結果（`app/search/`） | 実装済み。キーワード・複数条件の絞り込み・並び替え・ページネーション |
| マイページ（`app/mypage/`） | 実装済み。投稿レビュー／好きなシナリオ／登録シナリオ／アカウント設定の4タブ |
| アイコン選択（`app/mypage/avatar/`） | 実装済み |
| ヘルプ・利用規約・掲載不可作者一覧（`app/help/` `app/terms/` `app/excluded-authors/`） | 実装済み |
| 管理画面（`app/admin/reports/`） | 実装済み。`public.admins`テーブルに登録されたユーザーのみアクセス可 |

## ディレクトリ構成

```
app/
  page.tsx                           トップページ
  login/page.tsx                     ログイン（Google OAuth + Magic Link）
  auth/callback/route.ts             認証コールバック
  search/                            検索結果（フィルター・並び替え・ページネーション）
  mypage/                            マイページ本体・タブ・各種編集コンポーネント・Server Actions
  mypage/avatar/                     アイコン選択
  scenarios/new/                     シナリオ登録（ScenarioFormは編集にも流用）
  scenarios/[id]/page.tsx            シナリオ詳細
  scenarios/[id]/edit/               シナリオ編集
  scenarios/[id]/review/new/         レビュー投稿・編集
  scenarios/[id]/actions.ts          「参考になった」カウント
  scenarios/[id]/report-actions.ts   レビュー通報・管理者による非表示/却下
  admin/reports/                     通報管理画面
  terms/ help/ excluded-authors/     静的ページ
  api/fetch-ogp/route.ts             頒布ページURLからOGP情報を取得するAPI

components/
  header.tsx                        共通ヘッダー（サーバーコンポーネント・認証状態を表示）
  mobile-search-toggle.tsx          スマホ用ハンバーガー検索メニュー
  search-form.tsx                   検索フォーム（ヘッダー・ハンバーガーメニュー共通）
  footer.tsx                        共通フッター
  logout-button.tsx                 ログアウトボタン
  favorite-button.tsx               お気に入り追加/解除ボタン
  avatar-icon.tsx                   アバターアイコン表示
  theme-provider.tsx                テーマ(ライト/ダーク・アクセントカラー)管理。ログイン中はDBにも保存
  theme-switcher.tsx                テーマ切替UI
  form-fields.tsx                   フォーム共通部品（Field / TagSelect / ChoiceSelect / LabelSelect）

lib/
  supabase/client.ts                 ブラウザ用Supabaseクライアント
  supabase/server.ts                 サーバー用Supabaseクライアント
  supabase/admin.ts                  service_role用クライアント（アカウント完全削除にのみ使用、任意設定）
  content-taxonomy.ts                要素タグ・当てはまるタグ・必要サプリメントの定義（全フォーム共通）
  avatar-options.ts                  アバターのアイコン・カラー選択肢

supabase/migrations/
  0001_init.sql                      public.usersテーブル + 自動作成トリガー
  0002_scenarios.sql                 scenariosテーブル
  0003_reviews.sql                   reviewsテーブル + scenario_statsビュー
  0004_review_aggregates.sql         要素タグ・当てはまるタグの集計ビュー
  0005_reports.sql                   reportsテーブル（通報）
  0006_excluded_authors.sql          掲載不可作者一覧テーブル
  0007_admin_moderation_policies.sql 管理者によるレビュー/シナリオ更新を許可するRLS
  0008_favorites.sql                 favoritesテーブル（お気に入り）
  0009_scenario_delete_policy.sql    シナリオ削除ポリシー（登録者本人・管理者）
  0010_own_hidden_review_visibility.sql  本人は自分の非公開レビューも閲覧可能に
  0011_admin_table.sql               管理者フラグをusersから分離(is_admin列の公開API経由の閲覧を防止)

proxy.ts                             Supabase Authのセッション自動更新（Next.js 16のmiddleware）
```

## 認証の実装状況

Google OAuth ＋ メールMagic Linkの両方が実装済みです。設定手順は`SETUP_GUIDE.md`の「2. Googleログインを有効にする」を参照してください。

## マイページの実装状況

`app/mypage/` 以下に実装しています。

- プロフィールヘッダー：アイコン・表示名・統計（投稿レビュー数／好きなシナリオ数／参考になった合計）、「好きな傾向」タグのインライン編集
- タブ：投稿したレビュー／好きなシナリオ／登録したシナリオ／アカウント設定（`mypage-tabs.tsx`）
- アカウント設定：表示名の変更、ログイン方法の表示、テーマ切替、アカウント削除
- `actions.ts` に主要なServer Actionをまとめています（表示名・好みタグ・アイコン変更、レビュー/シナリオ/お気に入りの削除、アカウント削除）

### アカウント削除について

投稿したレビュー・登録したシナリオ・お気に入りは常に削除されます。ログイン情報（`auth.users`）自体も完全に削除したい場合は、`.env.local`に`SUPABASE_SERVICE_ROLE_KEY`を設定してください（`lib/supabase/admin.ts`）。未設定の場合はプロフィールを匿名化してサインアウトするのみに留まります。

## 検索機能の実装状況

`app/search/` に実装しています。

- キーワード検索（タイトル・作者名・サークル名の部分一致）
- 絞り込み：対応版／必要サプリメント／プレイ人数／プレイ時間／価格（無料・有料）／タグ4カテゴリ
- 並び替え：評価が高い順／新着順／レビューが多い順／プレイ時間が短い順
- 20件ごとのページネーション、アクティブなフィルターのチップ表示・一括解除

フィルターはチェックボックスの変更で自動的にフォーム送信される作り（`search-filters-form.tsx`）ですが、`<form method="get">`をベースにしているためJavaScriptが無効でも「絞り込む」ボタンから動作します。

## セキュリティについて

- **管理者フラグの分離**：`is_admin`は`public.users`ではなく、公開APIから直接読み取れない`public.admins`テーブルで管理しています（`0011_admin_table.sql`）。判定は`public.is_admin()`（SECURITY DEFINER関数）経由のみで行い、`anon`キーで管理者一覧を直接列挙できないようにしています
- **オープンリダイレクト対策**：ログイン後の遷移先(`next`パラメータ)は`app/login/page.tsx`と`app/auth/callback/route.ts`の`sanitizeNext()`で、同一オリジンの相対パスのみに制限しています
- **管理者操作の二重チェック**：`/admin/reports`のページ・Server Actionの両方で、RLSに加えてアプリ側でも`is_admin()`を呼んで管理者かどうかを確認しています（RLSだけに依存しない）
- **OGP取得のSSRF対策**：`app/api/fetch-ogp/route.ts`は取得先ドメインを`booth.pm`のみに限定するアローリストを実装済みです
- **セキュリティヘッダー**：`next.config.ts`でクリックジャッキング対策(`X-Frame-Options`)等の基本ヘッダーを全ページに付与しています
- Google OAuthはSupabase(`@supabase/ssr`)がPKCEフローを標準で使用するため、認可コード横取り攻撃への対策は組み込み済みです

## 既知の制約・今後の拡張候補

- 「参考になった」は同じ人が連打すると際限なく増える簡易実装（`scenarios/[id]/actions.ts`にコメントで拡張方法を記載）
- 検索の「プレイ時間が短い順」は`play_time`がテキスト項目のため、決め打ちの順序配列でソートしている簡易実装
- お気に入り一覧は現状「自分だけ」が見られる設計（他人のマイページを公開する機能自体が未実装のため）。将来的に公開プロフィールページを作る場合は`favorites`テーブルのSELECTポリシーを緩める必要がある
- このNext.jsプロジェクトはビルド用サンドボックス環境で作成しました。`next/font/google` によるNoto Sans JPの取得は、外部ネットワーク制限のあるこの環境ではビルド時に失敗しますが、**Vercel上では問題なく取得できます**
