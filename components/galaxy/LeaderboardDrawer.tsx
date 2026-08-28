"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Star } from "@/lib/types";
import { rankActiveStars } from "@/lib/math/galaxyLayout";

type LeaderboardDrawerProps = { stars: Star[]; open: boolean; onClose: () => void; onSelectStar: (star: Star, rank: number) => void };

export function LeaderboardDrawer({ stars, open, onClose, onSelectStar }: LeaderboardDrawerProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "top5" | "founding">("all");
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  const sorted = useMemo(() => {
    let list = rankActiveStars(stars);
    if (filter === "top5") list = list.slice(0, 5);
    if (filter === "founding") list = list.filter((star) => star.isFounding);
    const query = search.trim().toLowerCase();
    return query ? list.filter((star) => `${star.name} ${star.xHandle ?? ""}`.toLowerCase().includes(query)) : list;
  }, [filter, search, stars]);

  if (!open) return null;

  return (
    <dialog open aria-labelledby="leaderboard-title" aria-modal="true" className="fixed inset-0 z-50 m-0 flex h-full w-full max-w-none justify-end border-0 bg-black/60 p-0 backdrop-blur-xs" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#0c0c12] p-4 font-mono shadow-2xl sm:p-5" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs">
          <div className="flex items-center gap-2"><span className="text-[#38bdf8]">$</span><h2 id="leaderboard-title" className="font-semibold text-[#f3f4f6]">top --gravity</h2><span className="text-[#52525b]">({sorted.length})</span></div>
          <button type="button" onClick={onClose} aria-label="Close leaderboard" className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-[#71717a] hover:text-[#f3f4f6]">[close ✕]</button>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#07070b] px-3 py-2 text-xs"><span className="text-[#52525b]">grep:</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Filter projects" placeholder="filter projects..." className="flex-1 bg-transparent text-[#f3f4f6] outline-none placeholder-[#52525b]" /></div>
          <div className="flex gap-1.5 text-[11px]">{(["all", "top5", "founding"] as const).map((mode) => <button key={mode} type="button" onClick={() => setFilter(mode)} aria-pressed={filter === mode} className={`rounded-md px-2.5 py-1 transition ${filter === mode ? "border border-[#38bdf8]/30 bg-white/10 font-bold text-[#38bdf8]" : "text-[#71717a] hover:text-[#f3f4f6]"}`}>--{mode}</button>)}</div>
        </div>
        <div className="mt-3 flex-1 overflow-y-auto pr-1 text-xs">
          <div className="grid grid-cols-[40px_1fr_auto] gap-2 border-b border-white/[0.04] py-1 text-[10px] text-[#52525b]"><span>RNK</span><span>PROJECT</span><span className="text-right">GRAVITY</span></div>
          {sorted.map((star, index) => <button type="button" key={star.id} onClick={() => { onSelectStar(star, index + 1); onClose(); }} className="grid w-full grid-cols-[40px_1fr_auto] items-center gap-2 border-b border-white/[0.04] py-3 text-left transition hover:bg-white/[0.04] active:bg-white/[0.06]"><span className="font-medium text-[#71717a]">#{String(index + 1).padStart(2, "0")}</span><span className="truncate font-medium text-[#f3f4f6]">{star.name}{star.isFounding && <span className="ml-1 text-[9px] text-[#fbbf24]">[FOUNDING]</span>}</span><span className="text-right font-bold text-[#fbbf24]">${(star.totalBidCents / 100).toFixed(2)}</span></button>)}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3 text-xs"><Link href="/leaderboard" className="font-semibold text-[#38bdf8] hover:underline">&gt; full matrix table →</Link><Link href="/create" className="rounded border border-[#38bdf8]/40 bg-[#38bdf8]/15 px-2.5 py-1 text-[11px] font-bold text-[#38bdf8]">+ spawn star</Link></div>
      </div>
    </dialog>
  );
}
