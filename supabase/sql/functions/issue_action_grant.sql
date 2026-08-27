create or replace function public.issue_action_grant(p_kind text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_kind not in ('new_star', 'recover') then raise exception 'invalid grant kind'; end if;
  insert into public.action_grants(kind) values (p_kind) returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.issue_action_grant(text) from public;
grant execute on function public.issue_action_grant(text) to service_role;
