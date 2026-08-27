create or replace function public.report_star(p_project_id uuid, p_reason text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'project not found';
  end if;
  if char_length(btrim(p_reason)) not between 1 and 500 then
    raise exception 'invalid report reason';
  end if;
  insert into public.moderation_flags(project_id, reason)
  values (p_project_id, btrim(p_reason))
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.report_star(uuid, text) from public;
grant execute on function public.report_star(uuid, text) to anon, authenticated;
