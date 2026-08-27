# Frontend: Canvas Rendering & Design System

## Rendering stack
- **PixiJS v8** (WebGL/WebGPU auto-detect), mounted inside a single
  `<GalaxyCanvas />` client component that owns the Pixi `Application`
  lifecycle and nothing else.
- **Zustand** store (`lib/store/galaxyStore.ts`) holds the authoritative
  client-side star list. Supabase Realtime events mutate the store; a
  `requestAnimationFrame` loop reads from the store and drives sprite
  transforms. Rendering is fully decoupled from network events — the
  store doesn't know Pixi exists, and Pixi doesn't know Supabase exists.
- **Texture atlas**: logos are fetched once, drawn into an offscreen
  canvas, batched into a Pixi `Spritesheet` — minimizes draw calls/texture
  swaps as star count grows.
- **Sprite pooling**: sprites are never destroyed/recreated on update —
  existing sprites have `.position` / `.scale` / `.alpha` mutated; removed
  stars return their sprite to a pool for reuse.

## File boundaries (no god files, per architecture doc)
```
components/galaxy/
  GalaxyCanvas.tsx        → mounts Pixi Application, owns ticker loop only (~100 lines)
  StarSprite.ts           → one class: create/update/destroy a single star's sprite
  SpritePool.ts           → acquire/release pooled sprites
  useOrbitTween.ts         → hook: eases radius/size changes over ~2s
  useLOD.ts                → hook: decides particle/glow tier per star rank
  Ticker.tsx               → the scrolling bid-events feed (separate from canvas)
  Lensing.ts               → the singularity chromatic-aberration shader, isolated
lib/store/
  galaxyStore.ts           → Zustand store: star list + selectors only
  realtimeSync.ts          → subscribes to Supabase Realtime, dispatches to store
lib/math/orbit.ts          → pure formulas (already defined in doc 05), imported here
components/dashboard/
  MyStarsList.tsx
  StarFuelPanel.tsx
  ClaimTokenStorage.ts      → localStorage read/write helpers, isolated for testability
components/ui/
  Button.tsx, Ticker Row.tsx, Badge.tsx, MonoStat.tsx, etc. — design system primitives
```
Each file has one job; `GalaxyCanvas.tsx` in particular is kept intentionally
thin — it should never contain business logic, only "start the render
loop, read from store, draw."

## Performance budget
- Target: steady 60fps up to ~200–300 concurrent active stars on mid-range
  hardware; graceful degradation beyond that. (Original 500 target was
  aspirational; real mid-range mobile + Pixi v8 + logo textures is closer
  to 200–300 before LOD must become aggressive.)
- **LOD system** (`useLOD.ts`): particle trails/glow rendered only for the
  top ~30 stars (Photon Ring + Singularity, per `zone_snapshots`). Outer
  Rim stars render as plain static dots — both a performance optimization
  and a correct design signal (visual prominence scales with spend).
- Low-end device detection (`navigator.hardwareConcurrency`, or a 1-second
  FPS probe on mount) auto-downgrades: disable particles → cap 30fps →
  fall back entirely to the list view (see below).
- **Accessibility/SEO fallback**: a plain HTML sortable table (`/leaderboard`
  and an in-page "list view" toggle) showing rank, name, total, link, and
  outbound click count — not a nice-to-have; this is also the crawlable
  rendering path since the canvas itself is invisible to search engines.

## Design system — thermal accretion-disk palette
Grounded in real astrophysics (blackbody temperature gradient), not a
generic "space gradient" — deliberately avoids the purple/blue AI-slop
default.

```
Background (void):     #05050A → #0A0A14
Outer Rim glow:         #7A2E1D
Mid Disk glow:          #FF6B35
Inner Disk glow:        #FFB627
Photon Ring / core:     #FFF4E0 → #FFFFFF
UI accent (chrome only, never inside the galaxy itself): #4CC9F0
Positive/rank-up:       #4ADE80
Negative/rank-down:     #F43F5E
```
Defined once as CSS variables + a `tailwind.config` token extension —
never hardcoded hex values scattered across components.

## Typography
- Display/headers: **Space Grotesk**
- Body/UI: **Geist**
- All numeric values (bids, ranks, countdowns, timestamps): **JetBrains
  Mono** — every dollar figure and rank number renders monospace,
  reinforcing an "exchange terminal" feel over a marketing site.

## Motion principles
- Continuous `requestAnimationFrame`-driven orbits — never CSS keyframes.
- Rank/position changes tween ~2s via `ease-out-expo` (`useOrbitTween.ts`)
  — heavy, decisive, "has mass." Avoid springy/bouncy easing everywhere
  (a common generic-AI-design tell).
- Chromatic aberration / lensing distortion (`Lensing.ts`) is scoped
  **only** to the Singularity — cheap, on-theme (real gravitational
  lensing bends light near black holes), rare enough to stay a "wow"
  moment instead of visual noise.

## Key pages
- `/` — the galaxy canvas itself (the homepage). Docked, collapsible side
  panel = leaderboard. Top/bottom ticker strip (mono font) shows recent
  `bid_events`: `NOVA_LABS moved to Photon Ring — $86.25 total →` — this
  is the social-proof engine, reads like a stock ticker.
- `/star/[id]` — public project page, SSR, indexable: logo, link, rank
  history chart (built from `bid_events`), current standing, **outbound
  click count**, and the live cost-to-rank calculator ("Add $X to take
  Singularity").
- `/star/[id]/manage?key=...` — claim-token-gated dashboard (`noindex`):
  add fuel (opens checkout overlay) with prominent cost-to-rank
  calculator and presets, edit logo/link, view own history + clicks,
  export claim link.
- `/leaderboard` — SSR, indexable, plain sortable table (rank, name,
  total, clicks) — primary SEO surface since the canvas itself can't be
  crawled.
- `/create` — new star flow: form → Turnstile → checkout overlay →
  confirming state → **non-dismissible success screen** showing the
  manage link + "I saved it" + one-click export.
- `/recover` — email-based claim-link recovery (doc 03).
- `/dashboard` — "My Stars" from localStorage + live data; includes
  "Export all claim links" and per-star fuel panels with calculator.

## Click tracking
Outbound clicks are counted via a lightweight redirect or beacon
endpoint (`/api/click/[starId]`) that increments a counter (or appends
to a small events table) before sending the user to the project URL.
Counts are public on `/star/[id]` and `/leaderboard` and visible to the
owner on the manage page. One count per visitor per star per day is
sufficient; no PII stored.

## Checkout overlay integration point
`components/checkout/CheckoutOverlay.tsx` is the only component allowed to
touch `window.LemonSqueezy` — every other component that needs to trigger
a purchase calls a prop/callback into this component rather than importing
Lemon.js directly. Keeps the payment SDK's global-script quirks contained
to one file.

## Mobile strategy
Default to the list/leaderboard view on small viewports, with an explicit
"View Galaxy" toggle that lazy-loads the Pixi canvas — never force a heavy
WebGL scene as the default mobile experience. The cost-to-rank calculator
and fuel CTAs must remain fully usable in the list view.

## Founding Star visual treatment
Stars with the Founding badge (`projects.verified` or a dedicated
`is_founding` flag) receive a distinct, permanent visual flair in both
the canvas (subtle gold/thermal rim or icon) and the list/leaderboard
(small "Founding" badge). This is free status, not a paid tier — used
as the primary non-monetary acquisition tool for the first 50 external
creators (see doc 08).

## Design references (study, don't copy)
Stripe dark-mode marketing pages, Linear's app chrome, Arc browser's
motion language, real NASA/ESA/JWST imagery — not sci-fi movie renders.