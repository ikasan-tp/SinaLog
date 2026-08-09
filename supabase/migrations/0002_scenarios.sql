-- ============================================================
-- 0002_scenarios.sql
-- シナリオ登録機能用のテーブル
-- ============================================================

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_name text,
  circle_name text,
  distribution_url text not null,
  price_text text not null default '無料',
  system_version text,               -- 'クトゥルフ神話TRPG' | '新クトゥルフ神話TRPG'
  setting text,                      -- 舞台
  recommended_players text,
  play_time text,
  has_combat boolean not null default false,
  word_count int,
  description text,
  thumbnail_url text,                -- BOOTH等から取得したOGP画像URL(保存はURLのみ)
  tags text[] not null default '{}',
  required_supplements text[] not null default '{}',
  registered_by uuid references public.users(id) on delete set null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.scenarios enable row level security;

-- 非公開でなければ誰でも閲覧可能
create policy "非公開でなければ誰でも閲覧可能"
  on public.scenarios for select
  using (is_hidden = false);

-- ログインしていれば誰でも新規登録できる
create policy "ログイン済みなら登録可能"
  on public.scenarios for insert
  to authenticated
  with check (auth.uid() = registered_by);

-- 登録者本人は自分が登録したシナリオを更新できる
-- (「誰でも補完できる」仕様にする場合は to authenticated に緩め、
--  registered_by の一致条件を外せばよい。まずは本人限定で始める)
create policy "登録者本人は更新可能"
  on public.scenarios for update
  to authenticated
  using (auth.uid() = registered_by);

create index if not exists scenarios_created_at_idx on public.scenarios (created_at desc);
