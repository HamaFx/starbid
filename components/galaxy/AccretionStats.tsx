"use client";

import { useGalaxyStore } from "@/lib/store/galaxyStore";
import { minimumSingularityTotalCents } from "@/lib/math/rankTargets";
import type { Star } from "@/lib/types";

export function AccretionStats({ initialStars = [] }: { initialStars?: Star[] }) {
  const storeStars = useGalaxyStore((state) => state.stars);
  const stars = storeStars.length ? storeStars : initialStars;
  const active = stars
    .filter((s) => s.status === "active")
    .sort((a, b) => b.totalBidCents - a.totalBidCents);

  const totalGravityCents = active.reduce((sum, s) => sum + s.totalBidCents, 0);
  const leader = active[0];
  const hurdleCents = leader ? minimumSingularityTotalCents(leader.totalBidCents) : 300;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3.5">
      <div className="rounded-xl border border-white/10 bg-[#0a0a14] p-3 transition hover:border-white/20">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#8f8c96]">
          Total Gravity
        </span>
        <p className="mt-1 font-mono text-base font-bold text-[#ffb627] sm:text-lg">
          ${(totalGravityCents / 100).toFixed(2)}
        </p>
      </div>

      <div className="rounded-xl border border-[#ffb627]/30 bg-[#0a0a14] p-3 transition hover:border-[#ffb627]/50">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#ffb627]">
          👑 Singularity #1
        </span>
        <p className="mt-1 truncate font-sans text-sm font-semibold text-[#fff4e0] sm:text-base">
          {leader ? leader.name : "None"}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0a0a14] p-3 transition hover:border-white/20">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#8f8c96]">
          ⚡ Dethrone Target
        </span>
        <p className="mt-1 font-mono text-base font-bold text-[#4cc9f0] sm:text-lg">
          ${(hurdleCents / 100).toFixed(2)}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0a0a14] p-3 transition hover:border-white/20">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#8f8c96]">
          Active Orbits
        </span>
        <p className="mt-1 font-mono text-base font-bold text-[#4ade80] sm:text-lg">
          {active.length} <span className="text-xs text-[#8f8c96]">stars</span>
        </p>
      </div>
    </div>
  );
}
