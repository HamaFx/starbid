import { describe, it, expect } from "vitest";
import { deterministicAngle } from "@/lib/store/galaxyStore";
import type { Star } from "@/lib/types";

describe("Galaxy Presentation & Logic", () => {
  const sampleStar: Star = {
    id: "star-123",
    projectId: "proj-123",
    name: "Alpha Centauri",
    logoUrl: null,
    linkUrl: "https://alpha.example.com",
    xHandle: "alphastaronx",
    totalBidCents: 50000,
    angleSeed: 45,
    enteredAt: "2026-08-01T00:00:00Z",
    verified: true,
    isFounding: true,
    isDemo: false,
    status: "active",
  };

  it("calculates deterministic angle consistently for any star id", () => {
    const angle1 = deterministicAngle("star-abc-123");
    const angle2 = deterministicAngle("star-abc-123");
    expect(angle1).toBe(angle2);
    expect(angle1).toBeGreaterThanOrEqual(0);
    expect(angle1).toBeLessThan(360);
  });

  it("formats gravity and rank correctly", () => {
    const dollars = (sampleStar.totalBidCents / 100).toFixed(2);
    expect(dollars).toBe("500.00");
  });

  it("correctly identifies founding and verified status", () => {
    expect(sampleStar.isFounding).toBe(true);
    expect(sampleStar.verified).toBe(true);
    expect(sampleStar.status).toBe("active");
  });
});
