create or replace function public.create_pending_new_star(p_grant_id uuid, p_draft jsonb, p_claim_token_hash text, p_amount_cents bigint)
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_id uuid;
begin
  if p_amount_cents < 300 then raise exception 'minimum bid is 300 cents'; end if;
  if length(coalesce(p_claim_token_hash, '')) <> 64 then raise exception 'invalid claim token hash'; end if;
  if char_length(btrim(coalesce(p_draft->>'name', ''))) not between 1 and 40 then raise exception 'invalid project name'; end if;
  if coalesce(p_draft->>'email', '') = '' or coalesce(p_draft->>'link_url', '') = '' then raise exception 'project contact fields are required'; end if;
  delete from public.action_grants where id = p_grant_id and kind = 'new_star' and expires_at > now();
  if not found then raise exception 'invalid or expired action grant'; end if;
  insert into public.pending_bids(kind, project_draft, claim_token_hash, amount_cents) values ('new_star', p_draft, p_claim_token_hash, p_amount_cents) returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.create_pending_new_star(uuid, jsonb, text, bigint) from public;
grant execute on function public.create_pending_new_star(uuid, jsonb, text, bigint) to anon, authenticated, service_role;

create or replace function public.create_pending_fuel(p_star_id uuid, p_claim_token text, p_amount_cents bigint)
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_id uuid;
begin
  if p_amount_cents < 300 then raise exception 'minimum bid is 300 cents'; end if;
  if not exists (select 1 from public.stars s join public.projects p on p.id = s.project_id where s.id = p_star_id and s.status = 'active' and p.claim_token_hash = encode(extensions.digest(convert_to(p_claim_token, 'UTF8'), 'sha256'::text), 'hex')) then raise exception 'invalid claim token'; end if;
  insert into public.pending_bids(kind, star_id, amount_cents) values ('fuel', p_star_id, p_amount_cents) returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.create_pending_fuel(uuid, text, bigint) from public;
grant execute on function public.create_pending_fuel(uuid, text, bigint) to anon, authenticated, service_role;
