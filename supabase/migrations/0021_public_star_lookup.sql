create or replace function public.get_public_star(p_star_id uuid)
returns setof public.public_stars
language sql
security invoker
stable
set search_path = public
as $$
  select * from public.public_stars where star_id = p_star_id limit 1;
$$;

revoke all on function public.get_public_star(uuid) from public;
grant execute on function public.get_public_star(uuid) to anon, authenticated;
