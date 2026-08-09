-- ============================================================
-- 0009_scenario_delete_policy.sql
-- マイページの「登録したシナリオ」削除、およびアカウント削除機能で
-- 自分が登録したシナリオを削除できるようにする。
-- (0002_scenarios.sql には delete ポリシーが無く、これまで登録者本人でも
--  シナリオを削除できなかった)
-- ============================================================

create policy "登録者本人はシナリオを削除可能"
  on public.scenarios for delete
  to authenticated
  using (auth.uid() = registered_by);

create policy "管理者はシナリオを削除可能"
  on public.scenarios for delete
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- 0002_scenarios.sql の select ポリシーは is_hidden = false のみを許可しており、
-- 非表示になった自分のシナリオが、登録者本人にもマイページで見えなくなってしまっていた。
create policy "登録者本人は自分のシナリオを閲覧可能"
  on public.scenarios for select
  to authenticated
  using (auth.uid() = registered_by);
