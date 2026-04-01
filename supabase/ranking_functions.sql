-- ==========================================
-- Ranking RPC functions (time-based)
-- Run this in Supabase SQL Editor
-- ==========================================

-- Interest ranking with genre, time, gender & age filters
create or replace function public.ranking_interests(
  p_genre text default null,
  p_since timestamptz default null,
  p_gender text default null,
  p_age_group text default null
)
returns table (product_id bigint, cnt bigint) as $$
  select ui.product_id, count(*) as cnt
  from public.user_interests ui
  join public.products p on p.id = ui.product_id
  left join public.profiles pr on pr.id = ui.user_id
  where (p_since is null or ui.created_at >= p_since)
    and (p_genre is null or p.genre = p_genre)
    and (p_gender is null or pr.gender = p_gender)
    and (p_age_group is null or pr.age_group = p_age_group)
  group by ui.product_id
  order by cnt desc
  limit 50;
$$ language sql security definer stable;

-- Purchase ranking with genre, time, gender & age filters
create or replace function public.ranking_purchases(
  p_genre text default null,
  p_since timestamptz default null,
  p_gender text default null,
  p_age_group text default null
)
returns table (product_id bigint, cnt bigint) as $$
  select up.product_id, count(*) as cnt
  from public.user_purchases up
  join public.products p on p.id = up.product_id
  left join public.profiles pr on pr.id = up.user_id
  where (p_since is null or up.created_at >= p_since)
    and (p_genre is null or p.genre = p_genre)
    and (p_gender is null or pr.gender = p_gender)
    and (p_age_group is null or pr.age_group = p_age_group)
  group by up.product_id
  order by cnt desc
  limit 50;
$$ language sql security definer stable;
