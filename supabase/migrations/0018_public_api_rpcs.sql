create or replace function public.list_public_bid_events(p_limit integer default 50)
returns table(star_id uuid, amount_cents bigint, resulting_total_cents bigint, event_type text, created_at timestamptz)
language sql security definer stable set search_path = public
as $$
  select e.star_id, e.amount_cents, e.resulting_total_cents, e.event_type, e.created_at
  from public.bid_events e
  order by e.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
$$;
revoke all on function public.list_public_bid_events(integer) from public;
grant execute on function public.list_public_bid_events(integer) to anon, authenticated;

create or replace function public.get_star_analytics(p_star_id uuid, p_claim_token text)
returns table(total_clicks bigint, total_bid_events bigint, total_bid_cents bigint, last_bid_at timestamptz)
language sql security definer stable set search_path = public
as $$
  select
    (select count(*) from public.star_clicks c where c.star_id = p_star_id),
    (select count(*) from public.bid_events e where e.star_id = p_star_id),
    (select s.total_bid_cents from public.stars s join public.projects p on p.id = s.project_id where s.id = p_star_id and encode(digest(p_claim_token, 'sha256'), 'hex') = p.claim_token_hash),
    (select max(e.created_at) from public.bid_events e where e.star_id = p_star_id and exists (select 1 from public.stars s join public.projects p on p.id = s.project_id where s.id = p_star_id and encode(digest(p_claim_token, 'sha256'), 'hex') = p.claim_token_hash));
$$;
revoke all on function public.get_star_analytics(uuid, text) from public;
grant execute on function public.get_star_analytics(uuid, text) to anon, authenticated;
