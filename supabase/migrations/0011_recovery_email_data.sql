create or replace function public.find_recovery_projects(p_email text)
returns table(project_id uuid, project_name text, link_url text)
language sql
security definer
set search_path = public
as $$
  select id, name, link_url from public.projects where lower(email) = lower(p_email) and is_banned = false;
$$;

revoke all on function public.find_recovery_projects(text) from public;
grant execute on function public.find_recovery_projects(text) to service_role;
