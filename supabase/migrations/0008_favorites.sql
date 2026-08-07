-- ============================================================
-- 0008_favorites.sql
-- 「好きなシナリオ」機能用のテーブル（マイページで使用）
-- ============================================================

create table if not exists public.favorites (
  user_id uuid not null references public.users(id) on delete cascade,
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  primary key (user_id, scenario_id)
);

alter table public.favorites enable row level security;

-- 今のところ公開プロフィールpage(他人のマイページ)が無いため、本人のみ閲覧可能にしておく。
-- 将来「他の人の好きなシナリオも見られる」機能を追加する場合は、
-- using (true) に緩めればよい。
create policy "本人のみ閲覧可能"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

create policy "本人のみ追加可能"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "本人のみ更新可能"
  on public.favorites for update
  to authenticated
  using (auth.uid() = user_id);

create policy "本人のみ削除可能"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists favorites_user_id_idx on public.favorites (user_id);
create index if not exists favorites_scenario_id_idx on public.favorites (scenario_id);
