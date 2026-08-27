-- Security hardening for public access, reports, and privileged moderation actions.
-- This migration is intentionally additive; apply it after the existing schema migrations.


revoke select on public.projects from anon, authenticated;
revoke select on public.realtime_events from anon, authenticated;
revoke all on public.moderation_flags from anon, authenticated;
revoke all on public.pending_bids from anon, authenticated;

create index if not exists moderation_flags_project_created_idx
  on public.moderation_flags (project_id, created_at desc);

create or replace function public.report_star(p_project_id uuid, p_reason text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not exists (
    select 1 from public.stars
    where project_id = p_project_id and status = 'active'
  ) then
    raise exception 'project not found';
  end if;
  if char_length(btrim(p_reason)) not between 1 and 500 then
    raise exception 'invalid report reason';
  end if;

  select id into v_id
  from public.moderation_flags
  where project_id = p_project_id
    and status = 'pending'
    and reason = btrim(p_reason)
    and created_at > now() - interval '1 hour'
  limit 1;

  if v_id is not null then
    return v_id;
  end if;

  insert into public.moderation_flags(project_id, reason)
  values (p_project_id, btrim(p_reason))
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.report_star(uuid, text) from public;
grant execute on function public.report_star(uuid, text) to anon, authenticated;

create or replace function public.admin_ban_project(p_project_id uuid, p_flag_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.projects set is_banned = true where id = p_project_id;
  if not found then raise exception 'project not found'; end if;

  update public.stars
  set status = 'banned', updated_at = now()
  where project_id = p_project_id;

  update public.moderation_flags
  set status = 'actioned'
  where id = p_flag_id and project_id = p_project_id;
  if not found then raise exception 'moderation flag not found'; end if;
end;
$$;

revoke all on function public.admin_ban_project(uuid, uuid) from public;
grant execute on function public.admin_ban_project(uuid, uuid) to service_role;

create or replace function public.admin_revoke_project_token(p_project_id uuid, p_flag_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.projects set claim_token_hash = 'revoked' where id = p_project_id;
  if not found then raise exception 'project not found'; end if;

  update public.moderation_flags
  set status = 'actioned'
  where id = p_flag_id and project_id = p_project_id;
  if not found then raise exception 'moderation flag not found'; end if;
end;
$$;

revoke all on function public.admin_revoke_project_token(uuid, uuid) from public;
grant execute on function public.admin_revoke_project_token(uuid, uuid) to service_role;
