# Database Schema (Supabase Postgres)

## Principles
- **Money is always `bigint` cents.** No floats, ever.
- **Append-only for history.** `bid_events` is never updated or deleted —
  it is the audit log, the ticker feed, and the chart data source.
- **Hash-only secrets.** Claim tokens are stored as SHA-256 hashes only.
- **Denormalized display fields on `stars`.** Name/logo/link/x_handle are
  copied onto `stars` and kept in sync by a trigger. Reason: anonymous
  realtime clients subscribe to `stars` changes directly, and we must never
  expose `projects.email` or `claim_token_hash` over a public channel.
  Denormalizing the 5 public fields avoids a join the realtime stream
  can't do.
- **One migration per logical change, one SQL function per file.** No
  single giant schema/function file (house rule: no file > ~150 lines).

## Extensions
```sql
create extension if not exists pgcrypto;   -- digest() for sha256
create extension if not exists pg_cron;
```

## Tables

### `projects` — who owns what
```sql
create table projects (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (char_length(btrim(name)) between 1 and 40),
  logo_url          text,
  link_url          text not null,
  x_handle          text,
  email             text not null,            -- stored lowercase, never exposed
  claim_token_hash  text not null unique,     -- sha256 hex of the raw token
  verified          boolean not null default false,
  is_banned         boolean not null default false,
  created_at        timestamptz not null default now()
);
create index projects_email_idx on projects (lower(email));
```

### `stars` — the orbiting objects (one per project)
```sql
create table stars (
  id                    uuid primary key default gen_random_uuid(),
  project_id            uuid not null unique references projects(id) on delete cascade,
  total_bid_cents       bigint not null check (total_bid_cents > 0),
  angle_seed            real not null default (random() * 360),
  -- denormalized public display fields (synced by trigger from projects)
  d_name                text not null,
  d_logo_url            text,
  d_link_url            text not null,
  d_x_handle            text,
  d_verified            boolean not null default false,
  entered_at            timestamptz not null default now(),
  immunity_until        timestamptz,
  status                text not null default 'active'
                          check (status in ('active','withdrawn','banned')),
  updated_at            timestamptz not null default now()
);
create index stars_rank_idx on stars (total_bid_cents desc) where status = 'active';
```
The `d_` prefix makes denormalization explicit in every query that touches it.

### `pending_bids` — the direct-charge staging table (see doc 01)
```sql
create table pending_bids (
  id                     uuid primary key default gen_random_uuid(),
  kind                   text not null check (kind in ('new_star','fuel')),
  star_id                uuid references stars(id),        -- fuel only
  project_draft          jsonb,                            -- new_star only:
                         -- {name, logo_url, link_url, x_handle, email}
  claim_token_hash       text,                             -- new_star only
  amount_cents           bigint not null check (amount_cents >= 300), -- $3 min
  status                 text not null default 'awaiting_payment'
                           check (status in ('awaiting_payment','confirmed','expired','failed')),
  lemonsqueezy_order_id  text unique,                      -- idempotency guard
  created_at             timestamptz not null default now(),
  confirmed_at           timestamptz,
  constraint kind_payload check (
    (kind = 'new_star' and project_draft is not null and star_id is null and claim_token_hash is not null)
    or (kind = 'fuel'  and project_draft is null     and star_id is not null)
  )
);
create index pending_cleanup_idx on pending_bids (created_at)
  where status = 'awaiting_payment';
```

### `bid_events` — append-only money history
```sql
create table bid_events (
  id                     uuid primary key default gen_random_uuid(),
  star_id                uuid not null references stars(id) on delete cascade,
  project_id             uuid not null references projects(id) on delete cascade,
  pending_bid_id         uuid references pending_bids(id),
  amount_cents           bigint not null check (amount_cents > 0),
  resulting_total_cents  bigint not null,
  event_type             text not null
                           check (event_type in ('spawn','fuel','singularity_takeover')),
  created_at             timestamptz not null default now()
);
create index bid_events_recent_idx on bid_events (created_at desc);
create index bid_events_star_idx  on bid_events (star_id, created_at desc);
```

