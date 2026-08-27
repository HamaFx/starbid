# Supermassive Gravity Well — Product Overview & Decision Log

## One-liner
A single, persistent, real-time visual galaxy where projects pay for orbital
position around a central black hole. Position = live rank by cumulative
spend. No refunds, no accounts, no notifications, no stored balances — every
bid is a direct, real-money charge — built as simply and safely as possible.

## Core loop
1. Visitor lands on the galaxy (full-bleed animated canvas — this IS the homepage).
2. Clicks a star → sees project info, current rank, and an "add fuel" panel.
3. Enters/selects an amount (min $3) → pays via a Lemon Squeezy overlay
   checkout (modal, stays on page) → payment confirms via webhook
   (typically a few seconds).
4. On confirmation, the star's `total_bid_cents` increases → rank
   recalculated in real time → star visually migrates inward, others shift
   outward to make room.
5. Beating the #1 star (the Singularity) requires the challenger's
   resulting total to be at least +15% over the current holder's total —
   the one "boss fight" rule in the whole system. Everything else is pure
   continuous ranking, no premium required.
6. No money is ever refunded, and no payment is guaranteed to result in any
   specific rank — rank is always determined live, at confirmation time,
   relative to everyone else. This is disclosed clearly at checkout. This
   keeps the product legally and operationally a straightforward
   **advertising placement auction**, not a financial product.

## Explicit non-goals (decided deliberately — do not silently re-add without revisiting this doc)
- ❌ No refunds or "dethrone bonus" payouts to users
- ❌ No push/email/Telegram notification system (one narrow exception: user-initiated claim-link recovery email — see doc 03)
- ❌ No traditional login/auth (no passwords, no OAuth, no sessions)
- ❌ No stored credit balance / prepaid wallet of any kind — every bid is its own direct charge
- ❌ No multiple galaxies at launch — single global galaxy only
- ❌ No crypto payments at launch (fiat only, via Lemon Squeezy)
- ❌ No charges below $3 — fee economics make anything lower a guaranteed loss (see below)

## Decision log

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Fiat or crypto | Fiat only via Lemon Squeezy (Merchant of Record) | Simplest compliance path; Stripe direct not viable from Iraq |
| 2 | Origin country | Iraq | Lemon Squeezy confirmed onboarding-eligible (verified by founder) |
| 3 | Refund mechanic | Removed entirely | Converts product into a simple ad-placement auction; removes financial-product legal risk |
| 4 | Notifications | Removed entirely | One narrow exception: transactional "resend my claim link" email, user-initiated only |
| 5 | Stored balance / credits | **Removed — raw direct charge per bid instead** | Founder preference: no prepaid wallet, no stored value held on behalf of users — every bid is its own real, final transaction |
| 6 | Tech stack | Next.js (latest major) + Supabase + Vercel + Lemon Squeezy (overlay checkout) + Upstash + Cloudflare Turnstile | Zero custom backend servers required — see doc 01 |
| 7 | Auth | None — secret claim-link ownership model instead | Removes signup friction entirely; no session infra needed |
| 8 | Minimum charge | **$3, every single bid** (not increments off a stored balance) | Lemon Squeezy fee (~5% + $0.50) makes anything much lower a guaranteed loss on every transaction |
| 9 | Zones/mechanic complexity | Single continuous rank list + one special rule for #1 (+15%) | Simpler to build and explain than a multi-zone-mechanic system |
| 10 | Galaxy scope | Single global galaxy at launch | Concentrates attention/liquidity; avoids empty-room problem |
| 11 | TypeScript version | `"latest"` in package.json, never pinned | No stable "TypeScript 7" exists yet |

## Key trade-off accepted with the direct-charge model
Every bid now involves a real checkout interaction (a few seconds, via an
in-page overlay modal rather than a redirect) instead of an instant
balance deduction. This is slightly slower than a wallet-based flow but
was explicitly chosen over holding user funds. To keep the "real-time
bidding war" feeling as alive as possible under this constraint:
- Checkout uses **Lemon Squeezy's overlay (Lemon.js)**, not hosted redirect
  — user never leaves the galaxy page.
- UI shows an explicit, honest "Confirming payment…" state between
  checkout completion and webhook confirmation, then animates the star's
  move once confirmed — never fakes an instant update before the charge is
  real.
- Checkout copy explicitly discloses: *"This payment is final and adds to
  your total bid. Your exact rank is determined at confirmation time and
  is not guaranteed if others are bidding simultaneously."*

## Success metrics (first 90 days)
- Number of unique stars created (target: 50+ before public launch, via cold-start plan, doc 08)
- Total transaction volume (gross revenue proxy)
- % of stars that add fuel more than once (re-engagement/retention proxy)
- Singularity takeover frequency (drama/virality proxy — track publicly)
- Organic shares/screenshots (tracked via UTM params on OG share-card links)
- Checkout completion rate (started vs. confirmed) — watch closely, since
  the direct-charge model has more checkout friction than a wallet would;
  this is the metric most likely to reveal if the trade-off is hurting
  conversion and worth revisiting later.
- Mid-tier density (stars with totals roughly $10–$200). If this band
  empties after the initial hype while the top ossifies, that is the
  signal to consider a future soft-decay or dual-board experiment.

## Ranking permanence decision (v1)
Pure lifetime cumulative ranking. No decay. This matches the mechanic
that produced the August 2026 outbid.lol wave. Post-hype risk is real
(top becomes expensive, mid-tier thins). Monitor the mid-tier density
metric above; only introduce decay or a secondary time-windowed board
if data shows the galaxy is dying after the viral window.

## Who owns what, going forward
This doc set (`/docs`) is the single source of truth for product decisions.
Any change to core mechanics, pricing, or non-goals should be made by
editing this file first, before touching code.
See also `docs/10-implementation-guide.md` for the agent orchestration entry point.