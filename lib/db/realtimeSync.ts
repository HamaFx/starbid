import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";
import type { GalaxyEvent } from "@/lib/types";
import { useGalaxyStore } from "@/lib/store/galaxyStore";

export function subscribeToGalaxy(client: SupabaseClient<Database>): () => void {
  const channel = client.channel("galaxy-events").on("postgres_changes", { event: "INSERT", schema: "public", table: "realtime_events", filter: "topic=eq.galaxy" }, (payload) => {
    const event = parseGalaxyEvent(payload.new.payload);
    if (event) useGalaxyStore.getState().applyEvent(event);
  }).subscribe();
  return () => { void client.removeChannel(channel); };
}

function parseGalaxyEvent(payload: Record<string, unknown>): GalaxyEvent | null {
  if (typeof payload.star_id !== "string" || typeof payload.total_bid_cents !== "number" || typeof payload.event_type !== "string" || typeof payload.name !== "string") return null;
  if (!["spawn", "fuel", "singularity_takeover"].includes(payload.event_type)) return null;
  return { starId: payload.star_id, totalBidCents: payload.total_bid_cents, eventType: payload.event_type as GalaxyEvent["eventType"], name: payload.name };
}
