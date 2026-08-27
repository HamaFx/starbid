"use client";

import { useGalaxyStore } from "@/lib/store/galaxyStore";
import type { Star } from "@/lib/types";

export function FloatingTicker({ initialStars = [] }: { initialStars?: Star[] }) {
  const storeStars = useGalaxyStore((state) => state.stars);
  const recentEvents = useGalaxyStore((state) => state.recentEvents);
  const stars = storeStars.length ? storeStars : initialStars;
  const activeStars = [...stars].filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);

  return (
    <div
      aria-label="Live orbit activity feed"
      className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-xl border border-white/10 bg-[#05050a]/80 px-3.5 py-2 text-xs shadow-lg backdrop-blur-md"
    >
      <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase text-[#4ade80]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ade80]" />
        Live
      </span>

      <div className="flex-1 truncate font-mono text-[11px] text-[#fff4e0]">
        {recentEvents.length > 0 ? (
          <span className="truncate">
            <strong className={recentEvents[0].eventType === "singularity_takeover" ? "text-[#ffb627]" : "text-[#4cc9f0]"}>
              {recentEvents[0].eventType === "singularity_takeover" ? "⚡ TAKEOVER: " : "▲ FUEL: "}
            </strong>
            {recentEvents[0].name} (${(recentEvents[0].totalBidCents / 100).toFixed(2)})
          </span>
        ) : activeStars.length > 0 ? (
          <span className="truncate">
            <strong className="text-[#ffb627]">👑 #1 {activeStars[0].name}</strong> (${(activeStars[0].totalBidCents / 100).toFixed(2)})
          </span>
        ) : (
          <span>Awaiting orbital signals…</span>
        )}
      </div>
    </div>
  );
}
