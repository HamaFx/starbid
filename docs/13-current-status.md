# Current Status

StarBid is deployed at `https://starboard-silk.vercel.app`.

## Complete

- Next.js application and production build
- Supabase project link and migrations
- Public galaxy, leaderboard, star pages, dashboard, recovery, and moderation surfaces
- Turnstile and Upstash configuration
- Resend API configuration
- Claim-token ownership and recovery rotation
- Moderation and reporting flows
- Realtime synchronization, mobile list fallback, LOD, and reduced motion
- SEO metadata, robots, sitemap, legal pages, and health endpoint

## Intentionally disabled

Lemon Squeezy payments are disabled while the store is inactive. New-star and fuel checkout controls remain unavailable. The webhook endpoint rejects events while disabled. Re-enable only after the payment provider is ready and its four production variables are configured.

## Remaining without payments

1. Verify a Resend sender domain/address and set a valid `EMAIL_FROM`.
2. Review Terms and Privacy content for final business/legal approval.
3. Assign a moderation operator and document the response process.
4. Decide whether to attach a custom domain; the current public URL remains the Vercel alias.
5. Prepare launch content: demo recording, outreach, waitlist/invites, and community announcements.
6. Populate the galaxy with clearly labeled demo stars or approved legitimate launch content.
7. Run final browser/accessibility checks before public promotion.

Supabase migration status and linked schema lint are already validated. Realtime and scheduled-job confirmation remain provider-dashboard checks.

## Post-launch roadmap

- Read-only embeddable galaxy widget
- Public rate-limited read-only API
- Owner analytics dashboard and paid analytics add-on
- Expanded moderation automation and large-scale performance tuning
- Additional galaxies/categories and ranking experiments
