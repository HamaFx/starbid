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
      aria-label="Terminal log stream"
      className="pointer-events-auto flex max-w-md items-center gap-2 rounded border border-white/[0.08] bg-[#0c0c12]/90 px-3 py-1.5 font-mono text-[11px] backdrop-blur-md"
    >
      <span className="text-[#38bdf8]">&gt;</span>

      <div className="flex-1 truncate text-[#71717a]">
        {recentEvents.length > 0 ? (
          <span className="truncate">
            <span className={recentEvents[0].eventType === "singularity_takeover" ? "text-[#fbbf24] font-semibold" : "text-[#27c93f]"}>
              [{recentEvents[0].eventType === "singularity_takeover" ? "TAKEOVER" : "FUEL"}]
            </span>{" "}
            <span className="text-[#f3f4f6]">{recentEvents[0].name}</span>{" "}
            <span className="text-[#fbbf24]">${(recentEvents[0].totalBidCents / 100).toFixed(2)}</span>
          </span>
        ) : activeStars.length > 0 ? (
          <span className="truncate">
            <span className="text-[#27c93f]">[ACTIVE]</span>{" "}
            <span className="text-[#f3f4f6]">#01 {activeStars[0].name}</span>{" "}
            <span className="text-[#fbbf24]">${(activeStars[0].totalBidCents / 100).toFixed(2)}</span>
          </span>
        ) : (
          <span>tail -f /dev/orbit.log</span>
        )}
      </div>
    </div>
  );
}
