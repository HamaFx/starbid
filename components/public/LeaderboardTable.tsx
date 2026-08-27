"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Star } from "@/lib/types";

export function LeaderboardTable({ stars }: { stars: Star[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "founding" | "top10">("all");

  const filtered = useMemo(() => {
    let list = [...stars].filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);
    if (filter === "founding") list = list.filter((s) => s.isFounding);
    if (filter === "top10") list = list.slice(0, 10);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.xHandle && s.xHandle.toLowerCase().includes(q)));
    }
    return list;
  }, [stars, search, filter]);

  const foundingCount = stars.filter((s) => s.isFounding && s.status === "active").length;

  return (
    <div className="font-mono text-xs space-y-3">
      {/* Founding Scarcity Banner */}
      <div className="flex items-center justify-between rounded-lg border border-[#fbbf24]/30 bg-[#fbbf24]/5 px-3 py-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-[#fbbf24]">
          <span className="h-2 w-2 rounded-full bg-[#fbbf24] animate-pulse" />
          <span className="font-bold">EARLY FOUNDER SLOTS:</span>
          <span>{Math.min(50, foundingCount)}/50 Claimed</span>
        </div>
        <Link
          href="/create"
          className="rounded bg-[#fbbf24]/15 px-2 py-0.5 font-bold text-[#fbbf24] hover:bg-[#fbbf24] hover:text-[#05050a] transition"
        >
          Spawn Star ($3+) ↗
        </Link>
      </div>

      {/* Filter / Search Command Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2 rounded border border-white/[0.08] bg-[#07070b] px-3 py-1.5 text-xs sm:w-72">
          <span className="text-[#52525b]">grep:</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="filter projects..."
            className="flex-1 bg-transparent text-[#f3f4f6] outline-none placeholder-[#52525b]"
          />
        </div>

        <div className="flex gap-1 text-[11px]">
          {(["all", "top10", "founding"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilter(m)}
              className={`rounded px-2.5 py-1 transition ${
                filter === m ? "bg-white/10 text-[#38bdf8] font-semibold" : "text-[#52525b] hover:text-[#71717a]"
              }`}
            >
              --{m}
            </button>
          ))}
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Live project orbital gravity leaderboard</caption>
          <thead className="border-b border-white/[0.08] text-[10px] text-[#52525b]">
            <tr>
              <th scope="col" className="py-2 px-3">RNK</th>
              <th scope="col" className="py-2 px-3">PROJECT</th>
              <th scope="col" className="py-2 px-3">HANDLE</th>
              <th scope="col" className="py-2 px-3 text-right">GRAVITY</th>
              <th scope="col" className="py-2 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((star, idx) => (
              <tr key={star.id} className="transition hover:bg-white/[0.02]">
                <td className="py-2.5 px-3 text-[#52525b]">
                  #{String(idx + 1).padStart(2, "0")}
                </td>
                <td className="py-2.5 px-3 font-semibold text-[#f3f4f6]">
                  <Link href={`/star/${encodeURIComponent(star.id)}`} className="hover:text-[#38bdf8]">
                    {star.name}
                  </Link>
                  {idx === 0 && <span className="ml-2 text-[9px] text-[#38bdf8]">[CORE]</span>}
                  {star.isFounding && <span className="ml-1 text-[9px] text-[#fbbf24]">[FOUNDING]</span>}
                </td>
                <td className="py-2.5 px-3 text-[#71717a]">
                  {star.xHandle ?? "—"}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-[#fbbf24]">
                  ${(star.totalBidCents / 100).toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <Link
                    href={`/star/${encodeURIComponent(star.id)}`}
                    className="rounded border border-white/[0.08] px-2 py-0.5 text-[10px] text-[#71717a] hover:text-[#f3f4f6]"
                  >
                    inspect →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
