-- ============================================================
-- 0006_excluded_authors.sql
-- 掲載停止を申請した作者・サークルの一覧
-- ============================================================

create table if not exists public.excluded_authors (
  id uuid primary key default gen_random_uuid(),
  author_or_circle_name text not null,
  requested_at timestamptz not null default now()
);

alter table public.excluded_authors enable row level security;

-- 誰でも閲覧できる(公開ページのため)
create policy "誰でも閲覧可能"
  on public.excluded_authors for select
  to anon, authenticated
  using (true);

-- 登録・更新・削除は管理者のみ(申請はメール等サイト外で受け付け、管理者が手動で登録する運用)
create policy "管理者のみ登録可能"
  on public.excluded_authors for insert
  to authenticated
  with check (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "管理者のみ削除可能"
  on public.excluded_authors for delete
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create index if not exists excluded_authors_requested_at_idx
  on public.excluded_authors (requested_at desc);
