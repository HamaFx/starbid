# Payments — Direct Charges via Lemon Squeezy (No Stored Balance)

## Model recap
No wallet. Every bid (new star or fuel) is its own real, final Lemon
Squeezy transaction. Minimum charge: **$3** (see doc 00 for fee math —
anything lower loses money to processor fees on every transaction).

## Why the overlay (Lemon.js), not hosted redirect
A full-page redirect to LS's checkout and back breaks the "stay in the
galaxy" feeling and adds an extra navigation round-trip on every single
bid — costly when bids should feel fast and frequent. **Lemon.js opens
checkout as an in-page modal**; the user never leaves the canvas. This is
the single most important UX decision in the payments layer given there's
no wallet to fall back on for speed.

```html
<script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
```
```ts
window.LemonSqueezy.Setup({
  eventHandler: (event) => {
    if (event.event === 'Checkout.Success') {
      onCheckoutClosed({ pendingBidId }); // start polling confirm status
    }
  },
});
window.LemonSqueezy.Url.Open(checkoutUrl);
```

## File boundaries (per architecture doc's "no god files" rule)
```
lib/payments/
  createCheckoutUrl.ts    → builds LS Checkout API request, returns URL
  verifyWebhookSignature.ts → HMAC-SHA256 check, pure function
  parseOrderPayload.ts    → typed extraction of pending_bid_id + amount from LS payload
  types.ts                → LemonSqueezyOrderPayload, CheckoutParams

app/api/webhooks/lemonsqueezy/route.ts   → orchestration only (~40 lines):
  1. read raw body + signature header
  2. verifyWebhookSignature()
  3. parseOrderPayload()
  4. call db.confirmPending() RPC wrapper
  5. return 200

components/checkout/
  CheckoutOverlay.tsx     → loads Lemon.js script, exposes openCheckout()
  ConfirmingState.tsx     → polling UI shown between overlay-close and confirm
  useConfirmPolling.ts    → hook: polls get_pending_status every 1.5s, max 30s
```
Nothing here exceeds the ~150-line house limit; each file is independently
testable (webhook signature verification and payload parsing are pure
functions with no network calls, trivial to unit test).

## Full flow

### 1. Create pending bid (client → Server Action → DB)
```ts
// app/create/actions.ts  (new star)  |  app/star/[id]/manage/actions.ts (fuel)
'use server'
export async function startNewStarCheckout(input: NewStarInput) {
  await verifyTurnstile(input.turnstileToken);              // throws on fail
  const grant = await db.consumeActionGrant('new_star');     // single-use row
  const rawToken = generateClaimToken();
  const pending = await db.createPendingNewStar({
    grantId: grant.id,
    draft: input,
    claimTokenHash: sha256(rawToken),
    amountCents: input.amountCents,
  });
  const checkoutUrl = await createCheckoutUrl({
    amountCents: input.amountCents,
    customData: { pending_bid_id: pending.id },
  });
  return { checkoutUrl, pendingBidId: pending.id, rawToken }; // rawToken shown once client-side
}
```

### 2. User pays in the overlay
LS handles card entry, 3-D Secure, tax/VAT, fraud screening — none of that
touches our infrastructure.

### 3. Webhook confirms (the only path that moves money into rank)
```ts
// app/api/webhooks/lemonsqueezy/route.ts
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get('x-signature') ?? '';
  if (!verifyWebhookSignature(raw, sig)) return new Response('bad sig', { status: 401 });

  const { eventName, orderId, pendingBidId, amountCents } = parseOrderPayload(JSON.parse(raw));
  if (eventName !== 'order_created') return new Response('ignored', { status: 200 });

  await db.confirmPending({ pendingBidId, lsOrderId: orderId, amountCents }); // idempotent RPC
  return new Response('ok', { status: 200 });
}
```
`confirmPending` (SQL, full definition in doc 05) is protected by a
**unique constraint on `lemonsqueezy_order_id`** — if LS retries the
webhook (it does, by design, until it gets a 200), the second call is a
no-op, not a double-charge-to-rank.

