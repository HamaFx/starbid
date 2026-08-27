# Phase 3 Provider Inputs

The codebase and local validation are complete. Production activation requires the following external inputs.

## Vercel

Already available in the CLI account, but this repository is not linked to a Vercel project.

Required decision:

- Existing Vercel project to use, or permission to create a new project named `gravity-well`.
- Production domain, if different from the default `*.vercel.app` domain.

Commands after approval:

```bash
vercel link
vercel env add ...
vercel deploy --prod
```

## Supabase

The CLI account can see one organization/project, but this repository is not linked.

Required decision:

- Use existing project `supabase-coral-ladder` (`cxljcbrygnkobqnyxxeg`), or provide the production project ref.
- Confirm this project may receive the Gravity Well schema. Linking/migrations modify the selected project.

Commands after approval:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

## Lemon Squeezy

Required values:

```env
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_VARIANT_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
```

Also required:

- A bid product/variant that supports custom prices.
- Webhook URL: `https://<production-domain>/api/webhooks/lemonsqueezy`
- Events: `order_created`, `order_refunded`, and dispute events.

## Cloudflare Turnstile

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

The production site/domain must be registered in Turnstile.

## Upstash

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Resend

```env
RESEND_API_KEY=
EMAIL_FROM=
```

The sender domain must be verified before production email delivery.

## Application secrets

```env
ADMIN_ACCESS_TOKEN=
```

Generate a new high-entropy value for production; do not reuse local values.

## Business approvals

- Confirm non-refundable advertising-placement Terms of Service.
- Confirm Privacy Policy and data-retention policy.
- Approve initial paid/demo star seeding budget.
- Approve the controlled live smoke-test charge.
- Confirm who will operate moderation and chargeback review.

## What can be done now

Without the values above, the following are complete and safe to run locally:

```bash
pnpm typecheck
pnpm test
pnpm build
npx supabase db lint --local
npx supabase db reset --local --yes
pnpm test:local-phase1
pnpm smoke
```
