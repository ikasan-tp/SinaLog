-- ============================================================
-- 0015_public_profile.sql
-- 公開マイページ(/u/[id])に必要なスキーマ変更。
-- ============================================================

-- 自己紹介欄
alter table public.users
  add column if not exists bio text;

-- お気に入り(favorites)は、これまで本人しか閲覧できなかった(0008_favorites.sql参照)。
-- 公開マイページで「おすすめシナリオ」として表示するために、閲覧を公開する。
-- insert/update/delete は引き続き本人のみ(0008_favorites.sqlのポリシーのまま変更なし)。
drop policy if exists "本人のみ閲覧可能" on public.favorites;
create policy "誰でも閲覧可能"
  on public.favorites for select
  using (true);
