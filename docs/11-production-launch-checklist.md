# Production Launch Checklist

## Required environment variables

Configure these in Vercel production only:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_VARIANT_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
TURNSTILE_SECRET_KEY=
RESEND_API_KEY=
EMAIL_FROM=
ADMIN_ACCESS_TOKEN=
```

Configure the public Turnstile site key as a client-visible variable:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

## Lemon Squeezy

- Use a dedicated bid product/variant.
- Confirm custom prices are enabled for the variant.
- Register the production webhook URL:
  `/api/webhooks/lemonsqueezy`
- Subscribe to `order_created`, `order_refunded`, and dispute events.
- Confirm the webhook secret matches Vercel.
- Complete one low-value test-mode checkout before enabling live mode.

## Supabase

- Apply migrations in order.
- Enable Realtime for `realtime_events`.
- Confirm `pg_cron` jobs are active.
- Keep service-role credentials server-only.
- Verify anonymous clients cannot read private project, pending-bid, or token data.
- Verify `public_stars` exposes only public display fields.

## Launch verification

```bash
pnpm typecheck
pnpm test
pnpm build
npx supabase db lint --local
npx supabase db reset --local --yes
pnpm test:local-phase1
pnpm smoke
```

## Operational checks

- Test a new-star purchase.
- Test fuel with a valid claim key.
- Confirm invalid claim keys fail.
- Confirm amount mismatches fail.
- Confirm duplicate webhooks are no-ops.
- Confirm a Singularity takeover applies the 115% rule.
- Confirm a chargeback pauses the star and creates a moderation flag.
- Confirm recovery rotates the old claim key.
- Confirm claim keys do not appear in analytics or server logs.
- Confirm mobile list view works without WebGL.
- Confirm Terms and Privacy are linked and reachable.
