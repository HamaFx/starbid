create table public.moderation_flags (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  reason text not null,
  source text not null default 'user_report'
    check (source in ('user_report', 'auto_denylist', 'admin')),
  status text not null default 'pending'
    check (status in ('pending', 'cleared', 'actioned')),
  created_at timestamptz not null default now()
);

alter table public.moderation_flags enable row level security;
