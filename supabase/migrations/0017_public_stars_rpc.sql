create or replace function public.list_public_stars()
returns setof public.public_stars
language sql
security definer
stable
set search_path = public
as $$
  select *
  from public.public_stars
  order by total_bid_cents desc, entered_at asc;
$$;

revoke all on function public.list_public_stars() from public;
grant execute on function public.list_public_stars() to anon, authenticated;
