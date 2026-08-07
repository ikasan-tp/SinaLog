-- ============================================================
-- 0010_own_hidden_review_visibility.sql
-- 0003_reviews.sql の select ポリシーは is_hidden = false のみを許可しており、
-- 通報により非表示になった自分のレビューが、投稿者本人にもマイページで
-- 見えなくなってしまっていた。本人には常に見えるようにする。
-- ============================================================

create policy "本人は自分のレビューを閲覧可能"
  on public.reviews for select
  to authenticated
  using (auth.uid() = user_id);
