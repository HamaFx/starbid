"use client";

import Link from "next/link";
import { minimumSingularityTotalCents } from "@/lib/math/rankTargets";
import type { Star } from "@/lib/types";

export function ObservatoryHUD({
  stars,
  onOpenLeaderboard,
  onOpenPalette,
}: {
  stars: Star[];
  onOpenLeaderboard: () => void;
  onOpenPalette: () => void;
}) {
  const active = [...stars].filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);
  const totalGravityCents = active.reduce((sum, s) => sum + s.totalBidCents, 0);
  const leader = active[0];
  const hurdleCents = leader ? minimumSingularityTotalCents(leader.totalBidCents) : 300;

  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] bg-[#0c0c12]/90 px-3 py-2 text-xs backdrop-blur-md sm:px-4">
      {/* Terminal Prompt / Command Palette Trigger */}
      <div className="flex items-center gap-2 font-mono">
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex items-center gap-1.5 rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[#71717a] transition hover:border-[#38bdf8]/40 hover:text-[#f3f4f6]"
        >
          <span className="text-[#38bdf8]">$</span>
          <span>find</span>
          <kbd className="hidden rounded bg-white/10 px-1 py-0.2 text-[9px] text-[#52525b] sm:inline-block">⌘K</kbd>
        </button>
      </div>

      {/* Telemetry Stats */}
      <div className="hidden items-center gap-3 font-mono text-[11px] md:flex">
        <div className="flex items-center gap-1.5 text-[#71717a]">
          <span>gravity:</span>
          <span className="font-semibold text-[#fbbf24]">${(totalGravityCents / 100).toFixed(2)}</span>
        </div>
        <span className="text-[#27272a]">|</span>
        {leader && (
          <div className="flex items-center gap-1.5 text-[#71717a]">
            <span>leader:</span>
            <span className="text-[#f3f4f6]">{leader.name}</span>
            <span className="text-[#fbbf24]">(${(leader.totalBidCents / 100).toFixed(2)})</span>
          </div>
        )}
        <span className="text-[#27272a]">|</span>
        <div className="flex items-center gap-1.5 text-[#71717a]">
          <span>hurdle:</span>
          <span className="font-semibold text-[#38bdf8]">${(hurdleCents / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 font-mono text-xs">
        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[#f3f4f6] transition hover:border-[#38bdf8]/50 hover:bg-white/[0.06]"
        >
          <span>top</span>
          <span className="rounded bg-white/10 px-1 text-[10px] text-[#fbbf24]">{active.length}</span>
        </button>

        <Link
          href="/dashboard"
          className="hidden rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[#71717a] transition hover:text-[#f3f4f6] sm:inline-block"
        >
          ~/stars
        </Link>

        <Link
          href="/create"
          className="flex items-center gap-1 rounded border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-3 py-1 font-semibold text-[#38bdf8] transition hover:bg-[#38bdf8] hover:text-[#07070b]"
        >
          <span>+</span>
          <span>spawn</span>
        </Link>
      </div>
    </div>
  );
}
