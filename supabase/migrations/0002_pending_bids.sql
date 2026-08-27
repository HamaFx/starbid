create table public.pending_bids (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('new_star', 'fuel')),
  star_id uuid references public.stars(id),
  project_draft jsonb,
  claim_token_hash text,
  amount_cents bigint not null check (amount_cents >= 300),
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment', 'confirmed', 'expired', 'failed')),
  lemonsqueezy_order_id text unique,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  constraint pending_bids_kind_payload check (
    (kind = 'new_star' and project_draft is not null and star_id is null and claim_token_hash is not null)
    or (kind = 'fuel' and project_draft is null and star_id is not null and claim_token_hash is null)
  )
);

create index pending_cleanup_idx on public.pending_bids (created_at)
where status = 'awaiting_payment';

alter table public.pending_bids enable row level security;
