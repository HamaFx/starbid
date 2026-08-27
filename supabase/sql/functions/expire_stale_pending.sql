create or replace function public.expire_stale_pending()
returns integer
language sql
security definer
set search_path = public
as $$
  with expired as (
    update public.pending_bids
    set status = 'expired'
    where status = 'awaiting_payment'
      and created_at < now() - interval '30 minutes'
    returning id
  )
  select count(*)::integer from expired;
$$;

revoke all on function public.expire_stale_pending() from public;
grant execute on function public.expire_stale_pending() to service_role;
