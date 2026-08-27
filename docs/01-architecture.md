# Architecture

## Guiding principles
1. **Zero custom backend servers.** Everything runs on Vercel (Next.js +
   serverless functions/Server Actions) and Supabase (Postgres + Realtime
   + Storage + pg_cron). Payments are fully delegated to Lemon Squeezy.
2. **No file does two jobs.** Every module has one clear responsibility —
   a payments file never contains rendering logic, a math file never
   touches the database, a component never contains business logic
   directly. This is enforced structurally (see "File size & module
   boundaries" below), not just as a style preference — it's what makes
   this maintainable by a solo dev or a small team without things turning
   into a 2,000-line `page.tsx`.
3. **The database is the source of truth, not the client.** All money-
   affecting logic lives in Postgres `SECURITY DEFINER` functions. The
   frontend is a renderer of state, never the authority over it.

---

## System diagram (textual)
┌──────────────────────────────────────────────────────────────────┐
│ Vercel (Next.js) │
│ ┌────────────┐ ┌────────────────┐ ┌───────────────────────┐ │
│ │ SEO pages │ │ Galaxy Canvas │ │ Server Actions / │ │
│ │ (leader- │ │ (PixiJS, │ │ Route Handlers │ │
│ │ board, │ │ client-side) │ │ (create pending bid, │ │
│ │ /star/id) │ │ │ │ webhook receiver) │ │
│ └────────────┘ └───────┬────────┘ └──────────┬─────────────┘ │
└───────────────────────────┼──────────────────────┼─────────────────┘
│ Realtime WS │ RPC calls
▼ ▼
┌─────────────────────────────────────────┐
│ Supabase │
│ Postgres (source of truth) │
│ Realtime (Broadcast + CDC) │
│ Storage (logo images) │
│ pg_cron (zone recompute, cleanup) │
└─────────────────────────────────────────┘
▲
│ webhook: order_created
┌───────────────────────┐ ┌──────────────────┐
│ Lemon Squeezy │ │ Upstash Redis │
│ (overlay checkout, │ │ (rate limiting) │
│ tax, fraud, payouts) │ └──────────────────┘
└───────────────────────┘
┌──────────────────┐
│ Cloudflare │
│ Turnstile │
│ (bot protection) │
└──────────────────┘

---

## The core problem this architecture solves: direct charges with no wallet

Since there's no stored balance, every bid must go through: **intent →
external payment → webhook confirmation → apply to star.** This needs to
be race-safe (two people bidding on the Singularity at once) and can't
silently create "ghost" stars if a payment never completes. The pattern:

### `pending_bids` — a short-lived staging table
1. User fills out amount + (for new stars) project details client-side.
2. Server Action `createPendingBid()` inserts one row into `pending_bids`
   with `status = 'awaiting_payment'` and returns a `pending_bid_id`.
3. Server Action calls Lemon Squeezy to create a Checkout, embedding
   `pending_bid_id` in `custom_data`, and returns the checkout URL/config
   to the client.
4. Client opens the **Lemon.js overlay** using that config — user never
   leaves the page.
5. On successful payment, Lemon Squeezy fires the `order_created` webhook.
6. Webhook handler verifies the signature, looks up `pending_bids` by the
   `pending_bid_id` in `custom_data`, and calls the Postgres RPC
   `confirm_bid(pending_bid_id, ls_order_id)` — this is the ONLY place
   money actually becomes a real bid.
7. `confirm_bid` is idempotent (unique constraint on `ls_order_id`) and
   atomic: it locks the relevant star (or creates a new one), applies the
   ranking rules (including the Singularity +15% check), inserts a
   `bid_events` row, and marks the `pending_bid` as `confirmed`.
8. The `stars` table update triggers Supabase Realtime → all connected
   clients receive the delta and animate it.
9. **Cleanup job** (pg_cron, every 15 min): any `pending_bids` row older
   than 30 minutes still `awaiting_payment` is marked `expired` — handles
   abandoned checkouts cleanly, no ghost data lingers.

This means: the client polls/subscribes to its own `pending_bid_id` status
after closing the overlay, shows "Confirming payment…" until it flips to
`confirmed`, then transitions into the normal live-galaxy animation. If a
webhook is delayed, this is still honest UI rather than a fake instant
update.

### Why this is race-safe for the Singularity
`confirm_bid` runs the entire challenge check (`≥ 115% of current #1`)
**inside the same transaction** that reads the current #1's total, using
`SELECT ... FOR UPDATE` to lock that row. If two confirmations arrive
close together, Postgres serializes them — the second one re-reads the
now-updated #1 total before deciding whether it still qualifies. Money
already paid always counts toward the payer's total regardless of outcome
(no refunds), but the ranking decision itself is never open to a race —
this is the guarantee that matters.

---

## File size & module boundaries (hard rules, not suggestions)

To avoid the "one giant file does everything" failure mode:

- **No file over ~150 lines.** If a component/function grows past that,
  it's a signal to split it — this is treated as a real lint/review rule,
  not a vague guideline.
- **One responsibility per file**, enforced by folder structure:
  - `lib/payments/*` — only talks to Lemon Squeezy's API. Never imports
    Supabase directly.
  - `lib/db/*` — only talks to Supabase (typed RPC wrappers). Never
    contains payment logic or math.
  - `lib/math/*` — pure functions only (radius, size, zone bands). No I/O,
    no imports from `db` or `payments`. Fully unit-testable in isolation.
  - `components/galaxy/*` — rendering only. Reads from the Zustand store,
    never calls Supabase or Lemon Squeezy directly.
  - `components/checkout/*` — owns the Lemon.js overlay lifecycle only.
  - `app/**/actions.ts` — thin Server Actions that orchestrate calls
    across the above layers. This is the ONLY layer allowed to call both
    `lib/db` and `lib/payments` in the same function — it's the
    orchestration seam, kept intentionally thin (validate input → call
    one or two lib functions → return typed result).
- **SQL logic lives in versioned migration files** under
  `supabase/migrations/`, one migration per logical change — never one
  giant schema file edited in place.
- **Shared types** live in `lib/types.ts` (or split further if it grows —
  e.g. `types/star.ts`, `types/bid.ts`) and are imported everywhere,
  generated where possible from the Supabase schema
  (`supabase gen types typescript`) to prevent client/server drift.

This structure means: a new contributor (or future-you six months later)
can open any single file and understand its entire job without needing
the rest of the codebase loaded in their head.

---

## Environments
- **Local**: Supabase CLI local stack (Postgres + Realtime emulated),
  Lemon Squeezy **test mode** store, `.env.local`.
- **Staging**: separate Supabase project, LS test mode, Vercel preview
  deployments per branch/PR.
- **Production**: Supabase production project, LS live mode, Vercel
  production deployment, custom domain.

## Env vars (illustrative)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= # server-only, never sent to client
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
RESEND_API_KEY= # only for the "resend claim link" email

## Why not a custom Node/Elixir backend
Rejected for this deployment target: you're committed to Vercel +
Supabase, both managed/serverless. A stateful custom backend would mean a
third platform to deploy and pay for, purely to replicate what Postgres
row-locking + Supabase Realtime already provide natively. Revisit only if
Realtime throughput limits are actually hit in production (unlikely below
tens of thousands of concurrent connections).