"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Application, Container, Graphics } from "pixi.js";
import { StarSprite } from "@/components/galaxy/StarSprite";
import { CanvasControls } from "@/components/galaxy/CanvasControls";
import type { Star } from "@/lib/types";

const BASE_WIDTH = 900;
const BASE_HEIGHT = 620;

function drawCore(cx: number, cy: number): Container {
  const container = new Container();
  const glow = new Graphics();
  glow.circle(cx, cy, 45).fill({ color: 0xff6b35, alpha: 0.12 });
  glow.circle(cx, cy, 34).stroke({ color: 0xffb627, alpha: 0.35, width: 2 });
  container.addChild(glow);

  const core = new Graphics();
  core.circle(cx, cy, 24).fill(0x020205);
  core.circle(cx, cy, 26).stroke({ color: 0xfff4e0, alpha: 0.6, width: 2 });
  container.addChild(core);
  return container;
}

export function GalaxyCanvas({ stars, onSelectStar }: { stars: Star[]; onSelectStar?: (star: Star, rank: number) => void }) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const spritesRef = useRef<Map<string, StarSprite>>(new Map());
  const starsLayerRef = useRef<Container | null>(null);
  const [hovered, setHovered] = useState<{ star: Star; x: number; y: number; rank: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);

  useEffect(() => {
    pausedRef.current = paused;
    speedRef.current = speed;
  }, [paused, speed]);

  const handleStarClick = useCallback((star: Star) => {
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

    void app.init({
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
      background: 0x05050a,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    }).then(() => {
      if (!mounted || !hostRef.current) { app.destroy(true, { children: true }); return; }
      host.appendChild(app.canvas);
      app.canvas.style.width = "100%";
      app.canvas.style.height = "auto";
      app.canvas.style.display = "block";

      app.stage.addChild(drawCore(BASE_WIDTH / 2, BASE_HEIGHT / 2));
      const starsLayer = new Container();
      starsLayerRef.current = starsLayer;
      app.stage.addChild(starsLayer);

      app.ticker.add((ticker) => {
        if (pausedRef.current) return;
        const cx = BASE_WIDTH / 2;
        const cy = BASE_HEIGHT / 2;
        const delta = ticker.deltaTime * speedRef.current;
        sprites.forEach((sprite) => sprite.tick(delta, cx, cy));
      });
    });

    return () => {
      mounted = false;
      sprites.forEach((s) => s.destroy());
      sprites.clear();
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    const starsLayer = starsLayerRef.current;
    if (!starsLayer) return;

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
        starsLayer.addChild(sprite.container);
      }
    });

    currentMap.forEach((sprite, id) => {
      if (!activeIds.has(id)) {
        starsLayer.removeChild(sprite.container);
        sprite.destroy();
        currentMap.delete(id);
      }
    });
  }, [stars, handleStarClick, handleStarHover]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div ref={hostRef} aria-label="Interactive gravity well galaxy canvas" role="img" />
      <div className="absolute bottom-3 right-3 z-20">
        <CanvasControls paused={paused} onTogglePause={() => setPaused(!paused)} speed={speed} onChangeSpeed={setSpeed} />
      </div>
      {hovered && (
        <aside
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl border border-white/20 bg-[#0a0a14]/90 px-3 py-2 text-xs backdrop-blur-sm shadow-xl"
          style={{ left: `${(hovered.x / BASE_WIDTH) * 100}%`, top: `${(hovered.y / BASE_HEIGHT) * 100}%` }}
        >
          <p className="font-semibold text-[#fff4e0]">{hovered.star.name}</p>
          <p className="font-mono text-[#ffb627]">#{hovered.rank} · ${(hovered.star.totalBidCents / 100).toFixed(2)}</p>
          <p className="font-mono text-[10px] text-[#4cc9f0]">Click to preview</p>
        </aside>
      )}
    </div>
  );
}
