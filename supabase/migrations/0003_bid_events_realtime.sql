create table public.bid_events (
  id uuid primary key default gen_random_uuid(),
  star_id uuid not null references public.stars(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  pending_bid_id uuid references public.pending_bids(id),
  amount_cents bigint not null check (amount_cents > 0),
  resulting_total_cents bigint not null,
  event_type text not null check (event_type in ('spawn', 'fuel', 'singularity_takeover')),
  created_at timestamptz not null default now()
);

create index bid_events_recent_idx on public.bid_events (created_at desc);
create index bid_events_star_idx on public.bid_events (star_id, created_at desc);

create table public.realtime_events (
  id bigint generated always as identity primary key,
  topic text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.bid_events enable row level security;
alter table public.realtime_events enable row level security;
create policy "public read realtime events" on public.realtime_events for select using (true);
