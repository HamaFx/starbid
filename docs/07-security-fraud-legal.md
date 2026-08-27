# Security, Fraud & Legal Notes

*(Not legal advice — get real ToS/Privacy review before taking live
payments at scale; this is an engineering/product checklist.)*

## Payments — status
Lemon Squeezy onboarding confirmed working from Iraq (founder-verified).
No fallback provider needed at launch. Revisit only if LS ever changes
payout-country eligibility.

## Direct-charge model changes the fraud surface (vs. a wallet)
Since there's no stored balance to drain, the main risks shift to:
1. **Chargebacks after a star already gained rank/exposure** — money is
   gone from LS's perspective, but the "product" (visibility) was already
   delivered and can't be un-delivered.
   - Mitigation: Lemon Squeezy's fraud screening runs pre-charge (their
     job as Merchant of Record). On a confirmed chargeback webhook
     (`order_refunded`/dispute event), flag the associated `project_id`
     into `moderation_flags` automatically and consider pausing the star
     (`status = 'banned'`) pending review — documented policy, not
     automatic permanent bans, to avoid false positives.
2. **Webhook spoofing** — mitigated entirely by HMAC signature
   verification (`verifyWebhookSignature.ts`, doc 04) before any DB call.
3. **Race exploitation on the Singularity** — mitigated by row-locking
   inside `confirm_pending` (doc 05), not by anything client-side.
4. **Pending-row spam** (creating many unpaid `pending_bids` rows) — free
   in dollar terms but costs DB rows and could be used to probe rate
   limits. Mitigated by Upstash limits + `action_grants` single-use gate
   (doc 05) + 30-minute auto-expiry cron.

## Bot/spam protection
- Cloudflare Turnstile required before any `action_grants` row is issued
  — required for both new-star creation and /recover requests.
- Upstash sliding-window limits: 3 new-star attempts/IP/hour, 10 fuel
  attempts/star/hour, 3 recovery requests/email/hour.
- The $3 real-money minimum is itself the strongest anti-spam control —
  there is no path to writing a `stars` or `bid_events` row for free.

## Content moderation
- Every new star's logo + link enters `moderation_flags` as `pending`
  (source `auto_denylist` if it matches a keyword/domain blocklist checked
  at submission time, otherwise `user_report` once reported, or `admin`
  for manual spot checks).
- Public "report this star" action (`report_star` RPC, no auth needed)
  available on every `/star/[id]` page.
- **Logo handling**: logos uploaded to Supabase Storage (private bucket →
  signed public URL after clear). Limits: max 1 MB, PNG/JPG/WebP, max
  1024 px on longest side. Server-side size/type validation before the
  pending row is created.
- **Launch moderation queue**: protected internal page (or Studio saved
  query + simple actions) listing pending flags, newest first. Actions:
  clear / ban star / force-rotate claim token. Founder time is the
  initial budget; automate only after measured volume.
- **Chargeback path**: on Lemon Squeezy `order_refunded` / dispute
  webhook → auto-insert moderation flag + set `stars.status = 'banned'`
  pending review. Visibility already delivered cannot be clawed back.
- **Banned / withdrawn Singularity**: ranking and `confirm_pending`
  ignore non-active stars; next-highest active star becomes effective #1
  with no immunity inheritance.
- ToS explicitly reserves the right to remove any star without refund,
  consistent with the non-refundable model throughout.

## Data minimization
Only PII collected: email address (for receipts/recovery) and whatever
the project chooses to display publicly (name, logo, link, X handle).
- Privacy policy states this plainly — there is no other data collection
  to disclose beyond standard analytics (PostHog) and error tracking
  (Sentry), both of which should have the `key` query param scrubbed
  before events are sent (configure in `lib/analytics/redact.ts`).
- "Delete my star" path: soft-delete (`status = 'withdrawn'`) + scrub
  `email` column to null on request, star removed from `public_stars`
  view immediately since the view filters on `status = 'active'`.

## Terms of Service — must clearly state
- This is a **paid advertising placement service**, not an investment,
  financial product, or game of chance.
- **All payments are final and non-refundable, charged individually per
  bid.** Rank position is determined purely by relative spend at the
  moment of payment confirmation and can change at any time without
  compensation.
- A payment is not a guarantee of any specific rank, zone, or outcome —
  rank is always relative to other live bids at confirmation time.
- Platform reserves the right to remove content violating policy, without
  refund.
- No guarantee of traffic, clicks, or any specific business outcome from
  placement.

## Chargebacks & disputes
Handled by Lemon Squeezy as Merchant of Record — they absorb the
processor-level dispute workflow. Internal policy: on a dispute
notification, flag the project in `moderation_flags` and pause the star
pending resolution rather than attempting to claw back "rank" (impossible
to un-deliver visibility that already happened) — document this clearly
so it's a calm, predefined process rather than an ad-hoc decision each
time it happens.

## Secrets & operational hygiene
- `SUPABASE_SERVICE_ROLE_KEY` and `LEMONSQUEEZY_WEBHOOK_SECRET` only ever
  live in server-side env vars (Vercel encrypted env), never in any
  client bundle — enforced by keeping all payment/webhook code inside
  `app/api/**` and `lib/payments/**`, never imported into a `"use client"`
  file.
- Rotate `LEMONSQUEEZY_WEBHOOK_SECRET` and API keys if ever exposed;
  document the rotation steps in an internal runbook before launch.