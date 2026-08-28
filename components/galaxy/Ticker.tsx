"use client";

import Link from "next/link";
import { useGalaxyStore } from "@/lib/store/galaxyStore";
import type { Star } from "@/lib/types";
import { rankActiveStars } from "@/lib/math/galaxyLayout";

export function Ticker({ initialStars = [] }: { initialStars?: Star[] }) {
  const storeStars = useGalaxyStore((state) => state.stars);
  const recentEvents = useGalaxyStore((state) => state.recentEvents);
  const stars = storeStars.length ? storeStars : initialStars;
  const activeStars = rankActiveStars(stars).slice(0, 5);

  return (
    <div
      aria-label="Recent activity ticker"
      className="flex items-center gap-3 overflow-hidden rounded-full border border-white/10 bg-[#0a0a14] px-4 py-2 text-xs"
    >
      <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#4cc9f0]">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#4cc9f0]" />
        Live
      </span>

      <div className="flex flex-1 items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-none font-mono">
        {recentEvents.length > 0 ? (
          recentEvents.slice(0, 3).map((event, idx) => (
            <span key={`${event.starId}-${idx}`} className="inline-flex items-center gap-2 text-[#fff4e0]">
              <span className={event.eventType === "singularity_takeover" ? "text-[#ffb627] font-semibold" : "text-[#4ade80]"}>
                {event.eventType === "singularity_takeover" ? "⚡ TAKEOVER" : event.eventType === "spawn" ? "✦ NEW STAR" : "▲ FUEL"}
              </span>
              <span>{event.name}</span>
              <span className="text-[#8f8c96]">→ ${(event.totalBidCents / 100).toFixed(2)} total</span>
            </span>
          ))
        ) : (
          activeStars.map((star, idx) => (
            <Link
              key={star.id}
              href={`/star/${encodeURIComponent(star.id)}`}
              className="inline-flex items-center gap-2 text-[#8f8c96] hover:text-[#fff4e0]"
            >
              <span className="text-[#4cc9f0]">#{idx + 1}</span>
              <span className="text-[#fff4e0]">{star.name}</span>
              <span className="text-[#ffb627]">${(star.totalBidCents / 100).toFixed(2)}</span>
            </Link>
          ))
        )}
      </div>

      <Link
        href="/leaderboard"
        className="shrink-0 font-mono text-[11px] text-[#4cc9f0] hover:underline"
      >
        View all →
      </Link>
    </div>
  );
}
