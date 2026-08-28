function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function radius(totalBidDollars: number, rMax: number): number {
  if (totalBidDollars < 0 || rMax < 0) {
    throw new Error("Orbit inputs must be non-negative");
  }

  // Balanced radial distribution spanning 14% to 96% of the screen-filling galaxy
  const minRadius = rMax * 0.14;
  const maxSpan = rMax * 0.82;
  const decay = 1 / (1 + 0.35 * Math.log1p(totalBidDollars));
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
