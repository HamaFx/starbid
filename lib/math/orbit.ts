function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const GALAXY_MAX_RADIUS = 1800;

export function radius(totalBidDollars: number, rMax = GALAXY_MAX_RADIUS): number {
  if (totalBidDollars < 0 || rMax < 0) {
    throw new Error("Orbit inputs must be non-negative");
  }

  // Deep-space logarithmic radial distribution with massive capacity for hundreds of stars
  const minRadius = rMax * 0.08;
  const maxSpan = rMax * 0.88;
  const decay = 1 / (1 + 0.32 * Math.log1p(totalBidDollars));
  return minRadius + maxSpan * decay;
}

export function size(totalBidDollars: number): number {
  if (totalBidDollars < 0) {
    throw new Error("Bid amount must be non-negative");
  }

  return clamp(12 + 10 * Math.log1p(totalBidDollars), 12, 80);
}

export function angularVelocity(radiusPx: number, baseSpeed = 40): number {
  if (radiusPx <= 0 || baseSpeed < 0) {
    throw new Error("Radius must be positive and speed must be non-negative");
  }

  return baseSpeed / Math.sqrt(radiusPx);
}
