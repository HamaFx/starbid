import { useEffect, type RefObject } from "react";
import { StarSprite } from "@/components/galaxy/StarSprite";
import { StarSpritePool } from "@/components/galaxy/StarSpritePool";
import { BASE_HEIGHT, BASE_WIDTH } from "@/components/galaxy/useGalaxyScene";
import { calculateGalaxyLayout } from "@/lib/math/galaxyLayout";
import type { Star } from "@/lib/types";
import type { Container } from "pixi.js";
import type { OrbitTrails } from "@/components/galaxy/OrbitTrails";

export function useGalaxySpriteSync(
  stars: Star[],
  isReady: boolean,
  starContainerRef: RefObject<Container | null>,
  hostRef: RefObject<HTMLDivElement | null>,
  spritesRef: RefObject<Map<string, StarSprite>>,
  poolRef: RefObject<StarSpritePool>,
  trailsRef: RefObject<OrbitTrails | null>,
  callbacks: { onClick: (star: Star) => void; onHover: (star: Star | null, x: number, y: number) => void },
) {
  useEffect(() => {
    const container = starContainerRef.current;
    if (!isReady || !container) return;
    const width = hostRef.current?.clientWidth || BASE_WIDTH;
    const height = hostRef.current?.clientHeight || BASE_HEIGHT;
    const maxRadius = calculateGalaxyLayout(width, height, undefined, stars.length).maxRadius;
    const activeIds = new Set(stars.map((star) => star.id));
    const sprites = spritesRef.current;

    stars.forEach((star, index) => {
      const existing = sprites.get(star.id);
      if (existing) {
        existing.updateData(star, index, maxRadius, stars);
        if (existing.container.parent !== container) container.addChild(existing.container);
        return;
      }
      const sprite = poolRef.current.acquire(star, index, maxRadius, callbacks, stars);
      sprites.set(star.id, sprite);
      container.addChild(sprite.container);
    });

    sprites.forEach((sprite, id) => {
      if (activeIds.has(id)) return;
      if (sprite.container.parent === container) container.removeChild(sprite.container);
      poolRef.current.release(sprite);
      trailsRef.current?.removeStar(id);
      sprites.delete(id);
    });
  }, [callbacks, hostRef, isReady, poolRef, spritesRef, starContainerRef, stars, trailsRef]);
}
