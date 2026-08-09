-- ============================================================
-- 0001_init.sql
-- 認証まわりの土台: public.users テーブルと自動作成トリガー
-- Supabase SQL Editor、または `supabase db push` で実行する
-- ============================================================

-- auth.users(Supabase Authが管理)と1:1で紐づくプロフィールテーブル
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '名無しの探索者',
  avatar_icon text not null default 'cat',
  avatar_color text not null default '#2E6B6B',
  taste_tags text[] not null default '{}',
  theme_mode text not null default 'light' check (theme_mode in ('light', 'dark')),
  theme_color text not null default 'wine',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- 誰でもプロフィール(表示名・アイコン等)は閲覧できる
create policy "プロフィールは誰でも閲覧可能"
  on public.users for select
  using (true);

-- 本人だけが自分のプロフィールを更新できる
create policy "本人のみ更新可能"
  on public.users for update
  using (auth.uid() = id);

-- ------------------------------------------------------------
-- auth.users に新規登録があったら、public.users に自動で
-- プロフィール行を作成するトリガー。
-- Google認証の場合は raw_user_meta_data.full_name を表示名の初期値に使う。
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1),
      '名無しの探索者'
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
