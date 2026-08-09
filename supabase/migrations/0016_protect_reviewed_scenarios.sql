-- ============================================================
-- 0016_protect_reviewed_scenarios.sql
--
-- レビューが1件でも投稿されているシナリオは、登録者本人であっても
-- 削除できないようにする(他人が書いたレビューが道連れで消えてしまうため)。
-- 管理者は従来どおり削除できる(0011_admin_table.sqlのポリシーは変更しない)。
-- ============================================================

drop policy if exists "登録者本人はシナリオを削除可能" on public.scenarios;

create policy "登録者本人はシナリオを削除可能"
  on public.scenarios for delete
  to authenticated
  using (
    auth.uid() = registered_by
    and not exists (select 1 from public.reviews r where r.scenario_id = scenarios.id)
  );
