import Link from "next/link";
import type { Star } from "@/lib/types";

function getTierInfo(index: number) {
  if (index === 0) return { label: "CORE", color: "text-[#fff4e0] bg-[#fff4e0]/15 border-[#fff4e0]/30", border: "border-[#ffb627]/40" };
  if (index < 3) return { label: "PHOTON", color: "text-[#ffb627] bg-[#ffb627]/10 border-[#ffb627]/20", border: "border-[#ffb627]/20" };
  if (index < 8) return { label: "INNER", color: "text-[#ff6b35] bg-[#ff6b35]/10 border-[#ff6b35]/20", border: "border-white/10" };
  if (index < 15) return { label: "MID", color: "text-[#8f8c96] bg-white/5 border-white/10", border: "border-white/10" };
  return { label: "RIM", color: "text-[#7a2e1d] bg-[#7a2e1d]/10 border-[#7a2e1d]/20", border: "border-white/5" };
}

export function GalaxyListView({ stars }: { stars: Star[] }) {
  const ranked = [...stars]
    .filter((star) => star.status === "active")
    .sort((a, b) => b.totalBidCents - a.totalBidCents || a.enteredAt.localeCompare(b.enteredAt));

  const maxBid = ranked[0]?.totalBidCents || 1;

  return (
    <ol className="space-y-2.5" aria-label="Galaxy orbital leaderboard">
      {ranked.map((star, index) => {
        const tier = getTierInfo(index);
        const percentOfMax = Math.max(8, Math.round((star.totalBidCents / maxBid) * 100));

        return (
          <li
            key={star.id}
            className={`group relative overflow-hidden rounded-xl border ${tier.border} bg-[#0a0a14] p-3.5 transition hover:border-[#4cc9f0]/40 hover:bg-[#0f0f1c] sm:p-4`}
          >
            {/* Background gravity energy meter */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 top-0 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-transparent transition-all group-hover:from-[#4cc9f0]/10"
              style={{ width: `${percentOfMax}%` }}
            />

            <div className="relative flex items-center gap-3">
              {/* Rank Badge */}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#05050a] font-mono text-xs font-semibold text-[#fff4e0]">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Star Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/star/${encodeURIComponent(star.id)}`}
                    className="truncate text-sm font-medium text-[#fff4e0] transition hover:text-[#4cc9f0]"
                  >
                    {star.name}
                  </Link>

                  <span className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${tier.color}`}>
                    {tier.label}
                  </span>

                  {star.isFounding && (
                    <span className="hidden rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[9px] text-[#ffb627] sm:inline-block">
                      FOUNDING
                    </span>
                  )}
                  {star.isDemo && (
                    <span className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[8px] text-[#8f8c96]">
                      DEMO
                    </span>
                  )}
                </div>

                {/* Subtitle / Handle */}
                <p className="mt-0.5 font-mono text-[11px] text-[#8f8c96]">
                  {star.xHandle ? star.xHandle : `orbit/${star.id.slice(0, 8)}`}
                </p>
              </div>

              {/* Total Gravity */}
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-sm font-semibold text-[#ffb627]">
                  ${(star.totalBidCents / 100).toFixed(2)}
                </span>

                <Link
                  href={`/star/${encodeURIComponent(star.id)}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#05050a] text-xs text-[#8f8c96] transition hover:border-[#4cc9f0] hover:text-[#4cc9f0]"
                  aria-label={`Inspect ${star.name}`}
                >
                  →
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
