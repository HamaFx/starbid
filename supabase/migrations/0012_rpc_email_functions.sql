create or replace function public.get_project_email(p_pending_id uuid)
returns table(email text, project_name text, star_id uuid, amount_cents bigint)
language sql security definer set search_path = public
as $$
  select p.email, s.d_name, s.id, b.amount_cents from public.pending_bids b join public.stars s on s.id = b.star_id join public.projects p on p.id = s.project_id where b.id = p_pending_id and b.status = 'confirmed';
$$;
revoke all on function public.get_project_email(uuid) from public;
grant execute on function public.get_project_email(uuid) to service_role;

create or replace function public.find_recovery_projects(p_email text)
returns table(project_id uuid, project_name text, link_url text)
language sql security definer set search_path = public
as $$
  select id, name, link_url from public.projects where lower(email) = lower(p_email) and is_banned = false;
$$;
revoke all on function public.find_recovery_projects(text) from public;
grant execute on function public.find_recovery_projects(text) to service_role;
