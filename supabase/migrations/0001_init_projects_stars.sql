create extension if not exists pgcrypto;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  logo_url text,
  link_url text not null,
  x_handle text,
  email text,
  claim_token_hash text not null unique,
  verified boolean not null default false,
  is_founding boolean not null default false,
  is_demo boolean not null default false,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

create index projects_email_idx on public.projects (lower(email));

create table public.stars (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  total_bid_cents bigint not null check (total_bid_cents > 0),
  angle_seed real not null default (random() * 360),
  d_name text not null,
  d_logo_url text,
  d_link_url text not null,
  d_x_handle text,
  d_verified boolean not null default false,
  d_is_founding boolean not null default false,
  d_is_demo boolean not null default false,
  entered_at timestamptz not null default now(),
  immunity_until timestamptz,
  status text not null default 'active' check (status in ('active', 'withdrawn', 'banned')),
  updated_at timestamptz not null default now()
);

create index stars_rank_idx on public.stars (total_bid_cents desc) where status = 'active';

create view public.public_stars with (security_invoker = true) as
select s.id as star_id, s.project_id, s.total_bid_cents, s.angle_seed,
  s.entered_at, s.immunity_until, s.d_name as name, s.d_logo_url as logo_url,
  s.d_link_url as link_url, s.d_x_handle as x_handle, s.d_verified as verified,
  s.d_is_founding as is_founding, s.d_is_demo as is_demo
from public.stars s
where s.status = 'active';

alter table public.projects enable row level security;
alter table public.stars enable row level security;
