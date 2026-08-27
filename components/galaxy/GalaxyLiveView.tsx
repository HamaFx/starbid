"use client";

import { useEffect } from "react";
import { ResponsiveGalaxy } from "@/components/galaxy/ResponsiveGalaxy";
import { createSupabaseBrowserClient } from "@/lib/db/browserClient";
import { listPublicStars } from "@/lib/db/stars";
import { subscribeToGalaxy } from "@/lib/db/realtimeSync";
import { useGalaxyStore } from "@/lib/store/galaxyStore";
import type { Star } from "@/lib/types";

export function GalaxyLiveView({ initialStars }: { initialStars: Star[] }) {
  const stars = useGalaxyStore((state) => state.stars);
  const setStars = useGalaxyStore((state) => state.setStars);
  useEffect(() => {
    let cancelled = false;
    setStars(initialStars);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const client = createSupabaseBrowserClient();
    void listPublicStars(client).then((liveStars) => { if (!cancelled && liveStars.length) setStars(liveStars); });
    const unsubscribe = subscribeToGalaxy(client);
    return () => { cancelled = true; unsubscribe(); };
  }, [initialStars, setStars]);
  return <ResponsiveGalaxy stars={stars.length ? stars : initialStars} />;
}
