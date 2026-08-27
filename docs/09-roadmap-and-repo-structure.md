# Roadmap & Repo Structure

## Repo structure (Next.js App Router, latest stable major + TypeScript "latest")

```
/app
  /(marketing)/page.tsx                    → galaxy canvas homepage
  /(marketing)/leaderboard/page.tsx        → SSR sortable table (SEO)
  /star/[id]/page.tsx                      → public project page (SSR)
  /star/[id]/manage/
    page.tsx                               → claim-token dashboard (noindex)
    actions.ts                             → fuel checkout Server Actions (~50 lines)
  /create/
    page.tsx
    actions.ts                             → new-star checkout Server Actions (~50 lines)
  /recover/
    page.tsx
    actions.ts
  /dashboard/page.tsx                      → "My Stars" (reads localStorage)
  /api/webhooks/lemonsqueezy/route.ts      → orchestration only (~40 lines)

/components
  /galaxy/
    GalaxyCanvas.tsx
    StarSprite.ts
    SpritePool.ts
    useOrbitTween.ts
    useLOD.ts
    Ticker.tsx
    Lensing.ts
  /checkout/
    CheckoutOverlay.tsx
    ConfirmingState.tsx
    useConfirmPolling.ts
  /dashboard/
    MyStarsList.tsx
    StarFuelPanel.tsx
    ClaimTokenStorage.ts
  /ui/
    Button.tsx, Badge.tsx, MonoStat.tsx, Modal.tsx, Table.tsx, ...

/lib
  /payments/
    createCheckoutUrl.ts
    verifyWebhookSignature.ts
    parseOrderPayload.ts
    types.ts
  /db/
    client.ts                              → typed Supabase client factory
    pendingBids.ts                         → createPendingNewStar, createPendingFuel wrappers
    confirmPending.ts                      → wrapper around the RPC call
    stars.ts                               → read helpers (public_stars queries)
    moderation.ts                          → reportStar wrapper
  /math/
    orbit.ts                               → radius, size, angularVelocity (pure, unit-tested)
    zones.ts                               → client-side zone-band lookup helper
  /identity/
    claimToken.ts                          → generate + hash helpers
  /rateLimit.ts
  /turnstile.ts
  /analytics/redact.ts                     → strips `key` param before Sentry/PostHog events
  types.ts                                 → shared types (or split into /types/*.ts if it grows)

/supabase
  /migrations/
    0001_init_projects_stars.sql
    0002_pending_bids.sql
    0003_bid_events_realtime.sql
    0004_zone_snapshots_action_grants.sql
    0005_moderation.sql
    ...one migration per logical change, never edited retroactively
  /sql/functions/
    create_pending_new_star.sql
    create_pending_fuel.sql
    confirm_pending.sql
    get_pending_status.sql
    expire_stale_pending.sql
    recompute_zones.sql
    report_star.sql
    sync_project_fields.sql          → trigger function

/docs                                 → this entire doc set (00–09)

/tests
  /unit/math/orbit.test.ts
  /unit/payments/verifyWebhookSignature.test.ts
  /unit/payments/parseOrderPayload.test.ts
  /integration/confirm_pending.test.ts   → runs against local Supabase, tests race conditions directly
```

## House rules recap (enforced, not aspirational)
- No file exceeds ~150 lines — split it if it does.
- One responsibility per file/folder (payments never imports db directly;
  math is pure with zero I/O; components never call Supabase/Lemon Squeezy
  directly except the two files explicitly designated to do so).
- One migration per logical schema change, one SQL function per file.
- Server Actions (`actions.ts` files) are the only layer allowed to
  orchestrate across `lib/payments` and `lib/db` together — kept
  intentionally thin.

## Phased build plan

**Phase 0 — Foundations (week 1-2)**
- Supabase migrations 0001-0005, all RPC functions written + unit tested
  against local Supabase CLI stack
- Claim-token generate/hash/verify flow (doc 03)
- Static PixiJS canvas rendering seeded local data, no realtime/payments yet
- Design system primitives (colors, type, base `ui/` components)

**Phase 1 — Core loop (week 2-4)**
- Lemon Squeezy overlay integration + webhook handler + `confirm_pending`
  wired end-to-end against LS **test mode**
- Realtime sync (`realtimeSync.ts`) driving live galaxy updates
- Singularity +15% rule + immunity window, verified with a race-condition
  integration test (two concurrent `confirm_pending` calls)
- `/leaderboard` and `/star/[id]` SSR pages
- `/dashboard` "My Stars" via localStorage

**Phase 2 — Launch readiness (week 4-5)**
- Turnstile + Upstash rate limiting wired into every `create_pending_*`
  path and `/recover`
- Moderation queue (manual review admin view, even if just a protected
  internal page or a Supabase Studio saved query at first)
- Mobile fallback list view, LOD performance pass, low-end device probe
- ToS/Privacy pages live, ~15-30 seeded stars in place per doc 08

**Phase 3 — Launch**
- Switch Lemon Squeezy to live mode, smoke-test one real end-to-end
  purchase before announcing
- Product Hunt/HN submission, waitlist invite batch, discount-code outreach

**Phase 4 — Post-launch iteration**
- Embeddable widget for external sites (read-only, public data only)
- Public read-only API (rate-limited, `public_stars` + `bid_events` feed)
- Analytics dashboard for star owners (paid add-on — first real new
  revenue line beyond bids)
- Revisit: crypto payments, additional category galaxies, only once
  single-galaxy traction justifies the added complexity

## Definition of done for MVP launch
- [ ] Can create a star, pay via Lemon Squeezy overlay, land on a working
      manage link, all in-page (no jarring redirects)
- [ ] Payment confirms via webhook and reflects in the live galaxy for all
      connected clients within a few seconds
- [ ] Singularity requires +15% and correctly resolves concurrent
      challenges without double-awarding rank
- [ ] Zones re-band automatically as spend distribution shifts
- [ ] Abandoned checkouts expire cleanly with no ghost stars
- [ ] Mobile users get a genuinely usable list experience, not a broken canvas
- [ ] ToS/Privacy live, non-refundable + no-rank-guarantee language shown
      directly at checkout, not just linked
- [ ] Moderation flow functioning, even if fully manual at launch
- [ ] At least 15-30 real, paid, legitimate stars live before any public
      announcement (per doc 08)

## Agent entry point
Coding agents should start from `docs/10-implementation-guide.md`.
That file points at this roadmap and enforces the hard rules and phase order.
