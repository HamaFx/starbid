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
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const sorted = useMemo(() => {
    let list = [...stars].filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);
    if (filter === "top5") list = list.slice(0, 5);
    if (filter === "founding") list = list.filter((s) => s.isFounding);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.xHandle && s.xHandle.toLowerCase().includes(q)));
    }
    return list;
  }, [stars, search, filter]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0a0a14]/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#4cc9f0]">Orbital Rankings</span>
            <h2 id="drawer-title" className="text-xl font-bold text-[#fff4e0]">Live Leaderboard</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close drawer" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-mono text-sm text-[#8f8c96] hover:text-[#fff4e0]">
            ✕
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mt-4 space-y-2.5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or @handles…"
            className="w-full rounded-xl border border-white/10 bg-[#05050a] px-3.5 py-2 text-xs text-[#fff4e0] outline-none focus:border-[#4cc9f0]"
          />
          <div className="flex gap-1.5">
            {(["all", "top5", "founding"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setFilter(m)} className={`rounded-lg px-2.5 py-1 font-mono text-xs transition ${filter === m ? "bg-[#4cc9f0] font-semibold text-[#05050a]" : "border border-white/10 bg-[#05050a] text-[#8f8c96] hover:text-[#fff4e0]"}`}>
                {m === "all" ? "All Orbits" : m === "top5" ? "Top 5" : "Founding"}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Star List */}
        <ol className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
          {sorted.map((star, idx) => (
            <li
              key={star.id}
              onClick={() => { onSelectStar(star, idx + 1); onClose(); }}
              className="group cursor-pointer rounded-xl border border-white/5 bg-[#05050a] p-3 transition hover:border-[#4cc9f0]/40 hover:bg-[#0f0f1c]"
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold text-[#8f8c96]">#{String(idx + 1).padStart(2, "0")}</span>
                  <span className="truncate text-sm font-medium text-[#fff4e0] group-hover:text-[#4cc9f0]">{star.name}</span>
                </div>
                <span className="font-mono text-xs font-bold text-[#ffb627]">${(star.totalBidCents / 100).toFixed(2)}</span>
              </div>
            </li>
          ))}
        </ol>

        {/* Footer */}
        <div className="mt-4 border-t border-white/10 pt-3">
          <Link href="/leaderboard" className="block text-center font-mono text-xs text-[#4cc9f0] hover:underline">
            Open Full Leaderboard Page →
          </Link>
        </div>
      </div>
    </div>
  );
}
