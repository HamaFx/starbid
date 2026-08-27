import { useEffect, useRef, useState, useCallback } from "react";
import { Application, Container } from "pixi.js";
import { drawAccretionGuides, drawSingularityCore } from "@/components/galaxy/CanvasBackground";
import { AmbientDust } from "@/components/galaxy/AmbientDust";
import { OrbitTrails } from "@/components/galaxy/OrbitTrails";
import { GalaxyViewport } from "@/components/galaxy/GalaxyViewport";
import { ShockwaveSystem } from "@/components/galaxy/ShockwaveSystem";
import { ConstellationWeb } from "@/components/galaxy/ConstellationWeb";
import type { FilterTier } from "@/components/galaxy/ObservatoryHUD";
import type { StarSprite } from "@/components/galaxy/StarSprite";

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
  searchQuery = ""
) {
  const [currentZoom, setCurrentZoom] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const appRef = useRef<Application | null>(null);
  const shockwavesRef = useRef<ShockwaveSystem | null>(null);
  const constellationRef = useRef<ConstellationWeb | null>(null);
  const starContainerRef = useRef<Container | null>(null);

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
    appRef.current = app;
    const sprites = spritesRef.current;

    let onWheel: ((e: WheelEvent) => void) | null = null;
    let onDown: ((e: PointerEvent) => void) | null = null;
    let onMove: ((e: PointerEvent) => void) | null = null;
    let onUp: (() => void) | null = null;

    void app
      .init({
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        background: 0x07070b,
        antialias: true,
        resolution: typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1,
        autoDensity: true,
      })
      .then(() => {
        if (!mounted || !hostRef.current) {
          app.destroy(true, { children: true });
          return;
        }

        // Clean out any stale canvas in host
        while (hostRef.current.firstChild) {
          hostRef.current.removeChild(hostRef.current.firstChild);
        }

        hostRef.current.appendChild(app.canvas);
        app.canvas.style.width = "100%";
        app.canvas.style.height = "100%";
        app.canvas.style.display = "block";

        const world = new Container();
        app.stage.addChild(world);
        const viewport = new GalaxyViewport(world);
        viewportRef.current = viewport;

        const cx = BASE_WIDTH / 2;
        const cy = BASE_HEIGHT / 2;
        const maxRadius = Math.min(BASE_WIDTH, BASE_HEIGHT) * 0.44;

        // Layer 1: Coordinate Grid & Accretion Guides
        world.addChild(drawAccretionGuides(cx, cy, maxRadius));

        // Layer 2: Ambient Relativistic Accretion Gas Particles
        const dust = new AmbientDust(160, maxRadius);
        world.addChild(dust.container);

        // Layer 3: Gravitational Constellation Filaments
        const constellation = new ConstellationWeb();
        constellationRef.current = constellation;
        world.addChild(constellation.container);

        // Layer 4: Orbital Comet Tails
        const trails = new OrbitTrails();
        trailsRef.current = trails;
        world.addChild(trails.container);

        // Layer 5: Singularity Core & Photon Sphere
        world.addChild(drawSingularityCore(cx, cy));

        // Layer 6: Dynamic Shockwave & Nova Ripples
        const shockwaves = new ShockwaveSystem();
        shockwavesRef.current = shockwaves;
        world.addChild(shockwaves.container);

        // Layer 7: Star Sprites Dedicated Display Container
        const starContainer = new Container();
        world.addChild(starContainer);
        starContainerRef.current = starContainer;

        const tierColors = new Map<string, { color: number; alpha: number }>();
        const starNodes: Array<{ id: string; x: number; y: number; rank: number; isHovered: boolean }> =
          [];

        app.ticker.add((ticker) => {
          const delta = ticker.deltaTime * (speedRef.current ?? 1);
          viewport.tick(delta);
          setCurrentZoom(viewport.scale);
          if (pausedRef.current) return;

          dust.tick(delta, cx, cy, maxRadius);
          shockwaves.tick(delta);

          starNodes.length = 0;
          let hoveredStarId: string | null = null;

          sprites?.forEach((sprite, id) => {
            const pt = sprite.tick(delta, cx, cy);
            trails.recordPoint(id, pt.x, pt.y);

            const color =
              sprite.rank === 0
                ? 0x38bdf8
                : sprite.rank < 3
                ? 0xfbbf24
                : sprite.rank < 8
                ? 0xf97316
                : 0x71717a;
            tierColors.set(id, { color, alpha: sprite.rank < 3 ? 0.38 : 0.20 });

            if (sprite.isHovered) hoveredStarId = id;
            starNodes.push({ id, x: pt.x, y: pt.y, rank: sprite.rank, isHovered: sprite.isHovered });
          });

          trails.renderTrails(tierColors);
          constellation.renderLinks(starNodes, hoveredStarId);
        });

        onWheel = (e: WheelEvent) => {
          e.preventDefault();
          const rect = app.canvas.getBoundingClientRect();
          viewport.onWheel(
            e.deltaY,
            (e.clientX - rect.left) * (BASE_WIDTH / rect.width),
            (e.clientY - rect.top) * (BASE_HEIGHT / rect.height),
            cx,
            cy
          );
        };
        onDown = (e: PointerEvent) => {
          viewport.startDrag(e.clientX, e.clientY);
        };
        onMove = (e: PointerEvent) => {
          viewport.onDrag(e.clientX, e.clientY);
        };
        onUp = () => {
          viewport.endDrag();
        };

        app.canvas.addEventListener("wheel", onWheel, { passive: false });
        app.canvas.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);

        setIsReady(true);
      });

    return () => {
      mounted = false;
      setIsReady(false);
      if (onMove) window.removeEventListener("pointermove", onMove);
      if (onUp) window.removeEventListener("pointerup", onUp);
      sprites?.forEach((s) => s.destroy());
      sprites?.clear();
      trailsRef.current?.destroy();
      shockwavesRef.current?.destroy();
      constellationRef.current?.destroy();
      starContainerRef.current = null;
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, [hostRef, spritesRef, trailsRef, viewportRef, pausedRef, speedRef]);

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

  return { appRef, currentZoom, triggerShockwave, isReady, starContainerRef };
}
