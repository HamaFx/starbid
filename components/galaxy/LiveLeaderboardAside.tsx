"use client";

import Link from "next/link";
import { useGalaxyStore } from "@/lib/store/galaxyStore";
import { minimumSingularityTotalCents } from "@/lib/math/rankTargets";
import type { Star } from "@/lib/types";
import { rankActiveStars } from "@/lib/math/galaxyLayout";

export function LiveLeaderboardAside({ initialStars }: { initialStars: Star[] }) {
  const storeStars = useGalaxyStore((state) => state.stars);
  const stars = storeStars.length ? storeStars : initialStars;
  const activeStars = rankActiveStars(stars);

  const leader = activeStars[0];
  const singularityHurdleCents = leader ? minimumSingularityTotalCents(leader.totalBidCents) : 300;

  return (
    <aside className="rounded-2xl border border-white/10 bg-[#0a0a14] p-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#8f8c96]">
          Live Leaderboard
        </p>
        <Link href="/leaderboard" className="font-mono text-xs text-[#4cc9f0] hover:underline">
          Full list →
        </Link>
      </div>

      <ol className="mt-4 space-y-3" aria-label="Top active projects">
        {activeStars.slice(0, 7).map((star, index) => (
          <li key={star.id} className="flex items-center justify-between gap-2.5">
            <span className="font-mono text-xs text-[#8f8c96]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Link
              href={`/star/${encodeURIComponent(star.id)}`}
              className="flex-1 truncate text-sm text-[#fff4e0] transition hover:text-[#4cc9f0]"
            >
              {star.name}
            </Link>
            {index === 0 && (
              <span className="rounded bg-[#ffb627]/15 px-1.5 py-0.5 font-mono text-[9px] text-[#ffb627]">
                CORE
              </span>
            )}
            {star.isFounding && (
              <span className="rounded bg-[#fff4e0]/10 px-1.5 py-0.5 font-mono text-[9px] text-[#fff4e0]">
                FOUNDING
              </span>
            )}
            {star.isDemo && (
              <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-[#8f8c96]">
                DEMO
              </span>
            )}
            <span className="font-mono text-xs font-medium text-[#ffb627]">
              ${(star.totalBidCents / 100).toFixed(2)}
            </span>
          </li>
        ))}
      </ol>

      {leader && (
        <div className="mt-6 rounded-xl border border-white/5 bg-[#05050a] p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#8f8c96]">
            Singularity (#1) Boss Target
          </p>
          <p className="mt-1 font-mono text-xs text-[#ffb627]">
            ${(singularityHurdleCents / 100).toFixed(2)} <span className="text-[#8f8c96]">(+15% threshold)</span>
          </p>
        </div>
      )}

      <p className="mt-5 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-[#8f8c96]">
        Position is determined live by lifetime cumulative gravity. No decay.
      </p>
    </aside>
  );
}
