create or replace function public.flag_project_chargeback(p_order_id text, p_reason text default 'Payment dispute')
returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_project_id uuid; v_flag_id uuid;
begin
  select s.project_id into v_project_id from public.bid_events e join public.stars s on s.id = e.star_id join public.pending_bids b on b.id = e.pending_bid_id where b.lemonsqueezy_order_id = p_order_id limit 1;
  if v_project_id is null then raise exception 'order is not associated with a project'; end if;
  update public.stars set status = 'banned', updated_at = now() where project_id = v_project_id;
  insert into public.moderation_flags(project_id, reason, source) values (v_project_id, p_reason, 'admin') returning id into v_flag_id;
  return v_flag_id;
end;
$$;
revoke all on function public.flag_project_chargeback(text, text) from public;
grant execute on function public.flag_project_chargeback(text, text) to service_role;
