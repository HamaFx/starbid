import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";
import type { GalaxyEvent } from "@/lib/types";
import { useGalaxyStore } from "@/lib/store/galaxyStore";

export function subscribeToGalaxy(client: SupabaseClient<Database>): () => void {
  const channel = client.channel("galaxy-events").on("postgres_changes", { event: "INSERT", schema: "public", table: "realtime_events", filter: "topic=eq.galaxy" }, (payload) => {
    const event = parseGalaxyEvent(payload.new.payload);
    if (event) useGalaxyStore.getState().applyEvent(event);
  }).subscribe((status) => {
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      void refreshGalaxy(client);
    }
  });
  return () => { void client.removeChannel(channel); };
}

async function refreshGalaxy(client: SupabaseClient<Database>): Promise<void> {
  const { data, error } = await client.rpc("list_public_stars");
  if (!error && data) useGalaxyStore.getState().setStars(data.map((row) => ({
    id: row.star_id,
    projectId: row.project_id,
    name: row.name,
    logoUrl: row.logo_url,
    linkUrl: row.link_url,
    xHandle: row.x_handle,
    totalBidCents: row.total_bid_cents,
    angleSeed: row.angle_seed,
    enteredAt: row.entered_at,
    verified: row.verified,
    isFounding: row.is_founding,
    isDemo: row.is_demo,
    status: "active",
  })));
}

function parseGalaxyEvent(payload: Record<string, unknown>): GalaxyEvent | null {
  if (typeof payload.star_id !== "string" || typeof payload.total_bid_cents !== "number" || typeof payload.event_type !== "string" || typeof payload.name !== "string") return null;
  if (!["spawn", "fuel", "singularity_takeover"].includes(payload.event_type)) return null;
  return { starId: payload.star_id, totalBidCents: payload.total_bid_cents, eventType: payload.event_type as GalaxyEvent["eventType"], name: payload.name };
}
