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

## ディレクトリ構成

```
app/
  page.tsx                          トップページ（実装済み・デモ用）
  login/page.tsx                    ログイン（実装済み: Google OAuth + Magic Link）
  auth/callback/route.ts            認証コールバック（実装済み）
  mypage/page.tsx                   マイページ（認証ガードのみ実装済み、UI未実装）
  scenarios/[id]/page.tsx           シナリオ詳細（未実装）
  scenarios/new/page.tsx            シナリオ登録（未実装）
  scenarios/[id]/review/new/        レビュー投稿（未実装）
  search/page.tsx                   検索結果（未実装）
  mypage/avatar/page.tsx            アイコン選択（未実装）
  terms/ help/ excluded-authors/    静的ページ（未実装）
  admin/reports/page.tsx            管理画面（未実装）

components/
  header.tsx                        共通ヘッダー（サーバーコンポーネント・認証状態を表示）
  footer.tsx                        共通フッター
  logout-button.tsx                 ログアウトボタン
  theme-provider.tsx                テーマ(ライト/ダーク・アクセントカラー)管理
  theme-switcher.tsx                テーマ切替UI

lib/supabase/
  client.ts                         ブラウザ用Supabaseクライアント
  server.ts                         サーバー用Supabaseクライアント

supabase/migrations/
  0001_init.sql                     public.usersテーブル + 自動作成トリガー

proxy.ts                            Supabase Authのセッション自動更新（Next.js 16のmiddleware）
```

## 認証の実装状況

Google OAuth ＋ メールMagic Linkの両方が実装済みです。

1. `app/login/page.tsx` … ログイン画面。Googleボタン、またはメールアドレス入力でリンク送信
2. `app/auth/callback/route.ts` … 認証完了後、コードをセッションに交換して元のページへリダイレクト
3. `components/header.tsx` … ログイン中はマイページリンク＋ログアウト、未ログインならログインボタンを表示
4. `app/mypage/page.tsx` … 未ログイン時は`/login?next=/mypage`へ自動リダイレクトする例を実装済み

### Supabase側で必要な設定

1. `supabase/migrations/0001_init.sql` をSQL Editorで実行（`public.users`テーブルと自動作成トリガーを作成）
2. Authentication > Providers で **Google** を有効化し、Google Cloud Consoleで発行したクライアントID/シークレットを設定
3. Authentication > URL Configuration の **Redirect URLs** に以下を追加
   - 開発時: `http://localhost:3000/auth/callback`
   - 本番: `https://<本番ドメイン>/auth/callback`
4. Authentication > Providers > Email で **Magic Link（OTPログイン）** が有効になっていることを確認（デフォルトで有効）

各「未実装」ページには、対応する `/mnt/user-data/outputs/*.html` のモックアップファイル名をコメントで記載しています。デザイントークン（色・余白）は `app/globals.css` に定義済みなので、Tailwindのユーティリティクラス（`bg-panel`, `text-ink-sub`, `border-line` 等）でモックアップの見た目をそのまま再現できます。

## テーマ機能について

`components/theme-provider.tsx` で、ライト/ダークモードとアクセントカラー（8色）を管理しています。

- 現状は `localStorage` にのみ保存（無料・実装コストゼロ）
- ログイン機能の実装後、`users` テーブルに `theme_mode` / `theme_color` カラムを追加すれば、別端末でも同じ見た目を復元できるように拡張可能（`theme-provider.tsx` 内にTODOコメントあり）

トップページ（`app/page.tsx`）下部に動作確認用のテーマ切替UIを仮設置しています。他の実装が進んだら削除してください。

## シナリオ登録機能の実装状況

実装済みです（`app/scenarios/new/`）。

1. `page.tsx` … 認証ガード付きページ本体
2. `scenario-form.tsx` … フォーム本体（クライアントコンポーネント）。BOOTHのOGP自動取得、タグ・必要サプリメントの複数選択に対応
3. `actions.ts` … Server Action。`scenarios`テーブルへのinsertを行い、登録後は詳細ページへリダイレクト
4. `app/api/fetch-ogp/route.ts` … 頒布ページURLからog:title / og:image / og:descriptionを取得するAPI（現状`booth.pm`のみ許可、他サイトを増やす場合は`ALLOWED_HOSTS`に追加）
5. `app/scenarios/[id]/page.tsx` … 登録したシナリオを実際に表示する簡易版詳細ページ（本格的なデザインは`scenario_detail.html`から移植が必要）

### Supabase側で追加が必要な設定

`supabase/migrations/0002_scenarios.sql` をSQL Editorで実行し、`scenarios`テーブルを作成してください。

## レビュー投稿機能の実装状況

実装済みです（`app/scenarios/[id]/review/new/`）。

