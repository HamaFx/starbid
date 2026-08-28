"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { StarSprite } from "@/components/galaxy/StarSprite";
import { StarSpritePool } from "@/components/galaxy/StarSpritePool";
import { useGalaxyScene, BASE_HEIGHT, BASE_WIDTH } from "@/components/galaxy/useGalaxyScene";
import { useGalaxySpriteSync } from "@/components/galaxy/useGalaxySpriteSync";
import { useGalaxyInteraction, type HoveredStar } from "@/components/galaxy/useGalaxyInteraction";
import { useGalaxyEvents } from "@/components/galaxy/useGalaxyEvents";
import { GalaxyTelemetryOverlay } from "@/components/galaxy/GalaxyTelemetryOverlay";
import { createGalaxySceneController, type GalaxySceneController } from "@/components/galaxy/GalaxySceneController";
import { OrbitTrails } from "@/components/galaxy/OrbitTrails";
import { GalaxyViewport } from "@/components/galaxy/GalaxyViewport";
import { CanvasControls } from "@/components/galaxy/CanvasControls";
import { sound } from "@/components/galaxy/AudioFeedback";
import { useGalaxyStore } from "@/lib/store/galaxyStore";
import { galaxySectorForPoint } from "@/lib/math/galaxySectors";
import { visibleStarIds } from "@/lib/math/galaxyVisibility";
import { galaxyPointForStar } from "@/lib/math/galaxyLayout";
import { calculateGalaxyLayout, rankActiveStars } from "@/lib/math/galaxyLayout";
import type { FilterTier } from "@/components/galaxy/ObservatoryHUD";
import type { Star } from "@/lib/types";
import { useLOD } from "@/components/galaxy/useLOD";

export function GalaxyCanvas({ stars, filterTier = "all", searchQuery = "", onSelectStar, controllerRef }: {
  stars: Star[];
  filterTier?: FilterTier;
  searchQuery?: string;
  onSelectStar?: (star: Star, rank: number) => void;
  controllerRef?: React.RefObject<GalaxySceneController | null>;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const spritesRef = useRef<Map<string, StarSprite>>(new Map());
  const spritePoolRef = useRef(new StarSpritePool());
  const trailsRef = useRef<OrbitTrails | null>(null);
  const viewportRef = useRef<GalaxyViewport | null>(null);
  const [hovered, setHovered] = useState<HoveredStar | null>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const lodMode = useLOD();
  const lod = lodMode === "list" ? "reduced" : lodMode;
  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);
  const activeSorted = useMemo(() => rankActiveStars(stars), [stars]);
  const leader = activeSorted[0];

  useEffect(() => { pausedRef.current = paused; speedRef.current = speed; }, [paused, speed]);

  const scene = useGalaxyScene(hostRef, spritesRef, trailsRef, viewportRef, pausedRef, speedRef, filterTier, searchQuery, lod, leader, leader ? () => onSelectStar?.(leader, 1) : undefined);
  const { handleStarClick, handleStarHover } = useGalaxyInteraction(activeSorted, hostRef, spritesRef, viewportRef, scene.focusCameraOn, scene.triggerShockwave, onSelectStar);
  const recentEvents = useGalaxyStore((state) => state.recentEvents);

  useEffect(() => { scene.updatePopulation(activeSorted.length); }, [activeSorted.length, scene]);
  useEffect(() => () => spritePoolRef.current.clear(), []);
  useEffect(() => {
    if (controllerRef) controllerRef.current = createGalaxySceneController(viewportRef, spritesRef);
    return () => { if (controllerRef) controllerRef.current = null; };
  }, [controllerRef, viewportRef, spritesRef]);
  useGalaxyEvents(recentEvents, spritesRef, hostRef, scene.triggerShockwave);

  useGalaxySpriteSync(activeSorted, scene.isReady, scene.starContainerRef, hostRef, spritesRef,    spritePoolRef,
    trailsRef, {
    onClick: handleStarClick,
    onHover: (star, x, y) => setHovered(handleStarHover(star, x, y)),
  });

  useEffect(() => {
    spritesRef.current.forEach((sprite) => {
      const query = searchQuery.trim().toLowerCase();
      let match = filterTier === "all" || (filterTier === "core" && sprite.rank === 0) || (filterTier === "photon" && sprite.rank >= 1 && sprite.rank < 3) || (filterTier === "inner" && sprite.rank >= 3 && sprite.rank < 8) || (filterTier === "founding" && sprite.star.isFounding);
      if (match && query) match = sprite.star.name.toLowerCase().includes(query) || Boolean(sprite.star.xHandle?.toLowerCase().includes(query));
      sprite.setFilterState((filterTier !== "all" || query.length > 0) && !match, match && query.length > 0);
    });
  }, [filterTier, searchQuery, scene.isReady]);

  return (
    <div className="relative h-full w-full min-h-0 select-none overflow-hidden rounded-xl bg-[#07070b] cursor-grab active:cursor-grabbing">
      <div ref={hostRef} data-galaxy-host aria-label="Interactive celestial accretion disk — use mouse/trackpad to pan and zoom" role="application" className="h-full w-full min-h-0" />
      <div className="pointer-events-none absolute right-3 top-3 z-20 flex flex-col items-end gap-1 font-mono text-[9px] text-[#71717a]"><div className="flex items-center gap-1.5 rounded border border-white/10 bg-black/60 px-2 py-0.5 backdrop-blur-md"><span>CALIPER SCALE:</span><span className="font-bold text-[#38bdf8]">{(1 / scene.currentZoom).toFixed(2)} AU / div</span></div><div className="text-[8px] text-[#52525b]">[Double-click zoom · Scroll pan]</div><div aria-live="polite" className="text-[8px] text-[#71717a]">{leader ? `SECTOR ${galaxySectorForPoint(galaxyPointForStar(leader, 0, activeSorted.length, calculateGalaxyLayout(BASE_WIDTH, BASE_HEIGHT).maxRadius)).key}` : "SECTOR 0:0"}</div></div>
      <div className="absolute bottom-14 right-2.5 z-20 sm:bottom-2.5"><CanvasControls paused={paused} onTogglePause={() => setPaused((value) => !value)} speed={speed} onChangeSpeed={(value) => { sound.playTick(); setSpeed(value); }} zoom={scene.currentZoom} onZoomIn={() => { sound.playTick(); viewportRef.current?.zoomIn(); }} onZoomOut={() => { sound.playTick(); viewportRef.current?.zoomOut(); }} onResetZoom={() => { sound.playTick(); scene.resetCamera(); }} /></div>
      <GalaxyTelemetryOverlay hovered={hovered} />
      <ol className="sr-only" aria-label="Accessible galaxy star navigation">{activeSorted.map((star, index) => <li key={star.id}><button type="button" onClick={() => onSelectStar?.(star, index + 1)}>{star.name}, rank {index + 1}</button></li>)}</ol>
    </div>
  );
}
