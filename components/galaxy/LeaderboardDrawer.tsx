"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { Star } from "@/lib/types";

export function LeaderboardDrawer({
  stars,
  open,
  onClose,
  onSelectStar,
}: {
  stars: Star[];
  open: boolean;
  onClose: () => void;
  onSelectStar: (star: Star, rank: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "top5" | "founding">("all");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const sorted = useMemo(() => {
    let list = [...stars]
      .filter((s) => s.status === "active")
      .sort((a, b) => b.totalBidCents - a.totalBidCents);
    if (filter === "top5") list = list.slice(0, 5);
    if (filter === "founding") list = list.filter((s) => s.isFounding);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.xHandle && s.xHandle.toLowerCase().includes(q))
      );
    }
    return list;
  }, [stars, search, filter]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="leaderboard-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#0c0c12] p-4 font-mono shadow-2xl sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#38bdf8]">$</span>
            <span id="leaderboard-title" className="font-semibold text-[#f3f4f6]">
              top --gravity
            </span>
            <span className="text-[#52525b]">({sorted.length})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-[#71717a] hover:text-[#f3f4f6] active:scale-95"
          >
            [close ✕]
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#07070b] px-3 py-2 text-xs">
            <span className="text-[#52525b]">grep:</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="filter projects..."
              className="flex-1 bg-transparent text-[#f3f4f6] outline-none placeholder-[#52525b]"
            />
          </div>

          <div className="flex gap-1.5 text-[11px]">
            {(["all", "top5", "founding"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFilter(m)}
                className={`rounded-md px-2.5 py-1 transition ${
                  filter === m
                    ? "bg-white/10 text-[#38bdf8] font-bold border border-[#38bdf8]/30"
                    : "text-[#71717a] hover:text-[#f3f4f6]"
                }`}
              >
                --{m}
              </button>
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="mt-3 flex-1 overflow-y-auto pr-1 text-xs">
          <div className="grid grid-cols-[40px_1fr_auto] gap-2 border-b border-white/[0.04] py-1 text-[10px] text-[#52525b]">
            <span>RNK</span>
            <span>PROJECT</span>
            <span className="text-right">GRAVITY</span>
          </div>

          {sorted.map((star, idx) => (
            <div
              key={star.id}
              onClick={() => {
                onSelectStar(star, idx + 1);
                onClose();
              }}
              className="grid grid-cols-[40px_1fr_auto] gap-2 border-b border-white/[0.04] py-3 transition hover:bg-white/[0.04] active:bg-white/[0.06] cursor-pointer items-center"
            >
              <span className="text-[#71717a] font-medium">#{String(idx + 1).padStart(2, "0")}</span>
              <div className="truncate text-[#f3f4f6] hover:text-[#38bdf8] font-medium">
                {star.name}
                {star.isFounding && (
                  <span className="ml-1 text-[9px] text-[#fbbf24]">[FOUNDING]</span>
                )}
              </div>
              <span className="text-right font-bold text-[#fbbf24]">
                ${(star.totalBidCents / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 border-t border-white/[0.08] pt-3 text-xs flex justify-between items-center">
          <Link
            href="/leaderboard"
            className="text-[#38bdf8] font-semibold hover:underline"
          >
            &gt; full matrix table →
          </Link>
          <Link
            href="/create"
            className="rounded bg-[#38bdf8]/15 border border-[#38bdf8]/40 px-2.5 py-1 text-[#38bdf8] font-bold text-[11px]"
          >
            + spawn star
          </Link>
        </div>
      </div>
    </div>
  );
}
