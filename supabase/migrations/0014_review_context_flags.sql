-- ============================================================
-- 0014_review_context_flags.sql
--
-- 「シナリオ以外の要因が大きそう」フィードバック機能。
-- 「参考になった」「通報」とは完全に独立した第3の反応。
--
-- 役割の違い:
--   参考になった   → シナリオ選びの参考になった(reviews.helpful_countに集計、ユーザーの貢献度に反映)
--   シナリオ以外の要因 → KP・卓環境・参加者等の影響が大きそう、という補助情報(何にも自動反映されない)
--   通報          → 規約違反など運営確認が必要(reportsテーブル、非表示化に繋がりうる)
--
-- この機能はレビューの削除・非表示・星評価・「参考になった」集計の
-- いずれにも一切影響を与えない。あくまで読み手への参考情報として
-- 件数を表示するだけの、完全に独立した集計。
-- ============================================================

create table if not exists public.review_context_flags (
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

alter table public.review_context_flags enable row level security;

-- 件数を誰でも見られるようにする(通報のように運営専用の情報ではなく、
-- 読み手への参考情報として公開する設計のため)
create policy "誰でも閲覧可能"
  on public.review_context_flags for select
  using (true);

create policy "本人のみ・自分のレビュー以外にのみ投票可能"
  on public.review_context_flags for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.reviews r
      where r.id = review_id
        and r.is_hidden = false
        and r.user_id <> auth.uid()
    )
  );

create policy "本人のみ取り消し可能"
  on public.review_context_flags for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists review_context_flags_review_id_idx on public.review_context_flags (review_id);
