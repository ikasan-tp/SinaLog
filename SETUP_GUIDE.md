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

```sql
-- 自分のメールアドレスで検索してuser idを確認
select id, email from auth.users where email = 'あなたのメールアドレス';

-- 確認したidを使って管理者権限を付与
update public.users set is_admin = true where id = '上で確認したid';
```

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
| シナリオを探す | トップページの一覧、または検索から |
| レビューを書く | シナリオ詳細ページの「レビューを投稿する」→ ログインが求められたらGoogleかメールでログイン |
| シナリオを登録する | ヘッダーから「シナリオを登録する」→ 頒布ページURLを貼って「情報を取得」→ 足りない項目を埋めて登録 |
| 好みのテーマ・色に変える | マイページの「アカウント設定」→ テーマ切替UIから（ライト/ダーク・8色のアクセントカラー） |
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
| ビルドがフォント関連で失敗する | Next.jsのビルド環境からGoogle Fontsへのネットワークアクセスが必要。社内プロキシ環境等では発生しうるが、Vercel上では問題なく取得できる |
