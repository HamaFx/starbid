# Ownership Without Authentication

## Why no auth (recap)
No stored balances, no payouts, no cross-device sync requirement — the only
question the system must answer is "is this click allowed to touch this
star?" A bearer secret answers that with zero signup friction and zero
session infrastructure. Decision log #7.

## The model

```
purchase flow                      storage                    later use
─────────────                      ───────                    ─────────
create_pending_new_star ──► claim_token_hash (sha256)      every mutation sends
       │                    in projects/pending_bids  ──►  raw token; RPC hashes
       ▼                                               and compares inside SQL
raw token shown ONCE on
success screen + saved to
localStorage
```

1. At star creation, the Server Action generates a 256-bit token
   (`crypto.randomBytes(32)`, base64url ≈ 43 chars).
2. **Only the SHA-256 hash is ever stored**, in
   `pending_bids.claim_token_hash` → carried into `projects.claim_token_hash`
   on confirmation.
3. The raw token is shown once on the payment-success screen and saved to
   `localStorage` under `gravitywell:star:<starId>` (provisionally keyed by
   `pending_bid_id` until confirmation assigns the star id).
4. The manage URL is `/star/<starId>/manage?key=<rawToken>`. Marked
   `noindex`; the `key` param is redacted in all logging/analytics.
5. Every mutating RPC (`create_pending_fuel`, future edit actions) hashes
   the incoming token with `digest(p_token, 'sha256')` and compares to the
   stored hash **inside the same SQL transaction as the write**. There is
   no separate "auth check" step to forget.

## Why the receipt email contains no token
The raw token is never persisted server-side, so the confirmation email
**cannot** include it. That's a feature (a leaked mail log can't leak
ownership) with a known cost: a user who closes the success screen without
saving the link must use recovery. The success screen therefore shows the
manage link with an explicit "copy/save this now" affordance, a
one-click "Download claim links (.txt)" button (all localStorage keys
matching `gravitywell:star:*`), and a clear note: "We emailed you a
receipt — recovery is always available via /recover if you lose this."

## Hardened success-screen & multi-device guidance
- On first confirmation the manage URL + raw token is shown in a
  non-dismissible modal until the user clicks "I saved it".
- "Add to home screen / bookmark" prompt on mobile.
- Dashboard (`/dashboard`) always surfaces a "Export all my claim links"
  action that generates a plain-text file of every `gravitywell:star:*`
  entry currently in localStorage.
- Recovery remains the safety net; rotation invalidates old tokens
  (documented in ToS as the supported recovery path).

## The exactly-two transactional emails (complete list, per non-goals)
| Email | Trigger | Contents |
|---|---|---|
| Purchase receipt | webhook confirm | Amount, project name, public star link, reminder that the manage link was shown at purchase + how /recover works. No token. |
| Recovery link | user-initiated /recover | Fresh manage link (token rotation — see below). |

Both are sent from the Next.js side (webhook handler / Server Action) via
Resend. Nothing else emails, ever. Adding a third email type = editing the
non-goals list in doc 00 first.

## Recovery = token rotation, not retrieval
`/recover` flow (Server Action + Turnstile + Upstash rate limit 3/hour/email):
1. User enters email → we look up project(s) by `lower(email)`.
2. For each match: generate a **new** raw token, update
   `claim_token_hash` (old token becomes permanently invalid), email the
   new manage link.
3. Response is deliberately identical whether or not the email exists
   ("if that address has a star, you'll get an email") — no enumeration.

This is the same security shape as password reset: rotate, never "resend
the secret." Old localStorage tokens keep working until rotation, which is
fine (they're the same owner's device in the normal case).

## Multi-star dashboard
`/dashboard` reads all `localStorage` keys matching `gravitywell:star:*`,
fetches their live state from `public_stars`, and renders each star's rank,
total, and fuel panel. No backend session involved. Owned stars are added
to localStorage automatically at purchase.

## Ownership transfer & delegation
- **Transfer = share the key.** The manage URL is bearer ownership; sending
  it to someone hands the star over completely. Documented in ToS.
- **Revocation (moderation):** admin sets `claim_token_hash` to a sentinel
  value → every existing link dies instantly, independent of email/device.
- **Banning:** `projects.is_banned = true` + `stars.status = 'banned'`;
  excluded from `public_stars`, realtime trigger skips banned projects.

## Security properties
| Threat | Mitigation |
|---|---|
| Guessing a token | 256 bits — infeasible |
| Star-id enumeration for status polling | UUID v4, plus `get_pending_status` returns only {status, star_id} |
| Direct RPC abuse bypassing Turnstile | `action_grants` single-use rows created only after server-side Turnstile verification |
| Token leakage via logs/URLs | `key` param redacted in logging middleware; manage page sets `noindex` |
| Lost device / cleared storage | /recover rotation flow |
| Shared-email ambiguity | Recovery emails include one link per matching project |

## Accepted trade-offs (explicit)
- No cross-device sync unless the user saves the link, exports the claim
  file, or uses /recover.
- Anyone with the URL owns the star (bearer semantics) — acceptable for a
  $3+ advertising product; revisit only if average stakes grow large.
- No OAuth identity filter for spam — compensated by Turnstile + grants +
  the fact that every bid costs real money (doc 05).
- Recovery is rotation (old token dies). This is the same shape as a
  password reset and is the supported path for lost devices.

## Operational improvements for robustness
- Success screen is non-dismissible until explicit "I saved my link".
- One-click export of all claim links from /dashboard.
- /recover rate-limited (3/hour/email) + Turnstile; response is
  identical whether the email exists or not (no enumeration).
- Admin can force-rotate or set claim_token_hash to a sentinel to
  instantly revoke all existing links (moderation / support tool).

Revisit full auth only if measured fraud or support volume appears, not
preemptively.