"use client";

import Link from "next/link";
import { minimumSingularityTotalCents } from "@/lib/math/rankTargets";
import type { Star } from "@/lib/types";

export function ObservatoryHUD({
  stars,
  onOpenLeaderboard,
}: {
  stars: Star[];
  onOpenLeaderboard: () => void;
}) {
  const active = [...stars].filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);
  const totalGravityCents = active.reduce((sum, s) => sum + s.totalBidCents, 0);
  const leader = active[0];
  const hurdleCents = leader ? minimumSingularityTotalCents(leader.totalBidCents) : 300;

  return (
    <header className="pointer-events-auto flex items-center justify-between gap-2 rounded-2xl border border-white/15 bg-[#05050a]/80 p-2.5 shadow-2xl backdrop-blur-xl sm:gap-4 sm:px-5 sm:py-3">
      {/* Brand & Live Sector */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 items-center justify-center">
            <span className="h-2 w-2 animate-ping rounded-full bg-[#4ade80]" />
          </span>
          <span className="font-display text-base font-bold tracking-tight text-[#fff4e0] sm:text-lg">
            StarBid
          </span>
        </Link>
        <span className="hidden rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#4cc9f0] md:inline-block">
          SECTOR 001-ALPHA
        </span>
      </div>

      {/* Center Accretion Telemetry Capsules */}
      <div className="hidden items-center gap-2.5 xl:flex">
        <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-[#0a0a14] px-3 py-1 font-mono text-xs">
          <span className="text-[#8f8c96]">Total Gravity:</span>
          <strong className="text-[#ffb627]">${(totalGravityCents / 100).toFixed(2)}</strong>
        </div>

        {leader && (
          <div className="flex items-center gap-1.5 rounded-lg border border-[#ffb627]/30 bg-[#ffb627]/10 px-3 py-1 font-mono text-xs">
            <span className="text-[#ffb627]">👑 #1 {leader.name}:</span>
            <strong className="text-[#fff4e0]">${(leader.totalBidCents / 100).toFixed(2)}</strong>
          </div>
        )}

        <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-[#0a0a14] px-3 py-1 font-mono text-xs">
          <span className="text-[#8f8c96]">Dethrone Target:</span>
          <strong className="text-[#4cc9f0]">${(hurdleCents / 100).toFixed(2)}</strong>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-[#fff4e0] transition hover:border-[#4cc9f0] hover:bg-white/10"
        >
          <span>📋</span>
          <span className="hidden sm:inline">Rankings</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-[#ffb627]">{active.length}</span>
        </button>

        <Link
          href="/dashboard"
          className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-[#8f8c96] hover:text-[#fff4e0] lg:inline-block"
        >
          My Stars
        </Link>

        <Link
          href="/create"
          className="flex items-center gap-1 rounded-xl bg-[#4cc9f0] px-3.5 py-2 text-xs font-bold text-[#05050a] shadow-lg shadow-[#4cc9f0]/20 transition hover:bg-[#3db8df] sm:px-4"
        >
          <span>✦</span>
          <span>Launch Star</span>
        </Link>
      </div>
    </header>
  );
}
