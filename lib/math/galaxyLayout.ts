import type { Star } from "@/lib/types";

export const GALAXY_Y_SCALE = 0.62;
export const GALAXY_HORIZONTAL_MARGIN = 0.49;
export const GALAXY_VERTICAL_MARGIN = 0.49;
export const GALAXY_MIN_ORBIT_RATIO = 0.12;
export const GALAXY_MAX_ORBIT_RATIO = 0.96;
export const GALAXY_ORBIT_BANDS = 4;

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
  const band = Math.min(
    GALAXY_ORBIT_BANDS - 1,
    Math.floor(normalized * GALAXY_ORBIT_BANDS),
  );
  const bandCenter = (band + 0.5) / GALAXY_ORBIT_BANDS;
  const bandSpread = 0.22 / GALAXY_ORBIT_BANDS;
  const bandOffset = ((normalized * 997) % 1 - 0.5) * bandSpread;
  const radialPosition = Math.min(1, Math.max(0, bandCenter + bandOffset));
  const inner = maxRadius * GALAXY_MIN_ORBIT_RATIO;
  const outer = maxRadius * GALAXY_MAX_ORBIT_RATIO;
  return outer - radialPosition * (outer - inner);
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
