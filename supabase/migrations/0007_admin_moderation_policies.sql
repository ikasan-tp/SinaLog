-- ============================================================
-- 0007_admin_moderation_policies.sql
-- 管理者が通報対応でレビュー/シナリオを非表示にできるようにする。
--
-- 背景（バグ修正）:
-- 0003_reviews.sql の update ポリシーは「投稿者本人のみ」に限定されており、
-- app/scenarios/[id]/report-actions.ts の hideReviewFromReport() が
-- 管理者権限で reviews.is_hidden を更新しようとしても、
-- RLSに阻まれて実際には何も更新されない（エラーも出ないため気づきにくい）。
-- 同様に、掲載不可作者一覧などで管理者がシナリオ自体を非表示にしたい場合も
-- scenarios テーブル側に管理者用の更新ポリシーが無いため更新できない。
-- ============================================================

create policy "管理者はレビューを更新可能"
  on public.reviews for update
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "管理者はシナリオを更新可能"
  on public.scenarios for update
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );
