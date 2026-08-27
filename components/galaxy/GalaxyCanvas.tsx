"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StarSprite } from "@/components/galaxy/StarSprite";
import { useGalaxyScene, BASE_WIDTH, BASE_HEIGHT } from "@/components/galaxy/useGalaxyScene";
import { OrbitTrails } from "@/components/galaxy/OrbitTrails";
import { GalaxyViewport } from "@/components/galaxy/GalaxyViewport";
import { CanvasControls } from "@/components/galaxy/CanvasControls";
import { sound } from "@/components/galaxy/AudioFeedback";
import type { FilterTier } from "@/components/galaxy/ObservatoryHUD";
import type { Star } from "@/lib/types";

export function GalaxyCanvas({
  stars,
  filterTier = "all",
  searchQuery = "",
  onSelectStar,
}: {
  stars: Star[];
  filterTier?: FilterTier;
  searchQuery?: string;
  onSelectStar?: (star: Star, rank: number) => void;
}) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement>(null);
  const spritesRef = useRef<Map<string, StarSprite>>(new Map());
  const trailsRef = useRef<OrbitTrails | null>(null);
  const viewportRef = useRef<GalaxyViewport | null>(null);

  const [hovered, setHovered] = useState<{ star: Star; x: number; y: number; rank: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);

  useEffect(() => { pausedRef.current = paused; speedRef.current = speed; }, [paused, speed]);

  const { appRef, currentZoom } = useGalaxyScene(
    hostRef,
    spritesRef,
    trailsRef,
    viewportRef,
    pausedRef,
    speedRef,
    filterTier,
    searchQuery
  );

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
        app.stage.children[0]?.addChild(sprite.container);
      }
    });

    currentMap.forEach((sprite, id) => {
      if (!activeIds.has(id)) {
        app.stage.children[0]?.removeChild(sprite.container);
        sprite.destroy();
        trailsRef.current?.removeStar(id);
        currentMap.delete(id);
      }
    });
  }, [stars, appRef, handleStarClick, handleStarHover]);

  return (
    <div className="relative h-full min-h-[550px] w-full overflow-hidden rounded-xl bg-[#07070b] sm:min-h-[640px] lg:min-h-[720px] select-none cursor-grab active:cursor-grabbing">
      <div ref={hostRef} aria-label="Interactive celestial accretion disk" role="img" className="h-full w-full" />
      <div className="absolute bottom-2.5 right-2.5 z-20">
        <CanvasControls
          paused={paused}
          onTogglePause={() => setPaused(!paused)}
          speed={speed}
          onChangeSpeed={(s) => { sound.playTick(); setSpeed(s); }}
          zoom={currentZoom}
          onZoomIn={() => { sound.playTick(); viewportRef.current?.zoomIn(); }}
          onZoomOut={() => { sound.playTick(); viewportRef.current?.zoomOut(); }}
          onResetZoom={() => { sound.playTick(); viewportRef.current?.reset(); }}
        />
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