### `realtime_events` — the realtime fan-out table
Supabase Realtime's Postgres Changes can push table rows to anonymous
clients, but our join (`stars` + `projects`) can't be expressed in one
CDC subscription. Pattern: a trigger on `bid_events` writes a self-contained
public-safe JSON payload here; clients subscribe to inserts on this table.
```sql
create table realtime_events (
  id          bigint generated always as identity primary key,
  topic       text not null,        -- 'galaxy' or 'pending:<uuid>'
  payload     jsonb not null,
  created_at  timestamptz not null default now()
);
alter table realtime_events enable row level security;
create policy "public read" on realtime_events for select using (true);
-- payloads contain ONLY public fields (name, logo, totals) — enforced by trigger
-- pg_cron trims rows older than 2 hours
```

### `zone_snapshots` — cosmetic banding, single row, upserted
```sql
create table zone_snapshots (
  id           int primary key default 1 check (id = 1),
  boundaries   jsonb not null,   -- {"singularity":1,"photon_ring":6,"inner_disk":26,...}
  computed_at  timestamptz not null default now()
);
```

### `action_grants` — single-use DB-enforced proof of a passed bot check
The Turnstile verification happens in a Server Action (it holds the secret
key), but the RPC is callable by anyone with the anon key — so the RPC can't
trust a boolean. Instead the action inserts a short-lived grant row; the RPC
consumes it atomically (delete … returning = single use).
```sql
create table action_grants (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('new_star','recover')),
  expires_at  timestamptz not null default now() + interval '10 minutes'
);
```

### `moderation_flags`
```sql
create table moderation_flags (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  reason      text not null,
  source      text not null default 'user_report'
                check (source in ('user_report','auto_denylist','admin')),
  status      text not null default 'pending'
                check (status in ('pending','cleared','actioned')),
  created_at  timestamptz not null default now()
);
```

## Views
```sql
-- The only anon-readable projection of projects; runs with owner rights so
-- anon never needs direct SELECT on projects (email/hash stay unreachable).
create view public_stars as
  select s.id as star_id, s.project_id, s.total_bid_cents, s.angle_seed,
         s.entered_at, s.immunity_until,
         s.d_name as name, s.d_logo_url as logo_url, s.d_link_url as link_url,
         s.d_x_handle as x_handle, s.d_verified as verified
  from stars s
  where s.status = 'active';
```

## RLS summary
| Table | anon SELECT | anon INSERT/UPDATE/DELETE |
|---|---|---|
| projects, stars, pending_bids, action_grants, bid_events, zone_snapshots, moderation_flags | ❌ | ❌ (deny-all policies) |
| realtime_events | ✅ (public-safe payloads only) | ❌ |

All writes happen exclusively through `SECURITY DEFINER` RPCs. The RPCs are
the security boundary; RLS is the backstop.

## RPC inventory (one function per file in `supabase/sql/functions/`)
| Function | Callable by | Purpose | Full logic |
|---|---|---|---|
| `create_pending_new_star(grant_id, draft, claim_token_hash, amount)` | anon (via action) | Validates draft + consumes grant, inserts pending row | doc 05 |
| `create_pending_fuel(star_id, claim_token, amount)` | anon (via action) | Verifies token hash, inserts pending row | doc 05 |
| `confirm_pending(pending_id, ls_order_id)` | service role (webhook) | **The only place money becomes rank.** Idempotent, atomic | doc 05 |
| `get_pending_status(pending_id)` | anon | Safe status poll (unguessable UUID) | doc 05 |
| `expire_stale_pending()` | pg_cron | Marks 30-min-old unpaid rows `expired` | doc 05 |
| `recompute_zones()` | pg_cron | Recomputes percentile bands | doc 05 |
| `report_star(project_id, reason)` | anon | Inserts moderation flag | doc 05 |
| `sync_project_fields()` | trigger | Keeps `d_*` fields on stars in sync | this doc |

## `pending_bids` lifecycle
```
create_pending_*            webhook order_created         pg_cron (30 min)
      │                            │                            │
      ▼                            ▼                            ▼
awaiting_payment ──────► confirmed ──────────────────► (terminal)
      │                    │
      │                    └─► failed   (webhook error path, retryable by LS)
      └──────────────────► expired
```

## Maintenance notes
- `bid_events` grows forever by design; add monthly partitioning if it
  passes a few million rows (not needed at launch scale).
- `realtime_events` is disposable; cron-trim aggressively.
- `action_grants` rows self-expire; cron-trim daily.
- All timestamps `timestamptz`, all ids UUID v4 (unguessable) or identity.