import Link from "next/link";
import type { Star } from "@/lib/types";

export function SectorRadar({ star, stars }: { star: Star; stars: Star[] }) {
  const sorted = [...stars]
    .filter((s) => s.status === "active")
    .sort((a, b) => b.totalBidCents - a.totalBidCents || a.enteredAt.localeCompare(b.enteredAt));

  const myIndex = sorted.findIndex((s) => s.id === star.id);
  const nextAbove = myIndex > 0 ? sorted[myIndex - 1] : null;
  const nextBelow = myIndex >= 0 && myIndex < sorted.length - 1 ? sorted[myIndex + 1] : null;

  const gapToOvertakeCents = nextAbove
    ? Math.max(0, nextAbove.totalBidCents - star.totalBidCents + 100)
    : 0;

  return (
    <aside className="rounded-2xl border border-white/10 bg-[#0a0a14] p-5 sm:p-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ffb627]">
        Sector Proximity
      </p>
      <h2 className="mt-1 text-lg font-bold text-[#fff4e0]">
        Orbital Neighbors
      </h2>
      <p className="mt-1 text-xs text-[#8f8c96]">
        Projects occupying adjacent orbits in this accretion band.
      </p>

      <div className="mt-4 space-y-3 font-mono text-xs">
        {nextAbove && (
          <div className="rounded-xl border border-white/5 bg-[#05050a] p-3">
            <span className="text-[10px] text-[#8f8c96]">Orbit Directly Above (#{myIndex})</span>
            <div className="mt-1 flex items-center justify-between">
              <Link href={`/star/${encodeURIComponent(nextAbove.id)}`} className="text-[#fff4e0] hover:text-[#4cc9f0]">
                {nextAbove.name}
              </Link>
              <span className="text-[#ffb627]">${(nextAbove.totalBidCents / 100).toFixed(2)}</span>
            </div>
            <p className="mt-1 text-[10px] text-[#4ade80]">
              +${(gapToOvertakeCents / 100).toFixed(2)} needed to overtake
            </p>
          </div>
        )}

        <div className="rounded-xl border border-[#4cc9f0]/40 bg-[#4cc9f0]/10 p-3">
          <span className="text-[10px] font-semibold text-[#4cc9f0]">Current Target (#{myIndex + 1})</span>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-semibold text-[#fff4e0]">{star.name}</span>
            <span className="font-bold text-[#ffb627]">${(star.totalBidCents / 100).toFixed(2)}</span>
          </div>
        </div>

        {nextBelow && (
          <div className="rounded-xl border border-white/5 bg-[#05050a] p-3">
            <span className="text-[10px] text-[#8f8c96]">Orbit Directly Below (#{myIndex + 2})</span>
            <div className="mt-1 flex items-center justify-between">
              <Link href={`/star/${encodeURIComponent(nextBelow.id)}`} className="text-[#8f8c96] hover:text-[#fff4e0]">
                {nextBelow.name}
              </Link>
              <span className="text-[#8f8c96]">${(nextBelow.totalBidCents / 100).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
