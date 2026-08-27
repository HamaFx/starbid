import { describe, it, expect, beforeEach } from "vitest";
import { useGalaxyStore, deterministicAngle, selectActiveStars } from "@/lib/store/galaxyStore";
import type { Star } from "@/lib/types";

describe("galaxyStore", () => {
  beforeEach(() => {
    useGalaxyStore.setState({ stars: [], recentEvents: [] });
  });

  it("computes stable deterministic angles from star IDs", () => {
    const angle1 = deterministicAngle("test-star-1");
    const angle2 = deterministicAngle("test-star-1");
    const angle3 = deterministicAngle("test-star-2");

    expect(angle1).toBe(angle2);
    expect(angle1).toBeGreaterThanOrEqual(0);
    expect(angle1).toBeLessThan(360);
    expect(typeof angle3).toBe("number");
  });

  it("handles spawn and fuel events properly", () => {
    const initialStar: Star = {
      id: "star-1",
      projectId: "proj-1",
      name: "Alpha Project",
      logoUrl: null,
      linkUrl: "https://alpha.example",
      xHandle: null,
      totalBidCents: 500,
      angleSeed: 45,
      enteredAt: "2026-01-01T00:00:00.000Z",
      verified: false,
      isFounding: false,
      isDemo: false,
      status: "active",
    };

    useGalaxyStore.getState().setStars([initialStar]);
    expect(selectActiveStars(useGalaxyStore.getState())).toHaveLength(1);

    // Apply fuel event
    useGalaxyStore.getState().applyEvent({
      starId: "star-1",
      name: "Alpha Project",
      totalBidCents: 1500,
      eventType: "fuel",
    });

    const updatedStars = useGalaxyStore.getState().stars;
    expect(updatedStars[0].totalBidCents).toBe(1500);
    expect(useGalaxyStore.getState().recentEvents).toHaveLength(1);

    // Apply spawn event
    useGalaxyStore.getState().applyEvent({
      starId: "star-2",
      name: "Beta Project",
      totalBidCents: 800,
      eventType: "spawn",
    });

    const afterSpawn = useGalaxyStore.getState().stars;
    expect(afterSpawn).toHaveLength(2);
    expect(afterSpawn[1].name).toBe("Beta Project");
    expect(afterSpawn[1].angleSeed).toBe(deterministicAngle("star-2"));
  });
});
