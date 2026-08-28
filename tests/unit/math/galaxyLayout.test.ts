import { describe, expect, it } from "vitest";
import {
  calculateGalaxyLayout,
  compareStars,
  orbitPoint,
  rankActiveStars,
} from "@/lib/math/galaxyLayout";
import type { Star } from "@/lib/types";

function star(id: string, bid: number, enteredAt: string, status: Star["status"] = "active"): Star {
  return {
    id,
    projectId: id,
    name: id,
    logoUrl: null,
    linkUrl: "#",
    xHandle: null,
    totalBidCents: bid,
    angleSeed: 0,
    enteredAt,
    verified: false,
    isFounding: false,
    isDemo: false,
    status,
  };
}

describe("galaxy layout", () => {
  it("fits the projected ellipse inside narrow and tall viewports", () => {
    const layout = calculateGalaxyLayout(400, 700);
    expect(layout.maxRadius).toBeLessThanOrEqual(400 * 0.46);
    expect(layout.maxRadius * layout.yScale).toBeLessThanOrEqual(700 * 0.46);
  });

  it("projects the center and cardinal points consistently", () => {
    const layout = calculateGalaxyLayout(1200, 760);
    expect(orbitPoint(layout.cx, layout.cy, 100, 0)).toEqual({ x: 700, y: 380 });
    expect(orbitPoint(layout.cx, layout.cy, 100, Math.PI / 2).y).toBeCloseTo(
      layout.cy + 62,
    );
  });

  it("uses a deterministic tie-breaker for all ranked views", () => {
    const stars = [
      star("b", 100, "2026-01-02T00:00:00.000Z"),
      star("a", 100, "2026-01-01T00:00:00.000Z"),
      star("inactive", 1000, "2026-01-01T00:00:00.000Z", "withdrawn"),
    ];
    expect(rankActiveStars(stars).map((item) => item.id)).toEqual(["a", "b"]);
    expect(compareStars(stars[1], stars[0])).toBeLessThan(0);
  });
});
