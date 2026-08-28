# Canvas & Galaxy Systems Audit

## Executive summary

The project uses Next.js, React 19, PixiJS 8, Zustand, and Supabase Realtime. The galaxy is rendered as a Pixi scene inside `GalaxyCanvas`, while React owns data loading, filtering, selection, leaderboard/list UI, and controls.

The architecture is conceptually strong, but the implementation has consistency gaps:

1. `lib/math/orbit.ts:size()` is not used by `StarSprite`; visual star size is rank-based.
2. Star positions use bid-driven radius, a static seed angle, and a repeated hard-coded `0.62` vertical projection.
3. `Math.max(width * 0.44, height * 0.72)` can make the galaxy clip on narrow/tall viewports.
4. Resize handling redraws guides and core but does not reliably update existing star target radii.
5. Hover telemetry uses `radius(totalDollars, 500)`, which is unrelated to the actual responsive scene radius.
6. The minimap uses input order and index-based radial distance rather than the main galaxy's ranked/bid-based layout.
7. Canvas and list ranking differ for equal bids because only the list has a tiebreaker.
8. `GalaxyViewport.focusOn()` exists but is not wired to the minimap or command palette; reset-camera is a no-op.
9. Animation speed is applied to camera easing and interaction physics as well as orbital animation.
10. React receives a zoom state update every Pixi ticker frame.
11. Demo stars are not visually unmistakable in the canvas despite the product requirement.
12. The documented texture atlas, pooling, LOD, lensing, orbit tween, and mobile fallback systems are incomplete or unused.

## Coordinate systems

### DOM/canvas coordinates
Pointer events begin in browser coordinates and are converted to canvas-local coordinates with the canvas bounding rectangle. This is correct, but pointer capture is not used, so dragging can lose the active pointer when it leaves the canvas.

### World coordinates
The world uses the canvas center as `cx/cy`. Stars, guides, dust, trails, constellation links, shockwaves, and the singularity core all use this coordinate system.

### Viewport coordinates
`GalaxyViewport` uses a Pixi pivot at the singularity and applies scalar scale plus screen-space pan. World coordinates are therefore transformed after star positions are calculated.

### DOM overlay coordinates
Hover telemetry uses Pixi global coordinates directly as CSS `left/top` values. This can misalign overlays when the host has an offset, when the canvas is resized, or when camera transforms are applied. A shared world-to-screen conversion should be used.

## Sizing system

### Scene radius
The current radius is:

```ts
Math.max(width * 0.44, height * 0.72)
```

This fits the nominal 1200x760 view reasonably but can produce a radius larger than the available horizontal space on narrow/tall screens. The calculation should account for the ellipse's vertical projection and use an axis-constrained minimum.

### Bid-to-radius mapping
The formula places larger bids closer to the center:

```ts
const minRadius = rMax * 0.14;
const maxSpan = rMax * 0.82;
const decay = 1 / (1 + 0.35 * Math.log1p(totalBidDollars));
return minRadius + maxSpan * decay;
```

It is deterministic and monotonic, but absolute bid values do not normalize to the current population. As the product's price scale changes, the visible distribution can become too compressed or too rim-heavy.

### Star body sizing
`size(totalBidDollars)` returns a bounded logarithmic value from 12 to 80, but it is unused. `StarSprite` instead uses fixed rank tiers from 4.5 to 10.5 pixels. The project should either remove the unused formula or make the intended sizing model explicit and shared.

## Positioning system

Stars begin at:

```ts
angleSeed * Math.PI / 180
```

and animate their current angle continuously. Realtime bid updates preserve the current visual phase, which avoids angular jumps. However, UI bearing currently displays the original seed rather than the current animated angle.

The ellipse projection is repeated as `radius * 0.62` in the main scene, background, dust, shockwaves, and minimap. This should become a shared constant.

Realtime-spawned stars use `deterministicAngle(id)` until a full refresh. If the persisted database angle differs, `updateData()` does not currently apply it to `currentAngle`.

## Ranking and data consistency

Most views sort by total bid descending. `GalaxyListView` additionally sorts ties by `enteredAt`, so canvas and list can disagree about rank, tier, color, size, radial location, and hover metadata. A shared stable comparator and ranking helper is required.

Realtime refresh can replace the store with an older snapshot and erase a newly received event-created star. This should eventually use merging or version/timestamp handling.

## Viewport and interaction

Wheel zoom is cursor anchored and bounded from 0.4x to 4x. Pinch zoom is midpoint anchored but does not pan with midpoint movement. Zoom controls correctly zoom around the singularity.

Momentum uses Pixi normalized ticker delta rather than seconds-based velocity. It works visually but is sensitive to ticker configuration. Pausing stops orbital animation but still allows viewport easing and momentum. Speed also affects camera and shockwave timing, which may feel unintuitive.

`focusOn()` is implemented but unused. The command palette receives `onResetCamera={() => {}}`, and the minimap opens the star modal instead of focusing the camera.

## Rendering and performance

For the current demo count, the implementation is reasonable. At 200-300 stars, likely pressure points include per-frame trail redraws, 220 dust circles, Pixi text objects, repeated graphics clears, and zoom state updates every frame. Constellation work is bounded to the top 30 nodes and is relatively safe.

The documented texture atlas, sprite pooling, LOD, low-end detection, static outer-rim dots, and mobile default list view are not fully integrated.

## Priority fixes

1. Use an ellipse-aware responsive radius fit.
2. Centralize layout, projection, and ranking.
3. Make hover telemetry use actual scene radius/current position.
4. Update star radii when the scene resizes.
5. Make minimap ranking and positions match the main galaxy.
6. Wire camera focus and reset actions.
7. Resolve the size formula mismatch.
8. Separate animation speed from camera interaction timing.
9. Add demo-star visual treatment.
10. Add viewport, geometry, resize, and consistency tests.

## Verification baseline

At audit time:

```text
pnpm exec tsc --noEmit     passed
pnpm test -- --run         46 passed, 4 skipped
```

The current tests cover pure orbit math and store behavior but do not cover Pixi lifecycle, viewport math, resize behavior, DOM overlay alignment, or minimap/main-scene consistency.
