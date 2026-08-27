"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { StarSprite } from "@/components/galaxy/StarSprite";
import { useGalaxyScene, BASE_WIDTH, BASE_HEIGHT } from "@/components/galaxy/useGalaxyScene";
import { OrbitTrails } from "@/components/galaxy/OrbitTrails";
import { GalaxyViewport } from "@/components/galaxy/GalaxyViewport";
import { CanvasControls } from "@/components/galaxy/CanvasControls";
import { sound } from "@/components/galaxy/AudioFeedback";
import { useGalaxyStore } from "@/lib/store/galaxyStore";
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

  const [hovered, setHovered] = useState<{ star: Star; x: number; y: number; rank: number } | null>(
    null
  );
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);

  useEffect(() => {
    pausedRef.current = paused;
    speedRef.current = speed;
  }, [paused, speed]);

  const { appRef, currentZoom, triggerShockwave } = useGalaxyScene(
    hostRef,
    spritesRef,
    trailsRef,
    viewportRef,
    pausedRef,
    speedRef,
    filterTier,
    searchQuery
  );

  const activeSorted = useMemo(
    () =>
      [...stars]
        .filter((s) => s.status === "active")
        .sort((a, b) => b.totalBidCents - a.totalBidCents),
    [stars]
  );

  const handleStarClick = useCallback(
    (star: Star) => {
      const sprite = spritesRef.current.get(star.id);
      const pos = sprite?.container.position;
      const pan = pos ? (pos.x / BASE_WIDTH) * 2 - 1 : 0;
      const rank = activeSorted.findIndex((s) => s.id === star.id) + 1;

      sound.playSelect(pan, rank > 0 ? rank : 1);
      if (pos) triggerShockwave(pos.x, pos.y, "click");

      if (onSelectStar) onSelectStar(star, rank > 0 ? rank : 1);
      else router.push(`/star/${encodeURIComponent(star.id)}`);
    },
    [activeSorted, onSelectStar, router, triggerShockwave]
  );

  const handleStarHover = useCallback(
    (star: Star | null, x: number, y: number) => {
      if (!star) {
        setHovered(null);
        return;
      }
      const pan = (x / BASE_WIDTH) * 2 - 1;
      sound.playTick(pan);
      const rank = activeSorted.findIndex((s) => s.id === star.id) + 1;
      setHovered({ star, x, y, rank: rank > 0 ? rank : 1 });
    },
    [activeSorted]
  );

  // Subscribe to store recent events to fire realtime shockwaves & SFX
  const recentEvents = useGalaxyStore((state) => state.recentEvents);
  const lastEventRef = useRef<string | null>(null);

  useEffect(() => {
    if (!recentEvents.length) return;
    const latest = recentEvents[0];
    const eventKey = `${latest.starId}-${latest.eventType}-${latest.totalBidCents}`;
    if (lastEventRef.current === eventKey) return;
    lastEventRef.current = eventKey;

    const sprite = spritesRef.current.get(latest.starId);
    const cx = BASE_WIDTH / 2;
    const cy = BASE_HEIGHT / 2;
    const x = sprite?.container.position.x ?? cx;
    const y = sprite?.container.position.y ?? cy;

    if (latest.eventType === "singularity_takeover") {
      sound.playTakeoverSupernova();
      triggerShockwave(x, y, "singularity_takeover");
    } else if (latest.eventType === "spawn") {
      sound.playSelect(0, 1);
      triggerShockwave(x, y, "spawn");
    } else {
      sound.playSelect(0, 3);
      triggerShockwave(x, y, "fuel");
    }
  }, [recentEvents, triggerShockwave]);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    const maxRadius = Math.min(BASE_WIDTH, BASE_HEIGHT) * 0.44;
    const currentMap = spritesRef.current;
    const activeIds = new Set<string>();

    activeSorted.forEach((star, index) => {
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
  }, [activeSorted, appRef, handleStarClick, handleStarHover]);

  return (
    <div className="relative h-full min-h-[550px] w-full overflow-hidden rounded-xl bg-[#07070b] sm:min-h-[640px] lg:min-h-[720px] select-none cursor-grab active:cursor-grabbing">
      <div
        ref={hostRef}
        aria-label="Interactive celestial accretion disk — use mouse to pan and scroll to zoom"
        role="application"
        className="h-full w-full"
      />
      <div className="absolute bottom-2.5 right-2.5 z-20">
        <CanvasControls
          paused={paused}
          onTogglePause={() => setPaused(!paused)}
          speed={speed}
          onChangeSpeed={(s) => {
            sound.playTick();
            setSpeed(s);
          }}
          zoom={currentZoom}
          onZoomIn={() => {
            sound.playTick();
            viewportRef.current?.zoomIn();
          }}
          onZoomOut={() => {
            sound.playTick();
            viewportRef.current?.zoomOut();
          }}
          onResetZoom={() => {
            sound.playTick();
            viewportRef.current?.reset();
          }}
        />
      </div>
      {hovered && (
        <aside
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded border border-white/[0.08] bg-[#0c0c12]/95 px-3 py-1.5 font-mono text-xs shadow-2xl backdrop-blur-md"
          style={{
            left: `${(hovered.x / BASE_WIDTH) * 100}%`,
            top: `${(hovered.y / BASE_HEIGHT) * 100}%`,
          }}
        >
          <p className="font-bold text-[#f3f4f6]">{hovered.star.name}</p>
          <p className="text-[11px] text-[#fbbf24]">
            #{hovered.rank} · ${(hovered.star.totalBidCents / 100).toFixed(2)}
          </p>
        </aside>
      )}
    </div>
  );
}
