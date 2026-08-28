import "pixi.js/unsafe-eval";
import { useEffect, useRef, useState, useCallback } from "react";
import { Application, Container } from "pixi.js";
import { drawAccretionGuides, drawSingularityCore } from "@/components/galaxy/CanvasBackground";
import { OrbitTrails } from "@/components/galaxy/OrbitTrails";
import { GalaxyViewport } from "@/components/galaxy/GalaxyViewport";
import { ShockwaveSystem } from "@/components/galaxy/ShockwaveSystem";
import { ConstellationWeb } from "@/components/galaxy/ConstellationWeb";
import type { FilterTier } from "@/components/galaxy/ObservatoryHUD";
import type { StarSprite } from "@/components/galaxy/StarSprite";
import { calculateGalaxyLayout } from "@/lib/math/galaxyLayout";
import { Lensing } from "@/components/galaxy/Lensing";
import { AmbientGalaxy } from "@/components/galaxy/AmbientGalaxy";

export const BASE_WIDTH = 1200;
export const BASE_HEIGHT = 760;

export function useGalaxyScene(
  hostRef: React.RefObject<HTMLDivElement | null>,
  spritesRef: React.RefObject<Map<string, StarSprite>>,
  trailsRef: React.RefObject<OrbitTrails | null>,
  viewportRef: React.RefObject<GalaxyViewport | null>,
  pausedRef: React.RefObject<boolean>,
  speedRef: React.RefObject<number>,
  filterTier: FilterTier = "all",
  searchQuery = "",
  lod: "full" | "reduced" = "full",
  leader: { name: string; totalBidCents: number } | undefined = undefined,
  onSelectLeader?: () => void,
) {
  const [currentZoom, setCurrentZoom] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const shockwavesRef = useRef<ShockwaveSystem | null>(null);
  const constellationRef = useRef<ConstellationWeb | null>(null);
  const lensingRef = useRef<Lensing | null>(null);
  const ambientRef = useRef<AmbientGalaxy | null>(null);
  const starContainerRef = useRef<Container | null>(null);
  const populationRef = useRef(20);
  const leaderRef = useRef(leader);
  const leaderSelectRef = useRef(onSelectLeader);

  const triggerShockwave = useCallback(
    (x: number, y: number, type: "spawn" | "fuel" | "singularity_takeover" | "click") => {
      shockwavesRef.current?.trigger(x, y, type);
    },
    []
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let mounted = true;
    const app = new Application();
    const sprites = spritesRef.current;

    let resizeObserver: ResizeObserver | null = null;
    let onWheel: ((e: WheelEvent) => void) | null = null;
    let onPointerDown: ((e: PointerEvent) => void) | null = null;
    let onPointerMove: ((e: PointerEvent) => void) | null = null;
    let onPointerUp: ((e: PointerEvent) => void) | null = null;
    let onPointerCapture: ((e: PointerEvent) => void) | null = null;
    let onDblClick: ((e: MouseEvent) => void) | null = null;

    const initialWidth = host.clientWidth || BASE_WIDTH;
    const initialHeight = host.clientHeight || BASE_HEIGHT;

    let destroyed = false;
    const initialization = app
      .init({
        width: initialWidth,
        height: initialHeight,
        background: 0x07070b,
        antialias: true,
        resolution: typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1,
        autoDensity: true,
      })
      .then(() => {
        if (!mounted || destroyed || !hostRef.current) {
          if (!destroyed) app.destroy(true, { children: true });
          return;
        }

        while (hostRef.current.firstChild) {
          hostRef.current.removeChild(hostRef.current.firstChild);
        }

        hostRef.current.appendChild(app.canvas);
        app.canvas.style.width = "100%";
        app.canvas.style.height = "100%";
        app.canvas.style.display = "block";
        app.canvas.style.touchAction = "none";

        populationRef.current = sprites?.size ?? 20;
        let { cx, cy, maxRadius, worldWidth, worldHeight } = calculateGalaxyLayout(initialWidth, initialHeight, undefined, populationRef.current);

        const world = new Container();
        app.stage.addChild(world);
        // Layout coordinates are local to the galaxy world. Translate the
        // world origin to its center, then scale the persistent world into the
        // actual canvas viewport.
        const initialScale = Math.min(initialWidth / worldWidth, initialHeight / worldHeight) * 0.9;
        const viewport = new GalaxyViewport(world, initialWidth / 2, initialHeight / 2, initialScale);
        viewportRef.current = viewport;
        viewport.updateWorldRadius(maxRadius, worldWidth, worldHeight);

        // Layer 1: Persistent ambient galaxy field and accretion guides
        const ambient = new AmbientGalaxy(maxRadius);
        ambientRef.current = ambient;
        world.addChild(ambient.container);

        const guidesContainer = new Container();
        guidesContainer.addChild(drawAccretionGuides(cx, cy, maxRadius));
        world.addChild(guidesContainer);

        // Layer 2: Gravitational Constellation Filaments
        const constellation = new ConstellationWeb();
        constellationRef.current = constellation;
        world.addChild(constellation.container);

        // Layer 4: Orbital Comet Tails
        const trails = new OrbitTrails();
        trailsRef.current = trails;
        world.addChild(trails.container);

        // Layer 5: Singularity Core & Photon Sphere
        const coreContainer = new Container();
        coreContainer.addChild(drawSingularityCore(cx, cy, leaderRef.current, () => leaderSelectRef.current?.(), undefined));
        world.addChild(coreContainer);

        const lensing = new Lensing();
        lensingRef.current = lensing;
        world.addChild(lensing.container);

        // Layer 6: Dynamic Shockwave & Nova Ripples
        const shockwaves = new ShockwaveSystem();
        shockwavesRef.current = shockwaves;
        world.addChild(shockwaves.container);

        // Layer 7: Star Sprites Display Container
        const starContainer = new Container();
        world.addChild(starContainer);
        starContainerRef.current = starContainer;

        const tierColors = new Map<string, { color: number; alpha: number }>();
        const starNodes: Array<{ id: string; x: number; y: number; rank: number; isHovered: boolean }> =
          [];

        let lastReportedZoom = viewport.scale;
        app.ticker.add((ticker) => {
          const frameDelta = ticker.deltaTime;
          const animationDelta = frameDelta * (speedRef.current ?? 1);
          viewport.tick(frameDelta);
          if (Math.abs(viewport.scale - lastReportedZoom) > 0.005) {
            lastReportedZoom = viewport.scale;
            setCurrentZoom(viewport.scale);
          }
          if (pausedRef.current) return;

          lensing.tick(animationDelta, cx, cy);
          shockwaves.tick(animationDelta);

          starNodes.length = 0;
          let hoveredStarId: string | null = null;

          sprites?.forEach((sprite, id) => {
            const pt = sprite.tick(animationDelta, cx, cy);
            if (lod === "full" && populationRef.current < 100 && sprite.rank < 30) trails.recordPoint(id, pt.x, pt.y);

            const color =
              sprite.rank === 0
                ? 0x38bdf8
                : sprite.rank < 3
                ? 0xfbbf24
                : sprite.rank < 8
                ? 0xf97316
                : 0x67e8f9;
            tierColors.set(id, { color, alpha: sprite.rank < 3 ? 0.45 : 0.22 });

            if (sprite.isHovered) hoveredStarId = id;
            starNodes.push({ id, x: pt.x, y: pt.y, rank: sprite.rank, isHovered: sprite.isHovered });
          });

          if (lod === "full") trails.renderTrails(tierColors);
          // Keep the galaxy structure clean; straight constellation links conflict with spiral arms.
          constellation.renderLinks([], null);
        });

        // ResizeObserver for dynamic crisp resolution without distortion
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 50 && height > 50) {
              app.renderer.resize(width, height);
              const layout = calculateGalaxyLayout(width, height, undefined, populationRef.current);
              cx = layout.cx;
              cy = layout.cy;
              maxRadius = layout.maxRadius;
              viewport.updateCenter(width / 2, height / 2, Math.min(width / layout.worldWidth, height / layout.worldHeight) * 0.9);
              viewport.updateWorldRadius(maxRadius, layout.worldWidth, layout.worldHeight);
              trails.clear();
              const population = Array.from(sprites ?? [], ([, sprite]) => sprite.star);
              sprites?.forEach((sprite) => {
                sprite.updateLayout(maxRadius);
                sprite.updatePopulation(population);
              });

              // Redraw background guides with new dimensions
              guidesContainer.removeChildren();
              guidesContainer.addChild(drawAccretionGuides(cx, cy, maxRadius));

              coreContainer.removeChildren();
              coreContainer.addChild(drawSingularityCore(cx, cy, leaderRef.current, () => leaderSelectRef.current?.(), undefined));
            }
          }
        });
        resizeObserver.observe(host);

        // Native Multi-Touch, Trackpad Pinch & Mouse Wheel Zoom
        onWheel = (e: WheelEvent) => {
          e.preventDefault();
          const rect = app.canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          viewport.onWheel(e.deltaY, mouseX, mouseY, e.ctrlKey);
        };

        onPointerDown = (e: PointerEvent) => {
          viewport.onPointerDown(e, app.canvas.getBoundingClientRect());
        };

        onPointerMove = (e: PointerEvent) => {
          const rect = app.canvas.getBoundingClientRect();
          viewport.onPointerMove(e, rect);
        };

        onPointerUp = (e: PointerEvent) => {
          viewport.onPointerUp(e);
        };

        onDblClick = (e: MouseEvent) => {
          const rect = app.canvas.getBoundingClientRect();
          viewport.onDoubleTap(e.clientX - rect.left, e.clientY - rect.top);
        };

        app.canvas.addEventListener("wheel", onWheel, { passive: false });
        onPointerCapture = (e: PointerEvent) => {
          if (e.currentTarget instanceof HTMLCanvasElement && !e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        };

        app.canvas.addEventListener("pointerdown", onPointerDown);
        app.canvas.addEventListener("pointerdown", onPointerCapture);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerUp);
        window.addEventListener("blur", () => viewport.cancelPointers());
        app.canvas.addEventListener("dblclick", onDblClick);

        setIsReady(true);
      });

    initialization.catch(() => {
      if (mounted) setIsReady(false);
    });

    return () => {
      mounted = false;
      destroyed = true;
      setIsReady(false);
      if (resizeObserver) resizeObserver.disconnect();
      if (onWheel) app.canvas.removeEventListener("wheel", onWheel);
      if (onPointerDown) app.canvas.removeEventListener("pointerdown", onPointerDown);
      if (onPointerCapture) app.canvas.removeEventListener("pointerdown", onPointerCapture);
      if (onDblClick) app.canvas.removeEventListener("dblclick", onDblClick);
      if (onPointerMove) window.removeEventListener("pointermove", onPointerMove);
      if (onPointerUp) {
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
      }
      sprites?.forEach((s) => s.destroy());
      sprites?.clear();
      trailsRef.current?.destroy();
      shockwavesRef.current?.destroy();
      constellationRef.current?.destroy();
      lensingRef.current?.destroy();
      ambientRef.current?.destroy();
      ambientRef.current = null;
      starContainerRef.current = null;
      app.destroy(true, { children: true });
    };
  }, [hostRef, spritesRef, trailsRef, viewportRef, pausedRef, speedRef, lod]);

  // Update filter highlights on sprites
  useEffect(() => {
    const sprites = spritesRef.current;
    if (!sprites) return;
    const q = searchQuery.trim().toLowerCase();

    sprites.forEach((sprite) => {
      let isMatch = true;
      if (filterTier === "core") isMatch = sprite.rank === 0;
      else if (filterTier === "photon") isMatch = sprite.rank >= 1 && sprite.rank < 3;
      else if (filterTier === "inner") isMatch = sprite.rank >= 3 && sprite.rank < 8;
      else if (filterTier === "founding") isMatch = Boolean(sprite.star.isFounding);

      if (isMatch && q) {
        isMatch =
          sprite.star.name.toLowerCase().includes(q) ||
          Boolean(sprite.star.xHandle?.toLowerCase().includes(q));
      }

      const isDimmed = (filterTier !== "all" || q.length > 0) && !isMatch;
      sprite.setFilterState(isDimmed, isMatch && q.length > 0);
    });
  }, [spritesRef, filterTier, searchQuery]);

  const updatePopulation = useCallback((population: number) => {
    populationRef.current = Math.max(1, population);
  }, []);

  useEffect(() => {
    leaderRef.current = leader;
    leaderSelectRef.current = onSelectLeader;
    const viewport = viewportRef.current;
    const host = hostRef.current;
    if (!viewport || !host) return;
    const nextLayout = calculateGalaxyLayout(host.clientWidth || BASE_WIDTH, host.clientHeight || BASE_HEIGHT, undefined, populationRef.current);
    viewport.updateWorldRadius?.(nextLayout.maxRadius, nextLayout.worldWidth, nextLayout.worldHeight);
  }, [hostRef, leader, onSelectLeader, viewportRef]);

  const resetCamera = useCallback(() => viewportRef.current?.reset(), [viewportRef]);
  const focusCameraOn = useCallback(
    (starId: string, zoom = 1.8) => {
      const sprite = spritesRef.current.get(starId);
      const position = sprite?.getWorldPosition();
      if (position) viewportRef.current?.focusOn(position.x, position.y, zoom);
    },
    [spritesRef, viewportRef],
  );

  return { currentZoom, triggerShockwave, isReady, starContainerRef, resetCamera, focusCameraOn, updatePopulation };
}
