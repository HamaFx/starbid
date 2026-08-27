import { create } from "zustand";
import type { GalaxyEvent, Star } from "@/lib/types";

export type GalaxyState = {
  stars: Star[];
  recentEvents: GalaxyEvent[];
  setStars: (stars: Star[]) => void;
  applyEvent: (event: GalaxyEvent) => void;
};

export function deterministicAngle(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

function applyGalaxyEvent(stars: Star[], event: GalaxyEvent): Star[] {
  const existing = stars.find((star) => star.id === event.starId);
  if (existing) {
    return stars.map((star) =>
      star.id === event.starId
        ? { ...star, totalBidCents: event.totalBidCents }
        : star,
    );
  }
  if (event.eventType !== "spawn") return stars;
  return [
    ...stars,
    {
      id: event.starId,
      projectId: event.starId,
      name: event.name,
      logoUrl: null,
      linkUrl: "#",
      xHandle: null,
      totalBidCents: event.totalBidCents,
      angleSeed: deterministicAngle(event.starId),
      enteredAt: event.timestamp ?? new Date().toISOString(),
      verified: false,
      isFounding: false,
      isDemo: false,
      status: "active",
    },
  ];
}

export const useGalaxyStore = create<GalaxyState>((set) => ({
  stars: [],
  recentEvents: [],
  setStars: (stars) => set({ stars }),
  applyEvent: (event) =>
    set((state) => ({
      stars: applyGalaxyEvent(state.stars, event),
      recentEvents: [event, ...state.recentEvents].slice(0, 15),
    })),
}));

// Memoized selector: returns same reference if stars haven't changed
let _cachedStars: Star[] = [];
let _cachedActive: Star[] = [];
export const selectActiveStars = (state: GalaxyState): Star[] => {
  if (state.stars === _cachedStars) return _cachedActive;
  _cachedStars = state.stars;
  _cachedActive = state.stars.filter((star) => star.status === "active");
  return _cachedActive;
};
