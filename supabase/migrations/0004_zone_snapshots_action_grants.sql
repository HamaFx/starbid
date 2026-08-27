create table public.zone_snapshots (
  id int primary key default 1 check (id = 1),
  boundaries jsonb not null,
  computed_at timestamptz not null default now()
);

create table public.action_grants (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('new_star', 'recover')),
  expires_at timestamptz not null default now() + interval '10 minutes'
);

create or replace function public.issue_action_grant(p_kind text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_id uuid;
begin
  if p_kind not in ('new_star', 'recover') then raise exception 'invalid grant kind'; end if;
  insert into public.action_grants(kind) values (p_kind) returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.issue_action_grant(text) from public;
grant execute on function public.issue_action_grant(text) to service_role;

create policy "server creates action grants" on public.action_grants
  for insert to authenticated with check (false);

alter table public.zone_snapshots enable row level security;
alter table public.action_grants enable row level security;
