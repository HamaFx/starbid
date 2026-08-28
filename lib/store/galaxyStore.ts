import { create } from "zustand";
import type { GalaxyEvent, Star } from "@/lib/types";

export type GalaxyState = {
  stars: Star[];
  recentEvents: GalaxyEvent[];
  setStars: (stars: Star[]) => void;
  mergeStars: (stars: Star[]) => void;
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

function eventSequence(event: GalaxyEvent): number | null {
  return typeof event.sequence === "number" && Number.isFinite(event.sequence)
    ? event.sequence
    : null;
}

function eventTime(event: GalaxyEvent): number {
  const time = event.timestamp ? Date.parse(event.timestamp) : Number.NaN;
  if (Number.isFinite(time)) return time;
  return event.receivedAt ?? 0;
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

function mergeAuthoritativeStars(
  currentStars: Star[],
  refreshedStars: Star[],
  recentEvents: GalaxyEvent[],
): Star[] {
  const refreshedById = new Map(refreshedStars.map((star) => [star.id, star]));
  const latestEventById = new Map<string, GalaxyEvent>();

  recentEvents.forEach((event) => {
    const previous = latestEventById.get(event.starId);
    const sequence = eventSequence(event);
    const previousSequence = previous ? eventSequence(previous) : null;
    if (
      !previous ||
      (sequence !== null && (previousSequence === null || sequence >= previousSequence)) ||
      (sequence === null && previousSequence === null && eventTime(event) >= eventTime(previous))
    ) {
      latestEventById.set(event.starId, event);
    }
  });

  currentStars.forEach((current) => {
    if (!refreshedById.has(current.id) && !latestEventById.has(current.id)) {
      refreshedById.set(current.id, current);
    }
  });

  latestEventById.forEach((event, id) => {
    const refreshed = refreshedById.get(id);
    if (
      refreshed &&
      (eventSequence(event) !== null || eventTime(event) >= Date.parse(refreshed.enteredAt))
    ) {
      refreshedById.set(id, { ...refreshed, totalBidCents: event.totalBidCents });
    } else if (!refreshed && event.eventType === "spawn") {
      const spawnedStar = applyGalaxyEvent([], event)[0];
      if (spawnedStar) refreshedById.set(id, spawnedStar);
    }
  });

  return Array.from(refreshedById.values());
}

export const useGalaxyStore = create<GalaxyState>((set) => ({
  stars: [],
  recentEvents: [],
  setStars: (stars) => set({ stars }),
  mergeStars: (stars) =>
    set((state) => ({
      stars: mergeAuthoritativeStars(state.stars, stars, state.recentEvents),
    })),
  applyEvent: (event) =>
    set((state) => ({
      stars: applyGalaxyEvent(state.stars, event),
      recentEvents: [
        { ...event, receivedAt: event.receivedAt ?? Date.now() },
        ...state.recentEvents,
      ].slice(0, 15),
    })),
}));

let _cachedStars: Star[] = [];
let _cachedActive: Star[] = [];
export const selectActiveStars = (state: GalaxyState): Star[] => {
  if (state.stars === _cachedStars) return _cachedActive;
  _cachedStars = state.stars;
  _cachedActive = state.stars.filter((star) => star.status === "active");
  return _cachedActive;
};
