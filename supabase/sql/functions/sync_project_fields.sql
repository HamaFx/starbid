create or replace function public.sync_project_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.stars
  set d_name = new.name,
      d_logo_url = new.logo_url,
      d_link_url = new.link_url,
      d_x_handle = new.x_handle,
      d_verified = new.verified,
      d_is_founding = new.is_founding,
      d_is_demo = new.is_demo,
      updated_at = now()
  where project_id = new.id;
  return new;
end;
$$;

create trigger projects_sync_star_display_fields
after update of name, logo_url, link_url, x_handle, verified, is_founding, is_demo
on public.projects
for each row execute function public.sync_project_fields();
