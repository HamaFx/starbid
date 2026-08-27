import type { Star } from "@/lib/types";

const SINGULARITY_MULTIPLIER_NUMERATOR = 115n;
const SINGULARITY_MULTIPLIER_DENOMINATOR = 100n;
const MIN_BID_CENTS = 300n;

export function minimumSingularityTotalCents(currentTotalCents: number): number {
  const total = BigInt(Math.max(0, Math.trunc(currentTotalCents)));
  return Number(
    (total * SINGULARITY_MULTIPLIER_NUMERATOR +
      SINGULARITY_MULTIPLIER_DENOMINATOR -
      1n) /
      SINGULARITY_MULTIPLIER_DENOMINATOR,
  );
}

export function amountToReachTotal(
  currentTotalCents: number,
  targetTotalCents: number,
): number {
  return Math.max(
    Number(MIN_BID_CENTS),
    Math.max(0, Math.trunc(targetTotalCents) - Math.trunc(currentTotalCents)),
  );
}

export function amountToTakeSingularity(
  currentStarTotalCents: number,
  currentSingularityTotalCents: number,
): number {
  return amountToReachTotal(
    currentStarTotalCents,
    minimumSingularityTotalCents(currentSingularityTotalCents),
  );
}

export function rankForTotal(stars: Pick<Star, "status" | "totalBidCents">[], totalCents: number): number {
  const candidate = Math.max(0, Math.trunc(totalCents));
  return stars.filter(
    (star) => star.status === "active" && star.totalBidCents > candidate,
  ).length + 1;
}
