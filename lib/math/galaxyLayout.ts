import type { Star } from "@/lib/types";

/** Stable world dimensions; these never resize with the viewport or population. */
export const GALAXY_WORLD_WIDTH = 12000;
export const GALAXY_WORLD_HEIGHT = 6500;
export const GALAXY_WORLD_RADIUS = GALAXY_WORLD_WIDTH / 2;
export const GALAXY_CAMERA_PADDING = 900;
export const GALAXY_Y_SCALE = GALAXY_WORLD_HEIGHT / GALAXY_WORLD_WIDTH;
export const GALAXY_HORIZONTAL_MARGIN = 0.9;
export const GALAXY_VERTICAL_MARGIN = 0.9;
export const GALAXY_MIN_ORBIT_RATIO = 0.16;
export const GALAXY_MAX_ORBIT_RATIO = 0.99;
export const GALAXY_SPIRAL_ARMS = 4;
export const GALAXY_SPIRAL_TWIST = 2.8;
export const GALAXY_ARM_WIDTH = 0.24;
export const GALAXY_BULGE_RATIO = 0.22;
export const GALAXY_SINGULARITY_EXCLUSION_RATIO = 0.14;
export const GALAXY_BASE_POPULATION = 20;
export const GALAXY_MAX_POPULATION_SCALE = 3.2;

export type GalaxyLayout = {
  width: number;
  height: number;
  cx: number;
  cy: number;
  maxRadius: number;
  yScale: number;
  worldWidth: number;
  worldHeight: number;
  cameraBounds: { minX: number; maxX: number; minY: number; maxY: number };
};

export type GalaxyPoint = {
  x: number;
  y: number;
};

export function galaxyPopulationScale(starCount: number): number {
  const safeCount = Math.max(1, starCount);
  return Math.min(
    GALAXY_MAX_POPULATION_SCALE,
    Math.max(1, Math.sqrt(safeCount / GALAXY_BASE_POPULATION)),
  );
}

export function calculateGalaxyLayout(
  width: number,
  height: number,
  yScale = GALAXY_Y_SCALE,
  starCount = GALAXY_BASE_POPULATION,
): GalaxyLayout {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const safeYScale = Math.max(Number.EPSILON, yScale);
  // The scene is a persistent world. Viewport dimensions affect only the
  // screen container; they must never resize or re-layout the galaxy.
  const worldWidth = GALAXY_WORLD_WIDTH;
  const worldHeight = GALAXY_WORLD_HEIGHT;
  const maxRadius = GALAXY_WORLD_RADIUS;
  const cx = worldWidth / 2;
  const cy = worldHeight / 2;

  return {
    width: safeWidth,
    height: safeHeight,
    cx,
    cy,
    maxRadius,
    yScale: safeYScale,
    worldWidth,
    worldHeight,
    cameraBounds: {
      minX: -GALAXY_CAMERA_PADDING,
      maxX: worldWidth + GALAXY_CAMERA_PADDING,
      minY: -GALAXY_CAMERA_PADDING,
      maxY: worldHeight + GALAXY_CAMERA_PADDING,
    },
  };
}

export function orbitPoint(
  cx: number,
  cy: number,
  orbitRadius: number,
  angle: number,
  yScale = GALAXY_Y_SCALE,
): GalaxyPoint {
  return {
    x: cx + Math.cos(angle) * orbitRadius,
    y: cy + Math.sin(angle) * orbitRadius * yScale,
  };
}

export function compareStars(a: Star, b: Star): number {
  return (
    b.totalBidCents - a.totalBidCents ||
    a.enteredAt.localeCompare(b.enteredAt) ||
    a.id.localeCompare(b.id)
  );
}

export function rankActiveStars(stars: Star[]): Star[] {
  return stars.filter((star) => star.status === "active").sort(compareStars);
}

export function normalizedBid(value: number, min: number, max: number): number {
  const valueLog = Math.log1p(Math.max(0, value));
  const minLog = Math.log1p(Math.max(0, min));
  const maxLog = Math.log1p(Math.max(0, max));
  if (maxLog <= minLog) return 0.5;
  return Math.min(1, Math.max(0, (valueLog - minLog) / (maxLog - minLog)));
}

