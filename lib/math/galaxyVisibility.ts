import type { GalaxyPoint } from "@/lib/math/galaxyLayout";
import { galaxyPointForStar } from "@/lib/math/galaxyLayout";
import { galaxySectorForPoint, nearbySectorKeys, type GalaxySector } from "@/lib/math/galaxySectors";
import type { Star } from "@/lib/types";

export function visibleStarIds(
  stars: Star[],
  center: GalaxyPoint,
  zoom: number,
  maxRadius: number,
): Set<string> {
  const centerSector = galaxySectorForPoint(center);
  const range = zoom >= 1.2 ? 1 : zoom >= 0.55 ? 2 : 3;
  const sectors = new Set(nearbySectorKeys(centerSector, range));
  return new Set(
    stars
      .filter((star, rank) => {
        const point = galaxyPointForStar(star, rank, stars.length, maxRadius);
        return sectors.has(galaxySectorForPoint(point).key);
      })
      .map((star) => star.id),
  );
}

export function sectorForStarPoint(point: GalaxyPoint): GalaxySector {
  return galaxySectorForPoint(point);
}
