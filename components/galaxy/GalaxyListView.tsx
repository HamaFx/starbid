import Link from "next/link";
import type { Star } from "@/lib/types";

function getTierLabel(index: number) {
  if (index === 0) return { label: "CORE", color: "text-[#38bdf8] bg-[#38bdf8]/10" };
  if (index < 3) return { label: "PHOTON", color: "text-[#fbbf24] bg-[#fbbf24]/10" };
  if (index < 8) return { label: "INNER", color: "text-[#f97316] bg-[#f97316]/10" };
  if (index < 15) return { label: "MID", color: "text-[#71717a] bg-white/5" };
  return { label: "RIM", color: "text-[#52525b] bg-white/[0.02]" };
}

export function GalaxyListView({ stars }: { stars: Star[] }) {
  const ranked = [...stars]
    .filter((star) => star.status === "active")
    .sort((a, b) => b.totalBidCents - a.totalBidCents || a.enteredAt.localeCompare(b.enteredAt));
  const foundingCount = ranked.filter((s) => s.isFounding).length;

  return (
    <div className="font-mono text-xs">
      {/* Founding Scarcity Banner */}
      <div className="mb-3 flex items-center justify-between rounded-lg border border-[#fbbf24]/30 bg-[#fbbf24]/5 px-3 py-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-[#fbbf24]">
          <span className="h-2 w-2 rounded-full bg-[#fbbf24] animate-pulse" />
          <span className="font-bold">FOUNDING STAR ALLOCATION:</span>
          <span>{Math.min(50, foundingCount)}/50 Claimed</span>
        </div>
        <Link
          href="/create"
          className="rounded bg-[#fbbf24]/15 px-2 py-0.5 font-bold text-[#fbbf24] hover:bg-[#fbbf24] hover:text-[#05050a] transition"
        >
          Claim Slot ($3+) ↗
        </Link>
      </div>

      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 text-[10px] text-[#52525b]">
        <span>PID / PROJECT</span>
        <span>GRAVITY / ACTION</span>
      </div>

      <ol className="divide-y divide-white/[0.04]" aria-label="Orbital Matrix">
        {ranked.map((star, index) => {
          const tier = getTierLabel(index);
          return (
            <li
              key={star.id}
              className="flex items-center justify-between gap-3 py-2.5 transition hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[#52525b] text-[11px] w-6">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="truncate">
                  <Link
                    href={`/star/${encodeURIComponent(star.id)}`}
                    className="font-medium text-[#f3f4f6] hover:text-[#38bdf8] transition"
                  >
                    {star.name}
                  </Link>

                  <span
                    className={`ml-2 rounded px-1 py-0.5 text-[9px] font-semibold ${tier.color}`}
                  >
                    {tier.label}
                  </span>

                  {star.isFounding && (
                    <span className="ml-1 text-[9px] text-[#fbbf24]">[FOUNDING]</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-[#fbbf24]">
                  ${(star.totalBidCents / 100).toFixed(2)}
                </span>
                <Link
                  href={`/star/${encodeURIComponent(star.id)}`}
                  className="rounded border border-white/[0.08] px-2 py-0.5 text-[10px] text-[#71717a] hover:text-[#f3f4f6] hover:border-[#38bdf8]/40"
                >
                  inspect →
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
