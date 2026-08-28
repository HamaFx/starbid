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
import { radius } from "@/lib/math/orbit";
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

  const [hovered, setHovered] = useState<{
    star: Star;
    x: number;
    y: number;
    rank: number;
    au: string;
    speed: string;
    angle: number;
    deltaDollars: string;
  } | null>(null);

  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);

  useEffect(() => {
    pausedRef.current = paused;
    speedRef.current = speed;
  }, [paused, speed]);

  const { appRef, currentZoom, triggerShockwave, isReady, starContainerRef } = useGalaxyScene(
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
      const totalDollars = star.totalBidCents / 100;
      const r = radius(totalDollars, 320);
      const au = ((r / 320) * 5.0).toFixed(2);
      const orbitalSpeed = (350 / Math.sqrt(Math.max(10, r))).toFixed(1);
      const angleDeg = Math.round(star.angleSeed % 360);

      const prevRankStar = rank > 1 ? activeSorted[rank - 2] : null;
      const deltaCents = prevRankStar
        ? prevRankStar.totalBidCents - star.totalBidCents + 100
        : 0;

      setHovered({
        star,
        x,
        y,
        rank: rank > 0 ? rank : 1,
        au,
        speed: orbitalSpeed,
        angle: angleDeg,
        deltaDollars: (deltaCents / 100).toFixed(2),
      });
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
    const cx = (hostRef.current?.clientWidth ?? BASE_WIDTH) / 2;
    const cy = (hostRef.current?.clientHeight ?? BASE_HEIGHT) / 2;
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

  // Synchronize star sprites with PixiJS display container whenever ready or stars change
  useEffect(() => {
    const starContainer = starContainerRef.current;
    if (!isReady || !starContainer) return;

    const hostW = hostRef.current?.clientWidth || BASE_WIDTH;
    const hostH = hostRef.current?.clientHeight || BASE_HEIGHT;
    const maxRadius = Math.min(hostW, hostH) * 0.42;
    const currentMap = spritesRef.current;
    const activeIds = new Set<string>();

    activeSorted.forEach((star, index) => {
      activeIds.add(star.id);
      const existing = currentMap.get(star.id);
      if (existing) {
        existing.updateData(star, index, maxRadius);
        if (existing.container.parent !== starContainer) {
          starContainer.addChild(existing.container);
        }
      } else {
        const sprite = new StarSprite(star, index, maxRadius, handleStarClick, handleStarHover);
        currentMap.set(star.id, sprite);
        starContainer.addChild(sprite.container);
      }
    });

    currentMap.forEach((sprite, id) => {
      if (!activeIds.has(id)) {
        if (sprite.container.parent === starContainer) {
          starContainer.removeChild(sprite.container);
        }
        sprite.destroy();
        trailsRef.current?.removeStar(id);
        currentMap.delete(id);
      }
    });
  }, [isReady, activeSorted, handleStarClick, handleStarHover, starContainerRef]);

  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden rounded-xl bg-[#07070b] select-none cursor-grab active:cursor-grabbing">
      <div
        ref={hostRef}
        aria-label="Interactive celestial accretion disk — use mouse/trackpad to pan and zoom"
        role="application"
        className="h-full w-full min-h-0"
      />

      {/* Top-Right Astronomical Caliper Scale Indicator */}
      <div className="pointer-events-none absolute top-3 right-3 z-20 flex flex-col items-end gap-1 font-mono text-[9px] text-[#71717a]">
        <div className="flex items-center gap-1.5 rounded bg-black/60 px-2 py-0.5 border border-white/10 backdrop-blur-md">
          <span>CALIPER SCALE:</span>
          <span className="text-[#38bdf8] font-bold">{(1.0 / currentZoom).toFixed(2)} AU / div</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] text-[#52525b]">
          <span>[Double-click zoom · Scroll pan]</span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-14 right-2.5 z-20 sm:bottom-2.5">
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

      {/* Holographic Astronomical Telemetry Card on Hover */}
      {hovered && (
        <aside
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full rounded-xl border border-[#38bdf8]/40 bg-[#0c0c12]/95 p-3.5 font-mono text-xs shadow-2xl backdrop-blur-lg min-w-[240px] space-y-2"
          style={{
            left: `${hovered.x}px`,
            top: `${hovered.y - 12}px`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <span className="h-2 w-2 rounded-full bg-[#38bdf8] animate-ping" />
              <p className="font-bold text-[#f3f4f6] truncate text-xs">{hovered.star.name}</p>
            </div>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-[#fbbf24]">
              #{hovered.rank}
            </span>
          </div>

          {/* Precision Orbital Telemetry Grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-[#71717a]">
            <div>
              <span className="text-[#52525b]">DISTANCE:</span>
              <p className="font-semibold text-[#38bdf8]">{hovered.au} AU</p>
            </div>
            <div>
              <span className="text-[#52525b]">VELOCITY:</span>
              <p className="font-semibold text-[#22d3ee]">{hovered.speed} km/s</p>
            </div>
            <div>
              <span className="text-[#52525b]">GRAVITY MASS:</span>
              <p className="font-bold text-[#fbbf24]">
                ${(hovered.star.totalBidCents / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-[#52525b]">BEARING:</span>
              <p className="font-semibold text-[#f3f4f6]">{hovered.angle}°</p>
            </div>
          </div>

          {/* Dethrone Target Callout */}
          {hovered.rank > 1 && (
            <div className="rounded border border-[#fbbf24]/20 bg-[#fbbf24]/5 px-2 py-1 text-[10px] text-[#fbbf24] flex justify-between">
              <span>+${hovered.deltaDollars} to pass #{hovered.rank - 1}</span>
              <span className="font-bold">↗</span>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
