import { create } from "zustand";
import type { GalaxyEvent, Star } from "@/lib/types";

type GalaxyState = { stars: Star[]; setStars: (stars: Star[]) => void; applyEvent: (event: GalaxyEvent) => void };

function applyGalaxyEvent(stars: Star[], event: GalaxyEvent): Star[] {
  const existing = stars.find((star) => star.id === event.starId);
  if (existing) return stars.map((star) => star.id === event.starId ? { ...star, totalBidCents: event.totalBidCents } : star);
  if (event.eventType !== "spawn") return stars;
  return [...stars, { id: event.starId, projectId: event.starId, name: event.name, logoUrl: null, linkUrl: "#", xHandle: null, totalBidCents: event.totalBidCents, angleSeed: Math.random() * 360, enteredAt: new Date().toISOString(), verified: false, isFounding: false, isDemo: false, status: "active" }];
}

export const useGalaxyStore = create<GalaxyState>((set) => ({
  stars: [],
  setStars: (stars) => set({ stars }),
  applyEvent: (event) => set((state) => ({ stars: applyGalaxyEvent(state.stars, event) })),
}));

export const selectActiveStars = (state: GalaxyState): Star[] => state.stars.filter((star) => star.status === "active");
