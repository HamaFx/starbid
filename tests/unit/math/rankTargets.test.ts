import { describe, expect, it } from "vitest";
import { amountToReachTotal, amountToTakeSingularity, minimumSingularityTotalCents, rankForTotal } from "@/lib/math/rankTargets";

describe("rank targets", () => {
  it("rounds the singularity threshold upward in cents", () => {
    expect(minimumSingularityTotalCents(1000)).toBe(1150);
    expect(minimumSingularityTotalCents(1001)).toBe(1152);
  });

  it("always enforces the three-dollar minimum", () => {
    expect(amountToReachTotal(1000, 1100)).toBe(300);
  });

  it("calculates the exact add amount for a singularity attempt", () => {
    expect(amountToTakeSingularity(1000, 10000)).toBe(10500);
  });

  it("places a candidate after larger totals", () => {
    const stars = [
      { totalBidCents: 1000, status: "active", enteredAt: "2026-01-01T00:00:00.000Z" },
      { totalBidCents: 500, status: "active", enteredAt: "2026-01-02T00:00:00.000Z" },
    ] as never[];
    expect(rankForTotal(stars, 600)).toBe(2);
  });
});
