# Implementation Guide (for coding agents)

This is the single entry-point file. Read it first, then follow the linked docs.

## Source of truth (read in this order)
1. `docs/00-overview-and-decisions.md` — product vision, non-goals, locked decisions
2. `docs/01-architecture.md` — system design, module boundaries, env vars
3. `docs/09-roadmap-and-repo-structure.md` — exact folder structure + phased plan
4. Domain docs as needed while implementing:
   - `02-database-schema.md`
   - `03-identity-ownership-model.md`
   - `04-payments-and-credits.md`
   - `05-bidding-engine-and-math.md`
   - `06-frontend-canvas-and-design-system.md`
   - `07-security-fraud-legal.md`
   - `08-cold-start-and-launch-plan.md`

## Hard rules (never violate)
- **No file > ~150 lines.** Split immediately if it grows.
- **One responsibility per file:**
  - `lib/payments/*` — only talks to Lemon Squeezy. Never imports Supabase.
  - `lib/db/*` — only talks to Supabase. Never contains payment or math logic.
  - `lib/math/*` — pure functions only. Zero I/O.
  - `components/galaxy/*` — rendering only. Reads from Zustand store.
  - `components/checkout/*` — owns Lemon.js overlay lifecycle only.
  - `app/**/actions.ts` — the only layer allowed to orchestrate across `lib/db` + `lib/payments`. Keep thin.
- Database is the **source of truth**. All money-affecting logic lives in Postgres `SECURITY DEFINER` RPCs.
- **No wallet / stored balance.** Every bid is a direct Lemon Squeezy charge.
- **Permanent ranking only** (no decay in v1).
- Claim-token ownership model (no traditional auth, no sessions).
- Minimum charge **$3**.
- Use **Lemon Squeezy overlay (Lemon.js)**, not hosted redirect.
- DEMO stars are allowed pre-launch and must be clearly badged.
- Cost-to-rank calculator is required UX on manage + public star pages.
- Success screen after purchase is **non-dismissible** until user confirms they saved the claim link.
- Never trust a client-side “payment succeeded” flag. Only the webhook can call `confirm_pending`.

## Locked product decisions
- Ranking = lifetime cumulative `total_bid_cents` (permanent).
- Singularity (#1) requires ≥ 115% of current #1 total. 60-second immunity after takeover.
- Tie-break: earlier `entered_at` wins.
- Banned/withdrawn stars are ignored for ranking; next active star becomes effective #1.
- No refunds ever. Framed as paid advertising placement.
- Only two transactional emails: purchase receipt (no token) and recovery link (token rotation).

## Tech stack (do not substitute without updating docs)
- Next.js (latest major, App Router) + TypeScript `"latest"`
- Vercel
- Supabase (Postgres + Realtime + Storage + pg_cron)
- Lemon Squeezy (overlay)
- Upstash Redis (rate limits)
- Cloudflare Turnstile
- PixiJS v8
- Zustand
- Tailwind + the thermal design tokens in doc 06
- Resend (email)
- PostHog + Sentry (with `key` param redaction)

## Implementation order

### Phase 0 — Foundations
1. Scaffold Next.js App Router + TypeScript + Tailwind using the exact folder structure in doc 09.
2. Create Supabase project. Apply migrations `0001`–`0005` and all SQL functions under `supabase/sql/functions/`.
3. Typed Supabase client (`lib/db/client.ts`).
4. Claim-token generate/hash helpers (`lib/identity/claimToken.ts`).
5. Pure math (`lib/math/orbit.ts` + unit tests). Add `lib/math/rankTargets.ts` for cost-to-rank calculator.
6. Design-system primitives (`components/ui/`).
7. Static PixiJS canvas (`GalaxyCanvas.tsx` + `StarSprite` + `SpritePool`) that renders seeded local/DEMO data. No realtime or payments yet.

### Phase 1 — Core loop
1. `lib/payments/*` (createCheckoutUrl, verifyWebhookSignature, parseOrderPayload, types).
2. Server Actions for `create_pending_new_star` and `create_pending_fuel`.
3. `CheckoutOverlay.tsx` + `ConfirmingState.tsx` + `useConfirmPolling.ts`.
4. Webhook route `app/api/webhooks/lemonsqueezy/route.ts` (thin orchestration only).
5. End-to-end `confirm_pending` + honest polling UI.
6. Realtime sync → Zustand store → live galaxy updates + orbit tweens.
7. Cost-to-rank calculator on manage panel and public star page.
8. Pages: `/`, `/create`, `/star/[id]`, `/star/[id]/manage`, `/leaderboard`, `/dashboard`, `/recover`.

### Phase 2 — Launch readiness
1. Turnstile + Upstash rate limits on every `create_pending_*` and `/recover`.
2. Moderation queue (even if minimal internal page).
3. Mobile: default to list view; canvas is opt-in.
4. Click tracking (outbound redirect/beacon).
5. ToS + Privacy pages.
6. DEMO star seeding + Founding badge visual treatment.
7. Non-dismissible success screen + claim-link export.

### Phase 3 — Launch
- Switch Lemon Squeezy to live mode.
- Smoke-test one real purchase.
- Seed 15–30 stars (DEMO then replace with real).
- Product Hunt / HN / build-in-public.

## Definition of done (MVP)
- [ ] Create a star → pay via Lemon overlay → land on working manage link, all in-page.
- [ ] Payment confirms via webhook and appears in the live galaxy for all clients within a few seconds.
- [ ] Singularity requires +15% and correctly resolves concurrent challenges (no double-award).
- [ ] Zones re-band automatically.
- [ ] Abandoned checkouts expire cleanly (no ghost stars).
- [ ] Mobile users get a usable list experience.
- [ ] Non-refundable + no-rank-guarantee language shown directly at checkout.
- [ ] Moderation flow works (even if manual).
- [ ] At least 15–30 stars live before public announcement (DEMO allowed if clearly marked).
- [ ] Cost-to-rank calculator visible on fuel/manage surfaces.
- [ ] Success screen forces “I saved my claim link” before dismiss.

## What the agent must never do
- Invent a wallet, credits, or stored balance.
- Add traditional auth / OAuth / sessions.
- Add refunds or “dethrone bonus” payouts.
- Add notification systems beyond the two allowed emails.
- Put business logic in React components or Pixi code.
- Trust client-side payment success.
- Exceed the ~150-line file limit.
- Change the permanent-ranking decision without updating doc 00 first.

## When stuck
Re-read the relevant domain doc and the hard rules above. Prefer the simplest implementation that satisfies the docs over clever abstractions.
