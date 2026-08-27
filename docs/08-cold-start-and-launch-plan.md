# Cold Start & Launch Plan

An empty galaxy is the single biggest product risk in this entire project
— more than any technical decision in the other 9 docs. A visitor who
lands on a canvas with 3 stars in it will bounce in seconds, and every bid
now being a real $3+ charge (no free credits to hand out casually as
before) means the seeding strategy has to be deliberate about cost, not
just density.

## Phase A — Pre-launch seeding (before any public traffic)

1. **Seed it yourself — DEMO stars are the chosen path for pre-launch.**
   Since there's no credit system to quietly gift, seeding density has two
   honest options:
   - Actually pay (from your own pocket) to create 15-30 stars across a
     spread of positions — cost is small (e.g., 20 stars × $3-10 average
     ≈ $100-200).
   - Or use clearly-marked **DEMO** stars (distinct visual badge in both
     canvas and list views) as zero-cost placeholders.
   **Decision: start with DEMO stars.** They must be visually
   unmistakable (badge + muted treatment) so no visitor mistakes them for
   paid placements. Replace or convert the majority to real paid stars
   before any public announcement / Product Hunt / HN post. An obvious
   demo galaxy is better than an empty one; a fake "real" galaxy is worse
   than either.

2. **Founding Star program.** First 50 real external star creators get a
   permanent "Founding" badge (`d_verified`-style flair, free to grant,
   stored as a boolean on `projects`) — zero financial cost, permanent
   status incentive rewarding early risk-takers. This is especially
   important now that there's no free-credit lever to pull — status is
   your primary non-monetary acquisition tool.

3. **Personal outreach with a real discount, not free credit.** Since
   every bid is a direct charge, "give away $5 free" isn't structurally
   available the way a wallet system would allow. Instead: personally DM
   50-100 small indie/SaaS/crypto projects on X, offering a **discount
   code** (Lemon Squeezy supports discount codes natively) for e.g. 50%
   off their first star, floor still enforced at the real $3 minimum
   charge. This keeps acquisition cost bounded and still lowers the
   barrier to trying it.

## Phase B — Launch moment

4. **Batch the reveal.** Collect a waitlist (simple email capture on a
   teaser landing page, stored in a lightweight `waitlist` table — not
   part of the core schema, can literally be a Google Form initially) for
   1-2 weeks pre-launch, then email everyone at once on launch day so the
   galaxy shows instant activity rather than a slow trickle that looks
   dead to the first real visitors.
5. **Submit to Product Hunt / Hacker News ("Show HN") / relevant
   subreddits** (r/SideProject, r/InternetIsBeautiful, r/webdev). This
   genre — novel, visual, interactive, screenshot/GIF-friendly — tends to
   perform well purely on demo-ability. Invest real effort in a great
   looping demo video/GIF for the submission; it matters more than the
   copy.
6. **Build-in-public content** on X in the weeks before launch: short
   clips of the galaxy animating, the thermal-glow palette, a staged
   Singularity takeover moment. This product is inherently
   screenshot/video-friendly — lean into that hard before asking anyone
   to pay anything.

## Phase C — Sustaining density post-launch

7. **Sponsor/partner takeover events.** Offer a relevant newsletter or
   creator a discounted or complimentary week at the Singularity in
   exchange for a shoutout to their audience — a real, one-off cost
   decision each time (not automated), tracked as marketing spend.
8. **Watch for zone thinning.** If the Outer Rim starts looking sparse
   again post-launch-spike, that's the signal to run another discount-code
   outreach wave — track `stars.status = 'active'` count and average
   `total_bid_cents` weekly as an explicit dashboard metric, don't wait
   for it to become visually obvious to visitors first.
9. **Re-engagement without notifications.** Since there's no push/email
   nudge system (per non-goals), retention has to come from the product
   surface itself: the `/dashboard` "My Stars" page should make current
   rank and "how much to reclaim your position" viscerally clear every
   time an owner checks back manually, and the OG share-card feature
   (rank milestones → auto-generated shareable image) gives owners a
   reason to voluntarily return and check status to share it.

## Budget summary for launch
| Item | Estimated cost |
|---|---|
| Self-seeded stars (15-30) | $100-200 |
| Discount-code outreach (assume ~30% redemption on 100 DMs at 50% off $3-5 avg) | $50-100 |
| Sponsor/partner takeover (optional, one-off) | $0-300 |
| **Total pre-launch acquisition budget** | **≈ $150-600** |

This is intentionally framed as a real marketing budget line, not "free"
— a direct consequence of removing the credits system, and worth planning
for explicitly rather than assuming organic growth alone fills the galaxy.