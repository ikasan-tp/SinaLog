-- ============================================================
-- 0013_review_helpful_votes.sql
--
-- 「参考になった」を、1ユーザー1レビューにつき1票の実データとして
-- 正しく記録できるようにする。
--
-- これまでの実装(app/scenarios/[id]/actions.ts markHelpful)は
-- reviews.helpful_count を単純にインクリメントするだけで、
-- 誰が押したかの記録が無く、同じ人が何度でも加算できてしまっていた。
-- この投票データを正としてhelpful_countを再構築する。
-- ============================================================

create table if not exists public.review_helpful_votes (
  review_id uuid not null references public.reviews(id) on delete cascade,
  voter_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, voter_id)
);

alter table public.review_helpful_votes enable row level security;

-- 誰の投票かは公開情報として扱わないが、件数の可視化・自分の投票状態の判定のために
-- 行自体はログイン中の全員が閲覧できるようにする(個人を特定できる機微情報ではない)。
create policy "ログイン済みなら閲覧可能"
  on public.review_helpful_votes for select
  to authenticated
  using (true);

-- 投票は「自分の投票としてのみ」「自分が書いたレビューには投票不可」「非公開レビューには投票不可」
-- という条件をDB制約(RLS)としても強制する。アプリ側のチェックだけに頼らない。
create policy "本人のみ・自分のレビュー以外にのみ投票可能"
  on public.review_helpful_votes for insert
  to authenticated
  with check (
    auth.uid() = voter_id
    and exists (
      select 1 from public.reviews r
      where r.id = review_id
        and r.is_hidden = false
        and r.user_id <> auth.uid()
    )
  );

-- 取り消し(投票の削除)は本人のみ
create policy "本人のみ取り消し可能"
  on public.review_helpful_votes for delete
  to authenticated
  using (auth.uid() = voter_id);

create index if not exists review_helpful_votes_review_id_idx on public.review_helpful_votes (review_id);
create index if not exists review_helpful_votes_voter_id_idx on public.review_helpful_votes (voter_id);

-- ------------------------------------------------------------
-- reviews.helpful_count を review_helpful_votes の実データと
-- 常に一致させるためのトリガー。
-- これにより、投票の追加・取り消しの度に正しい件数へ自動更新され、
-- 「画面上の数値を足し引きするだけ」にならない(DBが常に正)。
-- ------------------------------------------------------------
create or replace function public.sync_review_helpful_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.reviews set helpful_count = helpful_count + 1 where id = new.review_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.reviews set helpful_count = greatest(helpful_count - 1, 0) where id = old.review_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists review_helpful_votes_sync on public.review_helpful_votes;
create trigger review_helpful_votes_sync
  after insert or delete on public.review_helpful_votes
  for each row execute function public.sync_review_helpful_count();

-- これまでの helpful_count は「誰が押したか」の記録が無い簡易カウンタだったため、
-- 実データ(review_helpful_votes)と対応しない値が入っている。ゼロにリセットして
-- 今後は上のトリガー経由でのみ増減させる(必要であれば、過去の投票者が
-- 判明している場合はここで review_helpful_votes に手動で insert して復元できる)。
update public.reviews set helpful_count = 0;

-- ------------------------------------------------------------
-- ユーザー単位のレビュー貢献度(累計「参考になった」数)。
-- 非公開(is_hidden = true)のレビューは含めない。
-- レビューが削除された場合は on delete cascade で
-- review_helpful_votes / reviews 自体が消えるため、自動的に集計から外れる。
-- ------------------------------------------------------------
create or replace view public.user_review_reputation as
select
  r.user_id,
  count(*) as review_count,
  coalesce(sum(r.helpful_count), 0) as helpful_total
from public.reviews r
where r.is_hidden = false
group by r.user_id;
