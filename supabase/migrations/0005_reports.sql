-- ============================================================
-- 0005_reports.sql
-- レビューへの通報機能用のテーブル
-- ============================================================

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  reporter_id uuid not null references public.users(id) on delete cascade,
  reason text not null,               -- '誹謗中傷' | 'スパム' | 'その他' 等、自由記述でも可
  comment text,
  status text not null default 'pending' check (status in ('pending', 'dismissed', 'hidden')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,

  -- 同じ人が同じレビューを何度も通報できないようにする
  unique (review_id, reporter_id)
);

alter table public.reports enable row level security;

-- ログイン済みなら誰でも通報できる(内容そのものは本人と管理者しか見せない)
create policy "ログイン済みなら通報可能"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- 管理者のみ一覧を閲覧できる
create policy "管理者のみ閲覧可能"
  on public.reports for select
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- 管理者のみステータスを更新できる
create policy "管理者のみ更新可能"
  on public.reports for update
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create index if not exists reports_status_idx on public.reports (status);
