create or replace function public.confirm_pending(
  p_pending_id uuid,
  p_ls_order_id text,
  p_amount_cents bigint default null
)
returns table(star_id uuid, event_type text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending public.pending_bids%rowtype;
  v_star public.stars%rowtype;
  v_target public.stars%rowtype;
  v_project_id uuid;
  v_event_type text := 'fuel';
begin
  if exists (select 1 from public.pending_bids where lemonsqueezy_order_id = p_ls_order_id) then return; end if;
  select * into v_pending from public.pending_bids where id = p_pending_id and status = 'awaiting_payment' for update;
  if not found then raise exception 'pending bid not found or already processed'; end if;
  if p_amount_cents is not null and p_amount_cents <> v_pending.amount_cents then raise exception 'payment amount mismatch'; end if;

  if v_pending.kind = 'new_star' then
    insert into public.projects(name, logo_url, link_url, x_handle, email, claim_token_hash)
    select v_pending.project_draft->>'name', v_pending.project_draft->>'logo_url', v_pending.project_draft->>'link_url', v_pending.project_draft->>'x_handle', lower(v_pending.project_draft->>'email'), v_pending.claim_token_hash
    returning id into v_project_id;
    insert into public.stars(project_id, total_bid_cents, d_name, d_logo_url, d_link_url, d_x_handle, d_verified, d_is_founding, d_is_demo)
    select v_project_id, v_pending.amount_cents, v_pending.project_draft->>'name', v_pending.project_draft->>'logo_url', v_pending.project_draft->>'link_url', v_pending.project_draft->>'x_handle', false, false, false
    returning * into v_star;
    v_event_type := 'spawn';
  else
    select * into v_star from public.stars where id = v_pending.star_id for update;
    if not found then raise exception 'star not found'; end if;
    update public.stars set total_bid_cents = total_bid_cents + v_pending.amount_cents, updated_at = now() where id = v_star.id returning * into v_star;
  end if;

  select * into v_target from public.stars where status = 'active' and id <> v_star.id order by total_bid_cents desc, entered_at asc limit 1 for update;
  if found and v_star.total_bid_cents > v_target.total_bid_cents and (v_target.immunity_until is null or v_target.immunity_until <= now()) and v_star.total_bid_cents >= (v_target.total_bid_cents * 115) / 100 then
    update public.stars set immunity_until = now() + interval '60 seconds' where id = v_star.id;
    v_event_type := 'singularity_takeover';
  end if;

  update public.pending_bids set status = 'confirmed', confirmed_at = now(), lemonsqueezy_order_id = p_ls_order_id where id = p_pending_id;
  insert into public.bid_events(star_id, project_id, pending_bid_id, amount_cents, resulting_total_cents, event_type) values (v_star.id, v_star.project_id, p_pending_id, v_pending.amount_cents, v_star.total_bid_cents, v_event_type);
  insert into public.realtime_events(topic, payload) values ('galaxy', jsonb_build_object('star_id', v_star.id, 'total_bid_cents', v_star.total_bid_cents, 'event_type', v_event_type, 'name', v_star.d_name));
  return query select v_star.id, v_event_type;
end;
$$;

revoke all on function public.confirm_pending(uuid, text, bigint) from public;
grant execute on function public.confirm_pending(uuid, text, bigint) to service_role;
