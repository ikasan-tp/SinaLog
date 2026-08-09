-- ============================================================
-- 0003_reviews.sql
-- レビュー投稿機能用のテーブル
-- ============================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,

  role text not null check (role in ('pl', 'kp')),
  play_format text not null check (play_format in ('text', 'voice', 'inperson')),

  modification text not null default 'none' check (modification in ('none', 'partial', 'major')),
  modification_details text[] not null default '{}',
  modification_advice text,

  recommend boolean not null,

  exploration_difficulty text check (exploration_difficulty in ('easy', 'normal', 'severe')),
  combat_intensity text check (combat_intensity in ('none', 'light', 'heavy')),
  kp_or_pc_load text check (kp_or_pc_load in ('light', 'normal', 'heavy')),

  replay_intention text check (replay_intention in ('yes', 'neutral', 'no')),
  group_dependency text check (group_dependency in ('scenario', 'neutral', 'group')),
  session_note text,

  content_warning_adequacy text check (content_warning_adequacy in ('insufficient', 'adequate', 'excessive')),

  homage_answer text check (homage_answer in ('none', 'credited', 'concerning')),
  homage_note text,

  ai_usage_answer text check (ai_usage_answer in ('no', 'yes', 'unknown')),

  price_fairness text check (price_fairness in ('over', 'fair', 'under')),

  good_point text not null,
  concern_point text,
  spoiler_text text,

  elements text[] not null default '{}',
  tags text[] not null default '{}',

  helpful_count int not null default 0,
  is_hidden boolean not null default false,

  created_at timestamptz not null default now(),

  -- 1人のユーザーは1シナリオにつき1件のレビューまで(編集で対応する想定)
  unique (scenario_id, user_id)
);

alter table public.reviews enable row level security;

create policy "非公開でなければ誰でも閲覧可能"
  on public.reviews for select
  using (is_hidden = false);

create policy "ログイン済みなら投稿可能"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "投稿者本人は更新・削除可能"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id);

create policy "投稿者本人は削除可能"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists reviews_scenario_id_idx on public.reviews (scenario_id);
create index if not exists reviews_user_id_idx on public.reviews (user_id);

-- ------------------------------------------------------------
-- シナリオごとの集計ビュー(おすすめ度・特徴の多数派 等)
-- scenario_detail.html の表示にそのまま対応する
-- ------------------------------------------------------------
create or replace view public.scenario_stats as
select
  scenario_id,
  count(*) as review_count,
  count(*) filter (where recommend) as recommend_count,
  round(100.0 * count(*) filter (where recommend) / nullif(count(*), 0)) as recommend_pct,

  mode() within group (order by exploration_difficulty) filter (where exploration_difficulty is not null) as top_exploration_difficulty,
  mode() within group (order by kp_or_pc_load) filter (where kp_or_pc_load is not null) as top_kp_or_pc_load,
  mode() within group (order by combat_intensity) filter (where combat_intensity is not null) as top_combat_intensity,

  count(*) filter (where play_format = 'text') as text_count,
  count(*) filter (where play_format = 'voice') as voice_count,
  count(*) filter (where play_format = 'inperson') as inperson_count,

  count(*) filter (where homage_answer = 'none') as homage_none_count,
  count(*) filter (where homage_answer = 'credited') as homage_credited_count,
  count(*) filter (where homage_answer = 'concerning') as homage_concerning_count,

  count(*) filter (where ai_usage_answer = 'no') as ai_no_count,
  count(*) filter (where ai_usage_answer = 'yes') as ai_yes_count,
  count(*) filter (where ai_usage_answer = 'unknown') as ai_unknown_count
from public.reviews
where is_hidden = false
group by scenario_id;
