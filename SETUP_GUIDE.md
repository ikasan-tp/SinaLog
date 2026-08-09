# シナログ セットアップ・使用ガイド

ゼロから本番公開までの手順と、各機能の使い方をまとめたもの。
技術的な設計の詳細は `implementation_spec.md`、コードの実装状況は `README.md` を参照。

---

## 0. 事前に用意するもの

| 必要なもの | 用途 | 費用 |
|---|---|---|
| Node.js 20以上 | ローカル開発 | 無料 |
| [Supabase](https://supabase.com) アカウント | DB・認証・ログイン用メール送信 | 無料枠内 |
| [Google Cloud](https://console.cloud.google.com) アカウント | Googleログイン用のOAuthクライアント発行 | 無料 |
| [Vercel](https://vercel.com) アカウント | 本番公開先 | 無料（Hobbyプラン） |
| GitHubアカウント（推奨） | Vercelとの連携に使うと自動デプロイできる | 無料 |

---

## 1. Supabaseプロジェクトを作る

1. [supabase.com](https://supabase.com) で新規プロジェクトを作成（リージョンは `Northeast Asia (Tokyo)` を推奨）
2. 作成後、プロジェクトのSQL Editorを開き、`supabase/migrations/` 内のファイルを **番号順に** 実行する
   ```
   0001_init.sql
   0002_scenarios.sql
   0003_reviews.sql
   0004_review_aggregates.sql
   0005_reports.sql
   0006_excluded_authors.sql
   0007_admin_moderation_policies.sql
   0008_favorites.sql
   0009_scenario_delete_policy.sql
   0010_own_hidden_review_visibility.sql
   0011_admin_table.sql
   0012_session_formats.sql
   0013_review_helpful_votes.sql
   0014_review_context_flags.sql
   0015_public_profile.sql
   0016_protect_reviewed_scenarios.sql
   ```
   1ファイルずつ中身をコピーしてSQL Editorに貼り付け、実行（Run）すればよい。
3. 左メニュー「Table Editor」で `users` `scenarios` `reviews` `reports` の4テーブルが作成されていれば成功

---

## 2. Googleログインを有効にする

### 2-1. Google Cloud側でOAuthクライアントを発行

1. [Google Cloud Console](https://console.cloud.google.com) で新規プロジェクトを作成（サイト用に1つ作ればよい）
2. 「APIとサービス」→「OAuth同意画面」を設定
   - User Type: 外部
   - アプリ名・サポートメールなど最低限の項目を入力すればよい
3. 「認証情報」→「認証情報を作成」→「OAuthクライアントID」
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みのリダイレクトURIに、**Supabaseが指定するURL** を追加する（次の手順2-2で確認できるものをコピーしてくる）
4. 発行された「クライアントID」と「クライアントシークレット」を控えておく

### 2-2. Supabase側でGoogleプロバイダを有効化

1. Supabaseダッシュボード → Authentication → Providers → **Google** を開く
2. 有効化し、2-1で発行したクライアントID・シークレットを入力
3. この画面に表示されている「Callback URL」をコピーし、2-1の「承認済みのリダイレクトURI」に追加する（順序が前後してもどちらから先に設定してもよい）

### 2-3. メールログイン(Magic Link)の確認

Authentication → Providers → **Email** が有効になっていることを確認する（初期状態で有効なはず）。追加設定は不要。

### 2-4. リダイレクトURLの登録

Authentication → URL Configuration → **Redirect URLs** に以下を追加する。

- 開発時: `http://localhost:3000/auth/callback`
- 本番: `https://<実際の公開ドメイン>/auth/callback`

### 2-5. Google認証画面に「Supabaseのプロジェクトの英数字URL」ではなく「シナログ」と表示させる

デフォルトのままだと、Googleログインを押したときの同意画面が
`◯◯◯◯.supabase.co に進む` のような、意味の分からないURLで表示されてしまう。
これはブランディング上好ましくないので、次の設定で解消する。

**無料でできる範囲（ここだけで、ほぼ解決する）**

1. [Google Cloud Console](https://console.cloud.google.com) → 対象プロジェクト → 「APIとサービス」→「OAuth同意画面」を開く
2. アプリ名を **「シナログ」**（または `Sinalog`）に設定する。ここが同意画面の一番大きな文字として表示される
3. ロゴ画像（正方形・120×120px以上）をアップロードする
4. 「アプリのドメイン」に、本番公開ドメインの以下3つを設定する
   - アプリケーションのホームページ: `https://<公開ドメイン>`
   - プライバシーポリシーへのリンク: `https://<公開ドメイン>/terms`（このアプリの利用規約ページを流用してよい）
   - 利用規約へのリンク: `https://<公開ドメイン>/terms`
5. 「承認済みドメイン」に公開ドメイン（`https://`無し、例: `sinalog.example`）を追加する
   - 事前に [Google Search Console](https://search.google.com/search-console) でそのドメインの所有権を確認しておく必要がある
6. スコープは `userinfo.email` `userinfo.profile` `openid` の非機微スコープのみにしておく（追加の審査が不要で、公開までが早い）
7. 「公開ステータス」を **本番公開（Publish）** にする（テストモードのままだとテストユーザー以外はブランディングも正しく表示されない）

ここまで設定すると、同意画面の見出しは `シナログ に進む` のように表示されるようになる（反映まで最大24時間ほどかかることがある）。

**それでも一部にSupabaseのプロジェクトURLが表示される場合**

Google側の同意画面は、仕様上「コールバック先のドメイン」も参照する作りになっており、
Supabase Authをそのまま使う限りコールバック先は `https://<プロジェクトref>.supabase.co/auth/v1/callback` になる。
上記の設定でアプリ名・ロゴ・ドメインは正しく表示されるようになるが、
細部の表示までSupabaseのURLを完全に消したい場合は、Supabaseの
[Custom Domains](https://supabase.com/docs/guides/platform/custom-domains)（有料アドオン、Proプラン以上が前提）を使い、
`auth.<公開ドメイン>` のような独自ドメインをSupabase Authに割り当てる方法がある。
費用をかけたくない場合は、上記の無料設定だけでも実用上は十分にブランディングされた見た目になる。

---

## 3. ローカルで動かす

```bash
cd sinalog
npm install
cp .env.local.example .env.local
```

`.env.local` を開き、Supabaseダッシュボード → Project Settings → API に表示されている値で書き換える。

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

```bash
npm run dev
```

`http://localhost:3000` を開いて動作確認する。

---

## 4. 自分を管理者にする

通報の管理画面（`/admin/reports`）は管理者だけがアクセスできる。まずログインを1回行い、ユーザーが作成された状態にしてから、SupabaseのSQL Editorで以下を実行する。

管理者フラグは`public.users`ではなく、公開APIから直接読み取れない`public.admins`テーブルで管理している（理由は「9. セキュリティについて」を参照）。

```sql
-- 自分のメールアドレスで検索してuser idを確認
select id, email from auth.users where email = 'あなたのメールアドレス';

-- 確認したidを使って管理者権限を付与
insert into public.admins (user_id) values ('上で確認したid');
```

管理者権限を外す場合は `delete from public.admins where user_id = '対象のid';` を実行する。

---

## 5. Vercelで公開する

1. このプロジェクトをGitHubリポジトリにpushする
2. [vercel.com](https://vercel.com) で「New Project」→ そのリポジトリを選択
3. Environment Variablesに、`.env.local` と同じ内容を設定する
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy を実行
5. 発行された本番URL（例: `https://sinalog.vercel.app`）を、
   - Supabase の Redirect URLs（手順2-4）
   - Google CloudのOAuthリダイレクトURI（手順2-1）
   
   の両方に追加する（`https://<本番ドメイン>/auth/callback` の形で）

独自ドメインを使う場合は、Vercelの「Domains」設定でドメインを追加し、上記のURLもそのドメインに合わせて登録し直す。

---

## 6. サイトの使い方（利用者向け）

| やりたいこと | 手順 |
|---|---|
| シナリオを探す | トップページの一覧、または検索から（スマホではヘッダーのハンバーガーアイコンから検索欄を開く） |
| レビューを書く | シナリオ詳細ページの「レビューを投稿する」→ ログインが求められたらGoogleかメールでログイン |
| 投稿したレビューを編集・削除する | マイページの「投稿したレビュー」タブ → 「編集」（投稿フォームに内容が入った状態で開く）または「削除」 |
| シナリオを登録する | ヘッダーから「シナリオを登録する」→ 頒布ページURLを貼って「情報を取得」→ 足りない項目を埋めて登録 |
| 登録したシナリオ情報を直す | マイページの「登録したシナリオ」タブ → 「情報を編集」（編集できるのは登録した本人のみ） |
| シナリオをお気に入りに追加する | シナリオ詳細ページの「お気に入りに追加」→ マイページの「好きなシナリオ」タブで一言メモを書ける |
| 好きな傾向タグを設定する | マイページ上部のプロフィール欄 →「好きな傾向」の「編集する」 |
| アイコン・表示名を変える | マイページ上部の「アイコンを変更」（アイコン・カラー）／「アカウント設定」タブの表示名「変更する」 |
| 好みのテーマ・色に変える | マイページの「アカウント設定」タブ → テーマ切替UIから（ライト/ダーク・8色のアクセントカラー） |
| アカウントを削除する | マイページの「アカウント設定」タブ → 「アカウントを削除する」→ 確認して削除（投稿済みレビュー・登録シナリオ・お気に入りも削除される） |
| 不適切なレビューを見つけた | レビュー右下の「通報する」→ 理由を選んで送信 |

### 投稿のハードルを下げる設計について

- レビューは「良かった点」だけが必須。他はすべて任意項目
- シナリオ登録も「タイトル・価格・頒布元」の3つだけあれば登録できる
- 低評価のレビューは、詳細ページで初期非表示（「気になる点も含む」タブで見られる）

---

## 7. 運営者としてやること（公開後）

| タイミング | やること |
|---|---|
| 随時 | `/admin/reports` を確認し、通報が来ていれば対応（非表示にする／却下する） |
| 月1回程度 | Supabaseの無料枠の使用量（Table Editor横のUsage）を確認 |
| 7日以上アクセスが無さそうな時期 | SupabaseプロジェクトはDB無アクセスが続くと一時停止する。[UptimeRobot](https://uptimerobot.com)等の無料の外形監視サービスに登録し、数分おきにトップページへpingを送るよう設定しておくと自動で防げる |

---

## 8. よくあるトラブル

| 症状 | 原因の可能性 |
|---|---|
| Googleログインで「redirect_uri_mismatch」エラー | 手順2-1・2-2のリダイレクトURIが一致していない。末尾のスラッシュの有無まで確認する |
| Magic Linkのメールが届かない | 迷惑メールフォルダを確認。Supabase無料枠のメール送信数上限に達している可能性もある（Authentication > Logsで送信履歴を確認できる） |
| ローカルではOKだが本番でログインできない | 本番ドメインをSupabase・Google Cloud両方のリダイレクトURL設定に追加し忘れている典型パターン |
| `/admin/reports` にアクセスできない | 手順4の管理者権限付与を忘れている、またはSQLのuser idを間違えている |
| ログイン時に `No API key found in request` エラーが出る | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` が空のままリクエストが送られている。①プロジェクト直下に`.env.local`が実際に存在するか、②`.env.local.example`のままの値(`your-anon-key`等)になっていないか、③値を書き換えた後に`npm run dev`を再起動したか、④Vercel本番の場合はEnvironment Variables設定後に再デプロイしたか、を確認する。現在のコードはこの設定漏れがあるとブラウザのコンソールに分かりやすい日本語エラーを表示するようにしてある |
| ビルドがフォント関連で失敗する | Next.jsのビルド環境からGoogle Fontsへのネットワークアクセスが必要。社内プロキシ環境等では発生しうるが、Vercel上では問題なく取得できる |
| マイページの「アカウントを削除する」でログイン情報自体は残ってしまう | `SUPABASE_SERVICE_ROLE_KEY`が未設定だとこの挙動になる（投稿データは削除される）。ログイン情報ごと完全に消したい場合は`.env.local`にこのキーを追加する（`.env.local.example`参照） |
| シナリオ・レビューの「情報を編集」ボタンが表示されない／編集画面に入れない | 編集できるのは登録者・投稿者本人のみ。別アカウントでログインしている、またはログインしていない可能性がある |
