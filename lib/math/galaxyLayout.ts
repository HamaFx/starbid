import type { Star } from "@/lib/types";

export const GALAXY_Y_SCALE = 0.62;
export const GALAXY_HORIZONTAL_MARGIN = 0.52;
export const GALAXY_VERTICAL_MARGIN = 0.52;
export const GALAXY_MIN_ORBIT_RATIO = 0.16;
export const GALAXY_MAX_ORBIT_RATIO = 0.99;
export const GALAXY_SPIRAL_ARMS = 4;
export const GALAXY_SPIRAL_TWIST = 1.9;

export type GalaxyLayout = {
  width: number;
  height: number;
  cx: number;
  cy: number;
  maxRadius: number;
  yScale: number;
};

export type GalaxyPoint = {
  x: number;
  y: number;
};

export function calculateGalaxyLayout(
  width: number,
  height: number,
  yScale = GALAXY_Y_SCALE,
): GalaxyLayout {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const safeYScale = Math.max(Number.EPSILON, yScale);
  const maxRadius = Math.min(
    safeWidth * GALAXY_HORIZONTAL_MARGIN,
    (safeHeight * GALAXY_VERTICAL_MARGIN) / safeYScale,
  );

  return {
    width: safeWidth,
    height: safeHeight,
    cx: safeWidth / 2,
    cy: safeHeight / 2,
    maxRadius,
    yScale: safeYScale,
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
  const seed = ((star.angleSeed * 0.017453292519943295) + hashToUnit(star.id) * Math.PI * 2);
  const radial = Math.min(1, Math.max(0, radius / Math.max(1, maxRadius)));
  const arm = ((rank % GALAXY_SPIRAL_ARMS) / GALAXY_SPIRAL_ARMS) * Math.PI * 2;
  const armAngle = arm + radial * GALAXY_SPIRAL_TWIST;
  const jitter = (hashToUnit(`${star.id}:jitter`) - 0.5) * (0.34 - radial * 0.12);
  return armAngle + seed * 0.18 + jitter;
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