export function orbitRadiusForStar(
  star: Pick<Star, "totalBidCents">,
  stars: Pick<Star, "totalBidCents">[],
  maxRadius: number,
): number {
  const values = stars.map((item) => Math.max(0, item.totalBidCents / 100));
  const minBid = Math.min(...values, 0);
  const maxBid = Math.max(...values, 0);
  const normalized = normalizedBid(star.totalBidCents / 100, minBid, maxBid);
  const inner = maxRadius * GALAXY_MIN_ORBIT_RATIO;
  const outer = maxRadius * GALAXY_MAX_ORBIT_RATIO;
  return outer - normalized * (outer - inner);
}

export function spiralAngleForStar(
  star: Pick<Star, "id" | "angleSeed">,
  rank: number,
  radius: number,
  maxRadius: number,
): number {
  const radial = Math.min(1, Math.max(0, radius / Math.max(1, maxRadius)));
  const arm = (Math.floor(hashToUnit(`${star.id}:arm`) * GALAXY_SPIRAL_ARMS) / GALAXY_SPIRAL_ARMS) * Math.PI * 2;
  const seed = star.angleSeed * Math.PI / 180 + hashToUnit(star.id) * Math.PI * 2;
  const armAngle = arm + radial * GALAXY_SPIRAL_TWIST;
  const jitter = (hashToUnit(`${star.id}:jitter`) - 0.5) * GALAXY_ARM_WIDTH * (1.2 - radial * 0.35);
  return armAngle + seed * 0.12 + jitter;
}

export function galaxyRadiusForStar(
  star: Pick<Star, "id">,
  _rank: number,
  _starCount: number,
  maxRadius: number,
): number {
  const seed = hashToUnit(`${star.id}:radius`);
  const minimum = GALAXY_SINGULARITY_EXCLUSION_RATIO;
  const radial = minimum + Math.pow(seed, 0.68) * (0.94 - minimum);
  return maxRadius * radial;
}

/** @deprecated Use galaxyRadiusForStar; rank is intentionally not spatial. */
export const rankOrbitRadius = galaxyRadiusForStar;


export function starSizeForRank(rank: number, starCount: number, bidCents: number): number {
  const crowd = crowdScale(starCount);
  const bidInfluence = Math.min(5, Math.max(0, Math.log1p(Math.max(0, bidCents) / 100) * 0.35));
  const tier = rank === 0 ? 42 : rank === 1 ? 32 : rank === 2 ? 28 : rank <= 3 ? 25 : rank <= 6 ? 21 : rank <= 10 ? 17 : 9;
  return (tier + bidInfluence) * crowd;
}

export function galaxyPointForStar(
  star: Pick<Star, "id" | "angleSeed">,
  rank: number,
  starCount: number,
  maxRadius: number,
  cx = 0,
  cy = 0,
): GalaxyPoint {
  const radius = galaxyRadiusForStar(star, rank, starCount, maxRadius);
  return orbitPoint(cx, cy, radius, spiralAngleForStar(star, rank, radius, maxRadius), GALAXY_Y_SCALE);
} 

export function spiralArmPoint(
  arm: number,
  radial: number,
  maxRadius: number,
  cx = 0,
  cy = 0,
): GalaxyPoint {
  const radius = maxRadius * Math.max(0, Math.min(1, radial));
  const angle = (arm / GALAXY_SPIRAL_ARMS) * Math.PI * 2 + radial * GALAXY_SPIRAL_TWIST;
  return orbitPoint(cx, cy, radius, angle);
}

function hashToUnit(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function crowdScale(starCount: number): number {
  if (starCount <= 8) return 1;
  return Math.max(0.62, 1 - (starCount - 8) * 0.018);
}

export function worldToScreen(
  worldPoint: GalaxyPoint,
  layout: Pick<GalaxyLayout, "cx" | "cy">,
  viewport: { scale: number; x: number; y: number },
): GalaxyPoint {
  return {
    x: layout.cx + (worldPoint.x - layout.cx) * viewport.scale + viewport.x,
    y: layout.cy + (worldPoint.y - layout.cy) * viewport.scale + viewport.y,
  };
}
