-- ============================================================
-- 0004_review_aggregates.sql
-- reviews.elements / reviews.tags (text[]) を展開して件数集計する。
-- Postgresの配列カラムはSELECTで直接GROUP BYできないため、
-- unnestして数え上げるビューを用意する。
-- ============================================================

create or replace view public.scenario_element_counts as
select
  scenario_id,
  element,
  count(*) as count
from public.reviews, unnest(elements) as element
where is_hidden = false
group by scenario_id, element;

create or replace view public.scenario_tag_counts as
select
  scenario_id,
  tag,
  count(*) as count
from public.reviews, unnest(tags) as tag
where is_hidden = false
group by scenario_id, tag
order by count desc;
