"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Application, Container } from "pixi.js";
import { StarSprite } from "@/components/galaxy/StarSprite";
import { drawAccretionGuides, drawSingularityCore } from "@/components/galaxy/CanvasBackground";
import { AmbientDust } from "@/components/galaxy/AmbientDust";
import { OrbitTrails } from "@/components/galaxy/OrbitTrails";
import { CanvasControls } from "@/components/galaxy/CanvasControls";
import { sound } from "@/components/galaxy/AudioFeedback";
import type { Star } from "@/lib/types";

const BASE_WIDTH = 1200;
const BASE_HEIGHT = 760;

export function GalaxyCanvas({ stars, onSelectStar }: { stars: Star[]; onSelectStar?: (star: Star, rank: number) => void }) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const spritesRef = useRef<Map<string, StarSprite>>(new Map());
  const dustRef = useRef<AmbientDust | null>(null);
  const trailsRef = useRef<OrbitTrails | null>(null);
  const [hovered, setHovered] = useState<{ star: Star; x: number; y: number; rank: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);

  useEffect(() => { pausedRef.current = paused; speedRef.current = speed; }, [paused, speed]);

  const handleStarClick = useCallback((star: Star) => {
    sound.playSelect();
    const sorted = [...stars].filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);
    const rank = sorted.findIndex((s) => s.id === star.id) + 1;
    if (onSelectStar) onSelectStar(star, rank > 0 ? rank : 1);
    else router.push(`/star/${encodeURIComponent(star.id)}`);
  }, [stars, onSelectStar, router]);

  const handleStarHover = useCallback((star: Star | null, x: number, y: number) => {
    if (!star) { setHovered(null); return; }
    const sorted = [...stars].filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);
    const rank = sorted.findIndex((s) => s.id === star.id) + 1;
    setHovered({ star, x, y, rank: rank > 0 ? rank : 1 });
  }, [stars]);

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

      const cx = BASE_WIDTH / 2;
      const cy = BASE_HEIGHT / 2;
      const maxRadius = Math.min(BASE_WIDTH, BASE_HEIGHT) * 0.44;

      app.stage.addChild(drawAccretionGuides(cx, cy, maxRadius));
      app.stage.addChild(drawSingularityCore(cx, cy));
      const dust = new AmbientDust(70, maxRadius);
      dustRef.current = dust;
      app.stage.addChild(dust.container);

      const trails = new OrbitTrails();
      trailsRef.current = trails;
      app.stage.addChild(trails.container);
      const starsLayer = new Container();
      app.stage.addChild(starsLayer);

      const tierColors = new Map<string, { color: number; alpha: number }>();
      app.ticker.add((ticker) => {
        if (pausedRef.current) return;
        const delta = ticker.deltaTime * speedRef.current;
        dust.tick(delta, cx, cy, maxRadius);
        sprites.forEach((sprite, id) => {
          const pt = sprite.tick(delta, cx, cy);
          trails.recordPoint(id, pt.x, pt.y);
          const color = sprite.rank === 0 ? 0x38bdf8 : sprite.rank < 3 ? 0xfbbf24 : sprite.rank < 8 ? 0xf97316 : 0x71717a;
          tierColors.set(id, { color, alpha: sprite.rank < 3 ? 0.35 : 0.18 });
        });
        trails.renderTrails(tierColors);
      });
    });

    return () => {
      mounted = false;
      sprites.forEach((s) => s.destroy());
      sprites.clear();
      dustRef.current?.destroy();
      trailsRef.current?.destroy();
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    const active = [...stars].filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);
    const maxRadius = Math.min(BASE_WIDTH, BASE_HEIGHT) * 0.44;
    const currentMap = spritesRef.current;
    const activeIds = new Set<string>();

    active.forEach((star, index) => {
      activeIds.add(star.id);
      const existing = currentMap.get(star.id);
      if (existing) existing.updateData(star, index, maxRadius);
      else {
        const sprite = new StarSprite(star, index, maxRadius, handleStarClick, handleStarHover);
        currentMap.set(star.id, sprite);
        app.stage.addChild(sprite.container);
      }
    });

    currentMap.forEach((sprite, id) => {
      if (!activeIds.has(id)) {
        app.stage.removeChild(sprite.container);
        sprite.destroy();
        trailsRef.current?.removeStar(id);
        currentMap.delete(id);
      }
    });
  }, [stars, handleStarClick, handleStarHover]);

  return (
    <div className="relative h-full min-h-[550px] w-full overflow-hidden rounded-xl bg-[#07070b] sm:min-h-[640px] lg:min-h-[720px]">
      <div ref={hostRef} aria-label="Interactive celestial accretion disk" role="img" className="h-full w-full" />
      <div className="absolute bottom-2.5 right-2.5 z-20">
        <CanvasControls paused={paused} onTogglePause={() => setPaused(!paused)} speed={speed} onChangeSpeed={(s) => { sound.playTick(); setSpeed(s); }} />
      </div>
      {hovered && (
        <aside className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded border border-white/[0.08] bg-[#0c0c12]/95 px-3 py-1.5 font-mono text-xs shadow-2xl backdrop-blur-md" style={{ left: `${(hovered.x / BASE_WIDTH) * 100}%`, top: `${(hovered.y / BASE_HEIGHT) * 100}%` }}>
          <p className="font-bold text-[#f3f4f6]">{hovered.star.name}</p>
          <p className="text-[11px] text-[#fbbf24]">#{hovered.rank} · ${(hovered.star.totalBidCents / 100).toFixed(2)}</p>
        </aside>
      )}
    </div>
  );
}
