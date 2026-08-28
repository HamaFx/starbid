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

  it("preserves a realtime spawn when an authoritative refresh follows", () => {
    useGalaxyStore.getState().applyEvent({
      starId: "live-star",
      name: "Live Star",
      totalBidCents: 900,
      eventType: "spawn",
      timestamp: "2026-08-28T12:00:00.000Z",
    });

    useGalaxyStore.getState().mergeStars([]);

    expect(useGalaxyStore.getState().stars.map((star) => star.id)).toContain("live-star");
    expect(useGalaxyStore.getState().stars.find((star) => star.id === "live-star")?.totalBidCents).toBe(900);
  });

  it("does not let an older refresh overwrite a newer realtime bid", () => {
    useGalaxyStore.getState().setStars([{
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
    }]);
    useGalaxyStore.getState().applyEvent({
      starId: "star-1",
      name: "Alpha Project",
      totalBidCents: 1500,
      eventType: "fuel",
      timestamp: "2026-08-28T12:00:00.000Z",
    });

    useGalaxyStore.getState().mergeStars([{
      ...useGalaxyStore.getState().stars[0],
      totalBidCents: 500,
      enteredAt: "2026-08-28T11:00:00.000Z",
    }]);

    expect(useGalaxyStore.getState().stars[0].totalBidCents).toBe(1500);
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
