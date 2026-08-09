-- ============================================================
-- 0011_admin_table.sql
-- セキュリティ修正: 管理者フラグを public.users から分離する。
--
-- 背景:
-- 0001_init.sql の "プロフィールは誰でも閲覧可能" (using (true)) は
-- users テーブルの select を行単位で全開放しているため、
-- is_admin がこのテーブルの列にある限り、anon キーを持つ人なら誰でも
--   GET /rest/v1/users?select=id,display_name,is_admin&is_admin=eq.true
-- のようにSupabaseのREST APIを直接叩くだけで「誰が管理者か」を
-- 一覧取得できてしまう(アプリのUIをそもそも経由しない)。
-- PostgresのRLSは行単位の制御であり列単位では絞れないため、
-- is_admin を別テーブルに分離し、判定はSECURITY DEFINER関数経由のみで
-- 行えるようにする(個々のuser_idについてtrue/falseは返せるが、
-- 管理者の一覧を直接SELECTすることはできない)。
-- ============================================================

create table if not exists public.admins (
  user_id uuid primary key references public.users(id) on delete cascade
);

-- 既存の is_admin = true だったユーザーを移行
insert into public.admins (user_id)
select id from public.users where is_admin = true
on conflict (user_id) do nothing;

alter table public.admins enable row level security;
-- select/insert/update/delete のポリシーを一切作らない = anon/authenticatedからは
-- 直接テーブルを読み書きできない(SECURITY DEFINER関数からのみアクセスされる想定)。

-- 「自分(または指定したuser_id)が管理者かどうか」だけを返す関数。
-- SECURITY DEFINER のため、呼び出し元のRLS権限に関わらずadminsテーブルを参照できるが、
-- 戻り値は真偽値のみで、管理者一覧を列挙することはできない。
create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = check_user_id);
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to anon, authenticated;

-- 既存のRLSポリシーを、users.is_admin ではなく is_admin() 関数を使う形に張り替える
drop policy if exists "管理者のみ閲覧可能" on public.reports;
create policy "管理者のみ閲覧可能"
  on public.reports for select
  to authenticated
  using (public.is_admin());

drop policy if exists "管理者のみ更新可能" on public.reports;
create policy "管理者のみ更新可能"
  on public.reports for update
  to authenticated
  using (public.is_admin());

drop policy if exists "管理者のみ登録可能" on public.excluded_authors;
create policy "管理者のみ登録可能"
  on public.excluded_authors for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "管理者のみ削除可能" on public.excluded_authors;
create policy "管理者のみ削除可能"
  on public.excluded_authors for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "管理者はレビューを更新可能" on public.reviews;
create policy "管理者はレビューを更新可能"
  on public.reviews for update
  to authenticated
  using (public.is_admin());

drop policy if exists "管理者はシナリオを更新可能" on public.scenarios;
create policy "管理者はシナリオを更新可能"
  on public.scenarios for update
  to authenticated
  using (public.is_admin());

drop policy if exists "管理者はシナリオを削除可能" on public.scenarios;
create policy "管理者はシナリオを削除可能"
  on public.scenarios for delete
  to authenticated
  using (public.is_admin());

-- users テーブルから is_admin 列を削除(公開APIから完全に取得不可能にする)
alter table public.users drop column if exists is_admin;
