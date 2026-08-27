"use client";

import Link from "next/link";
import { useGalaxyStore } from "@/lib/store/galaxyStore";
import type { Star } from "@/lib/types";

export function FloatingTicker({ initialStars = [] }: { initialStars?: Star[] }) {
  const storeStars = useGalaxyStore((state) => state.stars);
  const recentEvents = useGalaxyStore((state) => state.recentEvents);
  const stars = storeStars.length ? storeStars : initialStars;
  const activeStars = [...stars]
    .filter((s) => s.status === "active")
    .sort((a, b) => b.totalBidCents - a.totalBidCents);
  const leader = activeStars[0];

  return (
    <div
      aria-label="Terminal telemetry ticker"
      className="pointer-events-auto flex max-w-lg items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0c0c12]/95 px-3 py-1.5 font-mono text-[11px] backdrop-blur-md shadow-xl"
    >
      <span className="text-[#38bdf8] font-bold">&gt;</span>

      <div className="flex-1 truncate text-[#71717a]">
        {recentEvents.length > 0 ? (
          <span className="truncate flex items-center gap-1.5">
            <span
              className={`rounded px-1 text-[9px] font-bold ${
                recentEvents[0].eventType === "singularity_takeover"
                  ? "bg-[#fbbf24]/20 text-[#fbbf24]"
                  : recentEvents[0].eventType === "spawn"
                  ? "bg-[#38bdf8]/20 text-[#38bdf8]"
                  : "bg-[#27c93f]/20 text-[#27c93f]"
              }`}
            >
              {recentEvents[0].eventType === "singularity_takeover"
                ? "TAKEOVER"
                : recentEvents[0].eventType === "spawn"
                ? "SPAWN"
                : "FUEL"}
            </span>
            <span className="text-[#f3f4f6] font-medium">{recentEvents[0].name}</span>
            <span className="text-[#fbbf24] font-semibold">
              +${(recentEvents[0].totalBidCents / 100).toFixed(2)}
            </span>
          </span>
        ) : leader ? (
          <span className="truncate flex items-center gap-1.5">
            <span className="rounded bg-[#38bdf8]/15 px-1 text-[9px] font-bold text-[#38bdf8]">
              #1 CORE
            </span>
            <Link
              href={`/star/${encodeURIComponent(leader.id)}`}
              className="text-[#f3f4f6] font-semibold hover:text-[#38bdf8] truncate"
            >
              {leader.name}
            </Link>
            <span className="text-[#fbbf24] font-semibold">
              ${(leader.totalBidCents / 100).toFixed(2)}
            </span>
            <span className="text-[10px] text-[#52525b]">({activeStars.length} in orbit)</span>
          </span>
        ) : (
          <span className="text-[#52525b]">observatory stream listening on /dev/orbit.log</span>
        )}
      </div>

      <Link
        href="/create"
        className="shrink-0 text-[10px] font-bold text-[#38bdf8] hover:underline"
      >
        [+ outbid]
      </Link>
    </div>
  );
}
