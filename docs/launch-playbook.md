# StarBid — Official Launch & Cold-Start Playbook

This document contains ready-to-use launch materials, outreach templates, copy for Product Hunt / Show HN / X (Twitter), and the founding creator acquisition workflow.

---

## 1. Founding Star Creator Outreach Program (First 50 Stars)

The first 50 external star creators receive the permanent **Founding** badge (`is_founding: true`) and a 50% discount code on their initial bid.

### A. Direct Message (DM) Template for X / Twitter / LinkedIn
> **Subject / Opening**: Put [Project Name] into orbit on StarBid 🌌
>
> Hey [Name]! Loved what you built with [Project Name].
>
> I just launched **StarBid** (https://starboard-silk.vercel.app) — a live interactive visual galaxy where indie SaaS and tech projects compete for orbital prominence around a supermassive gravity well.
>
> We're selecting 50 innovative projects for the **Founding Star Program**:
> 1. Permanent **Founding Star** badge & golden accretion aura
> 2. Featured spot on the live leaderboard and real-time social ticker
> 3. Direct outbound click tracking for your project
>
> Use code `FOUNDING50` for 50% off your opening bid ($3 minimum).
>
> Check it out here: https://starboard-silk.vercel.app
> Let me know once your star is in orbit and I'll personally feature it in our launch thread!

---

### B. Email Pitch Template for Indie Founders / Newsletter Sponsors
> **Subject**: Featuring [Project Name] in the StarBid Galaxy
>
> Hi [Name],
>
> I've been following your work on [Project Name] and wanted to invite you to claim an orbital placement in **StarBid**: https://starboard-silk.vercel.app
>
> Rather than static banner ads, StarBid is a live WebGL accretion disk where project visibility scales with cumulative gravity ($ spent). The #1 slot commands the Singularity.
>
> As an early creator, you can claim a permanent **Founding Star** badge using invite code `FOUNDING50`.
>
> No login required — payments are direct fiat via Lemon Squeezy and your star manages via a private cryptographic link.
>
> See you in orbit!

---

## 2. "Show HN" Submission Copy (Hacker News)

* **Title**: `Show HN: StarBid – A live WebGL galaxy where projects bid for orbital gravity`
* **URL**: `https://starboard-silk.vercel.app` (or your custom domain)

### Text / First Comment:
```text
Hey HN!

I built StarBid (https://starboard-silk.vercel.app) — an interactive, real-time visual advertising auction powered by Next.js, PixiJS (WebGL), and Supabase.

Projects enter the galaxy by placing bids that determine their orbital radius around a central black hole (the Singularity). Radius and diameter scale logarithmically with lifetime cumulative spend.

A few design & engineering decisions:
- Zero-Account Auth: No logins or passwords. Projects use cryptographic bearer claim tokens (SHA-256 hashed in Postgres) managed via private URLs.
- Direct Fiat Charges: No stored credit wallets or balances. Each bid is an isolated charge through Lemon Squeezy, staged in pending_bids and finalized via idempotent webhooks.
- Singularity Boss Fight Rule: Conquering the #1 slot requires exceeding the leader's total by at least +15%, triggering a 60-second anti-snipe immunity window.
- Thermal Accretion Palette: Visually grounded in blackbody astrophysics rather than generic sci-fi gradients. Low-end devices auto-downgrade via LOD / reduced-motion list views.

The tech stack is Next.js 16 (App Router), PixiJS v8, Supabase Realtime/Postgres, and Tailwind CSS v4.

I'd love to hear your feedback on the real-time mechanics, math curves, and visual rendering!
```

---

## 3. Product Hunt Launch Kit

* **Tagline**: The real-time interactive project galaxy & advertising auction
* **Short Description**: Put your startup in orbit. Compete for gravity around the Singularity in a living, real-time visual accretion disk.

### Maker Comment:
```text
👋 Hey Product Hunt community!

We created StarBid to turn project discovery and advertising into a living, interactive visual arena.

Instead of boring text directories or banner grids:
🌌 Every project is a star orbiting a central black hole
⚡ Your orbital proximity scales logarithmically with cumulative gravity ($ bid)
👑 The #1 slot commands the Singularity (+15% challenge rule)
🔒 100% privacy-first: zero passwords, zero accounts, bearer claim-key security

We're giving early creators a permanent "Founding Star" badge on their orbits.

Jump into orbit and let us know what you think! 🚀
```

---

## 4. X (Twitter) Launch Announcement Thread

### Tweet 1 (Hook + Looping Video):
> 🚀 Introducing StarBid: The living project galaxy.
>
> Projects compete for orbital gravity around a central black hole. Position = live cumulative spend.
>
> No accounts. No stored wallets. Direct charges + real-time WebGL orbits.
>
> 🌌 Put your project in orbit: https://starboard-silk.vercel.app
>
> 🧵 Here is how it works: (1/5)

### Tweet 2 (The Mechanics):
> 1/ The Gravity Well 🌌
>
> Your star’s distance from the center follows real accretion math:
> radius = rMax / (1 + ln(1 + spend))
>
> The more gravity you add, the closer you drift to the core. (2/5)

### Tweet 3 (The Boss Fight):
> 2/ The Singularity Rule ⚡
>
> Rank #1 isn’t easy. To take the Singularity, you must exceed the current leader by +15%.
>
> Takeovers trigger a 60s anti-snipe immunity shield and light up the live ticker stream. (3/5)

### Tweet 4 (Architecture):
> 3/ Zero-Session Architecture 🔒
>
> - Bearer claim tokens (no passwords)
> - Direct fiat checkout via @lmsqueezy overlay
> - Supabase Realtime + PixiJS WebGL engine (4/5)

### Tweet 5 (Call to Action):
> 4/ The first 50 projects receive a permanent FOUNDING STAR badge! ✨
>
> Claim your orbit today: https://starboard-silk.vercel.app
>
> Drop your star link below so we can retweet! (5/5)