1. `page.tsx` … 認証ガード＋対象シナリオの取得
2. `review-form.tsx` … フォーム本体。HTMLモックアップ(`review_form.html`)の全設問を移植済み
   - プレイした立場／プレイ形式／総合評価（おすすめ・おすすめしないボタン）
   - シナリオの改変（選択で内訳チップが展開）
   - シナリオの特徴（戦闘の激しさは`scenario.has_combat`がtrueの時だけ表示、立場に応じて「KP進行の負担」⇔「PCの動かしやすさ」の表記が切り替わる）
   - 追加の評価（またやりたいか／注意書きの妥当性→不十分な場合は要素タグが展開／価格の妥当性は有料シナリオのみ表示）
   - 引用・参考元について（「引っかかりを感じた」を選ぶと補足欄が展開）
   - 生成AIの使用について
   - 別の参加者だったら楽しめたか
   - 良かった点（必須）／気になった点／ネタバレ感想／改変のアドバイス
   - タグ（4カテゴリ・26種類）
3. `actions.ts` … Server Action。`reviews`テーブルへupsert（同じユーザーが同じシナリオに複数回投稿しても1件に上書きされる設計）

`components/form-fields.tsx`に、この後の他フォーム実装でも使い回せる共通部品（`Field` / `TagSelect` / `ChoiceSelect` / `LabelSelect`）を切り出しています。

### Supabase側で追加が必要な設定

`supabase/migrations/0003_reviews.sql` をSQL Editorで実行してください。`reviews`テーブルに加えて、シナリオごとの集計（おすすめ率・プレイ形式の内訳等）をまとめた`scenario_stats`ビューも作成されます。`scenario_detail.html`本来のデザインを移植する際は、このビューをそのまま使えます。

## シナリオ詳細ページの実装状況

実装済みです（`app/scenarios/[id]/`）。`scenario_stats` / `scenario_element_counts` ビューを実際に繋ぎ込んでいます。

- おすすめ度サマリー（%表示、レビュー件数）… レビューが0件の場合は「まだレビューがありません」の空状態を表示
- 特徴バッジ（探索の難しさ／進行・操作の負担／戦闘の激しさ）… レビューの多数決（`mode()`）で表示、`has_combat=false`のシナリオでは戦闘バッジ自体が出ない
- 要素タグ集計… カテゴリごとにグルーピングして表示（`lib/content-taxonomy.ts`のカテゴリ定義を利用）
- レビュー一覧… 「高評価のみ／気になる点も含む」のフィルタタブ（`review-list.tsx`）、スポイラー開閉・参考になったボタンは実際に動作（`review-card.tsx` + `actions.ts`）

`lib/content-taxonomy.ts`に要素タグ・当てはまるタグ・必要サプリメントの定義を一元化し、登録フォーム・レビューフォーム・詳細ページの3箇所で使い回しています。

### 未実装・簡略化している部分

- 「参考になった」は同じ人が連打すると際限なく増える簡易実装（`actions.ts`にコメントで拡張方法を記載）
- 通報ボタンは見た目のみ（`admin/reports`と合わせて後日実装）
- 引用・参考元／生成AIの集計バー（`scenario_stats`ビューには集計カラムを用意済みだが、詳細ページ側の表示はまだ）

## 通報機能の実装状況

実装済みです。

- レビューカードの「通報する」をクリックすると理由選択フォームが展開し、実際に`reports`テーブルへ登録されます（`app/scenarios/[id]/report-actions.ts`, `review-card.tsx`）
- 同じ人が同じレビューを二重通報できないよう、DB側でunique制約
- `/admin/reports`は`users.is_admin = true`のユーザーのみアクセス可能（それ以外はトップへリダイレクト）。未対応の通報一覧を表示し、「レビューを非表示にする」「却下する」をその場で実行できます

### Supabase側で追加が必要な設定

1. `supabase/migrations/0005_reports.sql` を実行
2. 動作確認用に、自分のアカウントを管理者にする場合はSQL Editorで以下を実行
   ```sql
   update public.users set is_admin = true where id = '（自分のuser id）';
   ```

## 次にやること（推奨順）

1. ~~Supabaseプロジェクトを作成し、`implementation_spec.md` のテーブル定義でDBを構築~~
2. ~~認証（Google OAuth + Magic Link）を実装~~ → 完了
3. ~~シナリオ登録機能を実装~~ → 完了
4. ~~レビュー投稿機能を実装~~ → 完了
5. ~~シナリオ詳細ページを本格実装~~ → 完了（引用元・AI集計バーは未接続）
6. ~~レビューへの通報機能~~ → 完了
7. 検索・マイページ・アイコン選択などの残りページを移植

## 既知の制約

- このNext.jsプロジェクトはビルド用サンドボックス環境で作成しました。`next/font/google` によるNoto Sans JPの取得は、外部ネットワーク制限のあるこの環境ではビルド時に失敗しますが、**Vercel上では問題なく取得できます**。ローカル開発時にネットワーク制限のある環境でエラーが出た場合は、一時的にシステムフォントに切り替えて動作確認してください。