### 4. Client polls, then transitions to live view
```ts
// useConfirmPolling.ts
const { status } = usePolling(() => db.getPendingStatus(pendingBidId), {
  intervalMs: 1500, timeoutMs: 30_000,
});
// 'awaiting_payment' -> show ConfirmingState
// 'confirmed'         -> redirect to /star/[id]/manage?key=... , galaxy animates the change
// 'expired' | 'failed' -> show retry CTA, do not silently disappear
```

## Idempotency & safety checklist
- [x] `lemonsqueezy_order_id` UNIQUE — prevents double-processing on webhook retries
- [x] Webhook signature verified before any DB call
- [x] `pending_bids.amount_cents >= 300` enforced at the DB constraint level, not just client validation
- [x] Server never trusts a client-supplied "payment succeeded" flag — only the webhook (server-to-server) can trigger `confirmPending`
- [x] `Checkout.Success` client event only triggers **polling**, never a direct rank update

## Disclosure required at checkout (verbatim, per doc 00)
> "This payment is final and non-refundable. It adds to your total bid.
> Your exact rank is determined at confirmation time and is not
> guaranteed if others are bidding simultaneously."

**Placement rules (must be followed):**
- Shown as a checkbox-free static notice **directly above** the Lemon.js
  button / overlay trigger — not buried in a ToS link only.
- Same text repeated inside the Lemon Squeezy checkout custom data /
  product description where the API allows.
- On the ConfirmingState screen while polling, a shorter reminder:
  "Payment received — rank updates only after confirmation." 

## Abandoned / delayed checkout UX
`pg_cron` job (doc 05: `expire_stale_pending`) runs every 15 minutes,
marks any `awaiting_payment` row older than 30 minutes as `expired`. No
ghost stars, no orphaned rows lingering indefinitely.

**Client-side honesty for delayed webhooks:**
- `useConfirmPolling` runs for up to 30 s at 1.5 s intervals.
- If still `awaiting_payment` after timeout, show a clear state:
  "Payment is taking longer than usual. You can safely close this page —
  we will update the galaxy when the payment confirms. Check your email
  receipt or return to /dashboard later."
- Provide a manual "Refresh status" button that re-calls
  `get_pending_status`.
- Never invent a success state. Never tell the user the star is live
  before the webhook-driven `confirm_pending` has run.
- Support path: if a user contacts support with a Lemon Squeezy receipt,
  staff can look up the `lemonsqueezy_order_id` and manually trigger
  confirmation if the webhook was lost (idempotent).

## What we deliberately do NOT build
- No wallet balance table, no top-up flow, no "spend from balance" RPC.
- No refund endpoint — chargebacks are handled reactively (doc 07), not
  via any in-app refund button.
- No stored card details anywhere in our infra — 100% delegated to LS.

## Fee/pricing summary (Lemon Squeezy, current as of 2026)
Lemon Squeezy platform fee: **5% + $0.50** per transaction (covers
processing + MoR tax handling). Additional possible surcharges:
+1.5% international cards, +1.5% PayPal. Net examples (US card, no extra):

| Charge | LS fee (5% + $0.50) | Approx net kept |
|---|---|---|
| $3.00 | $0.65 | $2.35 |
| $5.00 | $0.75 | $4.25 |
| $10.00 | $1.00 | $9.00 |
| $25.00 | $1.75 | $23.25 |
| $50.00 | $3.00 | $47.00 |

Bundle presets shown in UI: **$3 / $5 / $10 / $25 / $50 / custom (min $3).**

The manage / fuel panel must also surface the live **cost-to-rank
calculator** (see doc 05) so users know exactly how much to add to take
the Singularity or reach a target rank. User always pays the exact amount
they choose to add — there is no hidden "set total to X" that charges a
delta behind the scenes; the calculator simply makes the required add
amount obvious.