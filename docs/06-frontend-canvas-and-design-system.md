# Frontend: Canvas Rendering & Design System

## Rendering stack
- **PixiJS v8** is mounted by the client-side `GalaxyCanvas` through
  `useGalaxyScene`.
- **Zustand** owns the client-side star list and recent realtime events.
  Supabase events update the store; Pixi reads the current store-backed
  sprite collection during its ticker loop.
- Star visuals currently use lightweight Pixi `Graphics` and `Text` objects.
  Bid updates reuse existing star containers. Texture atlasing and a full
  sprite pool remain optional future optimizations.

## Current file boundaries
```
components/galaxy/
  GalaxyCanvas.tsx        → React/Pixi bridge, controls, hover telemetry
  useGalaxyScene.ts       → Pixi lifecycle, ticker, resize, LOD, input wiring
  StarSprite.ts           → one star's rendering, orbit, sizing, and state
  GalaxyViewport.ts       → pan, zoom, pinch, momentum, focus, reset
  OrbitTrails.ts          → bounded star trail buffers
  AmbientDust.ts          → ambient particles
  ConstellationWeb.ts     → bounded top-star links
  ShockwaveSystem.ts      → event/click wave effects
  useLOD.ts               → reduced-motion and low-end classification
  Ticker.tsx              → activity feed
lib/math/
  galaxyLayout.ts         → shared layout, projection, ranking, normalization
  orbit.ts                → orbital velocity and base math
lib/store/
  galaxyStore.ts          → star state, realtime events, refresh merging
  realtimeSync.ts         → Supabase Realtime subscription and fallback refresh
```

## Coordinate and layout model

The galaxy uses a shared responsive layout. The orbit is an ellipse projected
with `GALAXY_Y_SCALE = 0.62`. The maximum radius is constrained by both the
canvas width and the projected canvas height, preventing narrow/tall viewport
clipping.

Stars are ranked by stable total gravity, entry time, and ID tie-breakers.
Their orbit radii use normalized logarithmic bids so the distribution remains
usable as the product's absolute bid range grows. World positions are converted
to screen positions for HTML overlays and audio panning.

## Performance and LOD

- Full mode renders ambient dust and records trails for the top 30 stars.
- Reduced mode is selected for `prefers-reduced-motion` users and devices with
  two or fewer hardware-concurrency units. It disables ambient dust and limits
  trail work while retaining interactive stars and camera controls.
- The responsive wrapper defaults to list view below 768px while allowing an
  explicit canvas toggle on capable devices.
- Constellation comparisons are bounded to the top 30 stars.
- Trail buffers are bounded to 22 points per star.
- React zoom state is throttled and is not updated on every ticker frame.

Texture atlasing, sprite pooling, FPS probes, and a dedicated lensing shader
are not currently required for correctness and remain future optimization or
visual-polish work.

## Interaction model

- Mouse wheel and trackpad pinch zoom around the pointer/midpoint.
- Two-finger movement preserves midpoint translation.
- Pointer capture prevents drag loss when a pointer leaves the canvas.
- Double-click toggles between overview and focused zoom.
- Camera reset is available from the canvas controls and command palette.
- Selecting a star can focus the camera before opening its preview modal.

## Data synchronization

Realtime events immediately update the local store. Fallback refreshes merge
with local state instead of blindly replacing it, preserving stars and newer
local events when a refresh snapshot is stale or incomplete.

The server currently does not expose a dedicated sequence number in the public
realtime payload. Timestamp ordering is used where available; adding a server
sequence/version is the next step if strict cross-client event ordering becomes
necessary.

## Design and accessibility

The list view remains the accessible/indexable representation of the galaxy.
Demo stars have distinct canvas treatment and labels, while founding stars use
a permanent gold treatment. Numeric values use monospace styling and the canvas
is marked as an interactive application.
