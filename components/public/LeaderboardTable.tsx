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

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects or @handles…"
          className="rounded-xl border border-white/10 bg-[#05050a] px-3.5 py-2 text-xs text-[#fff4e0] outline-none focus:border-[#4cc9f0] sm:w-64"
        />

        <div className="flex gap-1.5">
          {(["all", "top10", "founding"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`rounded-lg px-2.5 py-1 font-mono text-xs transition ${
                filter === mode
                  ? "bg-[#4cc9f0] font-semibold text-[#05050a]"
                  : "border border-white/10 bg-[#05050a] text-[#8f8c96] hover:text-[#fff4e0]"
              }`}
            >
              {mode === "all" ? "All Orbits" : mode === "top10" ? "Top 10" : "Founding"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a14]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-[#05050a] font-mono text-xs text-[#8f8c96]">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Project</th>
                <th className="p-4 text-right">Total Gravity</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-xs text-[#8f8c96]">
                    No matching stars in orbit.
                  </td>
                </tr>
              ) : (
                filtered.map((star, index) => (
                  <tr key={star.id} className="transition hover:bg-[#0f0f1c]">
                    <td className="p-4 text-xs font-semibold text-[#8f8c96]">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="p-4 font-sans font-medium text-[#fff4e0]">
                      <div className="flex items-center gap-2">
                        <Link href={`/star/${encodeURIComponent(star.id)}`} className="hover:text-[#4cc9f0]">
                          {star.name}
                        </Link>
                        {index === 0 && (
                          <span className="rounded bg-[#ffb627]/15 px-1.5 py-0.5 font-mono text-[9px] text-[#ffb627]">
                            CORE #1
                          </span>
                        )}
                        {star.isFounding && (
                          <span className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-[9px] text-[#ffb627]">
                            FOUNDING
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono font-semibold text-[#ffb627]">
                      ${(star.totalBidCents / 100).toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/star/${encodeURIComponent(star.id)}`}
                        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-[#8f8c96] hover:border-[#4cc9f0] hover:text-[#4cc9f0]"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
