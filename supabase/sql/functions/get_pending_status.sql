create or replace function public.get_pending_status(p_pending_id uuid)
returns table(status text, star_id uuid)
language sql
security definer
set search_path = public
as $$
  select p.status, p.star_id
  from public.pending_bids p
  where p.id = p_pending_id;
$$;

revoke all on function public.get_pending_status(uuid) from public;
grant execute on function public.get_pending_status(uuid) to anon, authenticated;
