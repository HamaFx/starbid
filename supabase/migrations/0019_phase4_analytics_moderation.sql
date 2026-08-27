create table if not exists public.moderation_signals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  signal text not null,
  score integer not null check (score between 1 and 100),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);
alter table public.moderation_signals enable row level security;

create or replace function public.get_star_analytics_history(p_star_id uuid, p_claim_token text, p_days integer default 30)
returns table(day date, clicks bigint, bid_events bigint, bid_cents bigint)
language sql security definer stable set search_path = public
as $$
  with auth_star as (
    select s.id from public.stars s join public.projects p on p.id = s.project_id
    where s.id = p_star_id and encode(digest(p_claim_token, 'sha256'), 'hex') = p.claim_token_hash
  ), days as (
    select generate_series(current_date - least(greatest(coalesce(p_days, 30), 1), 90) + 1, current_date, interval '1 day')::date as day
  )
  select d.day,
    (select count(*) from public.star_clicks c where c.star_id = p_star_id and c.click_day = d.day),
    (select count(*) from public.bid_events e where e.star_id = p_star_id and e.created_at::date = d.day),
    coalesce((select sum(e.amount_cents) from public.bid_events e where e.star_id = p_star_id and e.created_at::date = d.day), 0)
  from days d where exists (select 1 from auth_star) order by d.day;
$$;
revoke all on function public.get_star_analytics_history(uuid, text, integer) from public;
grant execute on function public.get_star_analytics_history(uuid, text, integer) to anon, authenticated;

create or replace function public.create_moderation_signal(p_project_id uuid, p_signal text, p_score integer)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_signal not in ('report_burst', 'suspicious_link', 'content_review') or p_score not between 1 and 100 then raise exception 'invalid moderation signal'; end if;
  insert into public.moderation_signals(project_id, signal, score) values (p_project_id, p_signal, p_score) returning id into v_id;
  return v_id;
end; $$;
revoke all on function public.create_moderation_signal(uuid, text, integer) from public;
grant execute on function public.create_moderation_signal(uuid, text, integer) to service_role;
