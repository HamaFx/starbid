import { useCallback, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { sound } from "@/components/galaxy/AudioFeedback";
import { BASE_HEIGHT, BASE_WIDTH } from "@/components/galaxy/useGalaxyScene";
import { calculateGalaxyLayout, worldToScreen } from "@/lib/math/galaxyLayout";
import type { Star } from "@/lib/types";
import type { StarSprite } from "@/components/galaxy/StarSprite";
import type { GalaxyViewport } from "@/components/galaxy/GalaxyViewport";

type HoveredStar = { star: Star; x: number; y: number; rank: number; au: string; speed: string; angle: number; deltaDollars: string };

export function useGalaxyInteraction(
  stars: Star[],
  hostRef: RefObject<HTMLDivElement | null>,
  spritesRef: RefObject<Map<string, StarSprite>>,
  viewportRef: RefObject<GalaxyViewport | null>,
  focusCameraOn: (starId: string, zoom?: number) => void,
  triggerShockwave: (x: number, y: number, type: "spawn" | "fuel" | "singularity_takeover" | "click") => void,
  onSelectStar: ((star: Star, rank: number) => void) | undefined,
) {
  const router = useRouter();
  const handleStarClick = useCallback((star: Star) => {
    const sprite = spritesRef.current.get(star.id);
    const position = sprite?.container.position;
    const width = hostRef.current?.clientWidth || BASE_WIDTH;
    const height = hostRef.current?.clientHeight || BASE_HEIGHT;
    const layout = calculateGalaxyLayout(width, height, undefined, stars.length);
    const screenPosition = position && viewportRef.current ? worldToScreen(position, layout, viewportRef.current) : position;
    const rank = Math.max(1, stars.findIndex((item) => item.id === star.id) + 1);
    sound.playSelect(screenPosition ? (screenPosition.x / layout.width) * 2 - 1 : 0, rank);
    if (position) triggerShockwave(position.x, position.y, "click");
    focusCameraOn(star.id, 1.55);
    if (onSelectStar) onSelectStar(star, rank);
    else router.push(`/star/${encodeURIComponent(star.id)}`);
  }, [focusCameraOn, hostRef, onSelectStar, router, spritesRef, stars, triggerShockwave, viewportRef]);

  const handleStarHover = useCallback((star: Star | null, x: number, y: number): HoveredStar | null => {
    if (!star) return null;
    const width = hostRef.current?.clientWidth || BASE_WIDTH;
    const height = hostRef.current?.clientHeight || BASE_HEIGHT;
    const layout = calculateGalaxyLayout(width, height, undefined, stars.length);
    const sprite = spritesRef.current.get(star.id);
    const worldPosition = sprite?.getWorldPosition();
    const screenPosition = worldPosition && viewportRef.current ? worldToScreen(worldPosition, layout, viewportRef.current) : { x, y };
    const rank = Math.max(1, stars.findIndex((item) => item.id === star.id) + 1);
    const orbitRadius = sprite?.currentRadius ?? layout.maxRadius * 0.16;
    const previous = rank > 1 ? stars[rank - 2] : null;
    sound.playTick((screenPosition.x / layout.width) * 2 - 1);
    return {
      star,
      x: screenPosition.x,
      y: screenPosition.y,
      rank,
      au: ((orbitRadius / layout.maxRadius) * 5).toFixed(2),
      speed: (350 / Math.sqrt(Math.max(10, orbitRadius))).toFixed(1),
      angle: Math.round(sprite?.getBearingDegrees() ?? star.angleSeed % 360),
      deltaDollars: ((previous ? previous.totalBidCents - star.totalBidCents + 100 : 0) / 100).toFixed(2),
    };
  }, [hostRef, spritesRef, stars, viewportRef]);

  return { handleStarClick, handleStarHover };
}

export type { HoveredStar };
