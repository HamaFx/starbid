import { useEffect, useRef, useState } from "react";
import { Application, Container } from "pixi.js";
import { drawAccretionGuides, drawSingularityCore } from "@/components/galaxy/CanvasBackground";
import { AmbientDust } from "@/components/galaxy/AmbientDust";
import { OrbitTrails } from "@/components/galaxy/OrbitTrails";
import { GalaxyViewport } from "@/components/galaxy/GalaxyViewport";
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
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let mounted = true;
    const app = new Application();
    appRef.current = app;
    const sprites = spritesRef.current;

    void app.init({ width: BASE_WIDTH, height: BASE_HEIGHT, background: 0x07070b, antialias: true, resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true }).then(() => {
      if (!mounted || !hostRef.current) { app.destroy(true, { children: true }); return; }
      host.appendChild(app.canvas);
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

      world.addChild(drawAccretionGuides(cx, cy, maxRadius));
      world.addChild(drawSingularityCore(cx, cy));
      const dust = new AmbientDust(70, maxRadius);
      world.addChild(dust.container);
      const trails = new OrbitTrails();
      trailsRef.current = trails;
      world.addChild(trails.container);

      const tierColors = new Map<string, { color: number; alpha: number }>();
      app.ticker.add((ticker) => {
        const delta = ticker.deltaTime * (speedRef.current ?? 1);
        viewport.tick(delta);
        setCurrentZoom(viewport.scale);
        if (pausedRef.current) return;
        dust.tick(delta, cx, cy, maxRadius);
        sprites?.forEach((sprite, id) => {
          const pt = sprite.tick(delta, cx, cy);
          trails.recordPoint(id, pt.x, pt.y);
          const color = sprite.rank === 0 ? 0x38bdf8 : sprite.rank < 3 ? 0xfbbf24 : sprite.rank < 8 ? 0xf97316 : 0x71717a;
          tierColors.set(id, { color, alpha: sprite.rank < 3 ? 0.35 : 0.18 });
        });
        trails.renderTrails(tierColors);
      });

      const onWheel = (e: WheelEvent) => { e.preventDefault(); const rect = app.canvas.getBoundingClientRect(); viewport.onWheel(e.deltaY, (e.clientX - rect.left) * (BASE_WIDTH / rect.width), (e.clientY - rect.top) * (BASE_HEIGHT / rect.height), cx, cy); };
      const onDown = (e: PointerEvent) => { viewport.startDrag(e.clientX, e.clientY); };
      const onMove = (e: PointerEvent) => { viewport.onDrag(e.clientX, e.clientY); };
      const onUp = () => { viewport.endDrag(); };

      app.canvas.addEventListener("wheel", onWheel, { passive: false });
      app.canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });

    return () => {
      mounted = false;
      sprites?.forEach((s) => s.destroy());
      sprites?.clear();
      trailsRef.current?.destroy();
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
        isMatch = sprite.star.name.toLowerCase().includes(q) || Boolean(sprite.star.xHandle?.toLowerCase().includes(q));
      }

      const isDimmed = (filterTier !== "all" || q.length > 0) && !isMatch;
      sprite.setFilterState(isDimmed, isMatch && q.length > 0);
    });
  }, [spritesRef, filterTier, searchQuery]);

  return { appRef, currentZoom };
}
