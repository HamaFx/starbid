import { describe, expect, it } from "vitest";
import { angularVelocity, radius, size } from "@/lib/math/orbit";

describe("orbit math", () => {
  it("places larger bids closer to the center", () => {
    expect(radius(100, 400)).toBeLessThan(radius(1, 400));
  });

  it("clamps star sizes to the visual bounds", () => {
    expect(size(0)).toBe(12);
    expect(size(1_000_000)).toBe(80);
  });

  it("calculates angular velocity from radius", () => {
    expect(angularVelocity(100)).toBe(4);
  });
});
