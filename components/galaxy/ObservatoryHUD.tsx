"use client";

import Link from "next/link";
import { minimumSingularityTotalCents } from "@/lib/math/rankTargets";
import type { Star } from "@/lib/types";

export type FilterTier = "all" | "core" | "photon" | "inner" | "founding";

export function ObservatoryHUD({
  stars,
  filterTier,
  onSelectTier,
  searchQuery,
  onSearchChange,
  onOpenLeaderboard,
  onOpenPalette,
}: {
  stars: Star[];
  filterTier: FilterTier;
  onSelectTier: (tier: FilterTier) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenLeaderboard: () => void;
  onOpenPalette: () => void;
}) {
  const active = [...stars].filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);
  const totalGravityCents = active.reduce((sum, s) => sum + s.totalBidCents, 0);
  const leader = active[0];
  const hurdleCents = leader ? minimumSingularityTotalCents(leader.totalBidCents) : 300;

  return (
    <div className="flex flex-col gap-2 border-b border-white/[0.08] bg-[#0c0c12]/90 px-3 py-2 text-xs backdrop-blur-md font-mono sm:px-4">
      <div className="flex items-center justify-between gap-2">
        {/* Search / Command Prompt */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <button
            type="button"
            onClick={onOpenPalette}
            className="flex items-center gap-1.5 rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[#71717a] transition hover:border-[#38bdf8]/40 hover:text-[#f3f4f6]"
          >
            <span className="text-[#38bdf8]">$</span>
            <span>find</span>
            <kbd className="hidden rounded bg-white/10 px-1 py-0.2 text-[9px] text-[#52525b] sm:inline-block">⌘K</kbd>
          </button>

          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="grep orbit..."
            className="hidden sm:block flex-1 rounded border border-white/[0.08] bg-[#07070b] px-2.5 py-1 text-[11px] text-[#f3f4f6] outline-none placeholder-[#52525b] focus:border-[#38bdf8]"
          />
        </div>

        {/* Telemetry Stats & Founding Scarcity */}
        <div className="hidden items-center gap-3 text-[11px] lg:flex">
          <div className="flex items-center gap-1.5 text-[#71717a]">
            <span>gravity:</span>
            <span className="font-semibold text-[#fbbf24]">${(totalGravityCents / 100).toFixed(2)}</span>
          </div>
          <span className="text-[#27272a]">|</span>
          <div className="flex items-center gap-1 text-[#71717a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
            <span>founding:</span>
            <span className="font-semibold text-[#fbbf24]">
              {Math.min(50, active.filter((s) => s.isFounding).length)}/50
            </span>
            <span className="text-[9px] text-[#52525b]">[LIFETIME]</span>
          </div>
          <span className="text-[#27272a]">|</span>
          {leader && (
            <div className="flex items-center gap-1.5 text-[#71717a]">
              <span>#1:</span>
              <span className="text-[#f3f4f6] font-semibold">{leader.name}</span>
              <span className="text-[#fbbf24]">(${(leader.totalBidCents / 100).toFixed(2)})</span>
            </div>
          )}
          <span className="text-[#27272a]">|</span>
          <div className="flex items-center gap-1.5 text-[#71717a]">
            <span>dethrone #1:</span>
            <Link
              href={leader ? `/star/${encodeURIComponent(leader.id)}` : "/create"}
              className="font-bold text-[#38bdf8] hover:underline"
              title="Click to view outbid target"
            >
              ${(hurdleCents / 100).toFixed(2)} ↗
            </Link>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[#f3f4f6] transition hover:border-[#38bdf8]/50 hover:bg-white/[0.06]"
          >
            <span>top</span>
            <span className="rounded bg-white/10 px-1 text-[10px] text-[#fbbf24]">{active.length}</span>
          </button>

          <Link
            href="/create"
            className="flex items-center gap-1 rounded border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-3 py-1 font-semibold text-[#38bdf8] transition hover:bg-[#38bdf8] hover:text-[#07070b]"
          >
            <span>+</span>
            <span>spawn</span>
          </Link>
        </div>
      </div>

      {/* Tier Filter Chips Bar */}
      <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
        <span className="text-[#52525b] mr-1">filter:</span>
        {(["all", "core", "photon", "inner", "founding"] as const).map((tier) => (
          <button
            key={tier}
            type="button"
            onClick={() => onSelectTier(tier)}
            className={`rounded px-2 py-0.5 transition uppercase ${
              filterTier === tier ? "bg-white/10 text-[#38bdf8] font-bold" : "text-[#52525b] hover:text-[#71717a]"
            }`}
          >
            --{tier}
          </button>
        ))}
        <span className="hidden md:inline-block ml-auto text-[9px] text-[#52525b]">
          [J/K next/prev · Space pause · 0 recenter]
        </span>
      </div>
    </div>
  );
}
