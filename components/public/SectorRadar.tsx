import Link from "next/link";
import type { Star } from "@/lib/types";

export function SectorRadar({ star, stars }: { star: Star; stars: Star[] }) {
  const sorted = [...stars]
    .filter((s) => s.status === "active")
    .sort((a, b) => b.totalBidCents - a.totalBidCents || a.enteredAt.localeCompare(b.enteredAt));

  const myIndex = sorted.findIndex((s) => s.id === star.id);
  const nextAbove = myIndex > 0 ? sorted[myIndex - 1] : null;
  const nextBelow = myIndex >= 0 && myIndex < sorted.length - 1 ? sorted[myIndex + 1] : null;

  const gapCents = nextAbove ? Math.max(0, nextAbove.totalBidCents - star.totalBidCents + 100) : 0;

  return (
    <aside className="terminal-window rounded-xl p-4 font-mono text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
        <span className="text-[#38bdf8]">$ radar --sector</span>
        <span className="text-[10px] text-[#52525b]">NEIGHBORS</span>
      </div>

      <div className="space-y-2 text-[11px]">
        {nextAbove && (
          <div className="rounded border border-white/[0.06] bg-[#07070b] p-2.5">
            <span className="text-[10px] text-[#52525b]">ORBIT_ABOVE [#{myIndex}]</span>
            <div className="flex items-center justify-between mt-0.5">
              <Link href={`/star/${encodeURIComponent(nextAbove.id)}`} className="text-[#f3f4f6] hover:text-[#38bdf8]">
                {nextAbove.name}
              </Link>
              <span className="text-[#fbbf24] font-semibold">${(nextAbove.totalBidCents / 100).toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-[#27c93f] mt-0.5">
              +${(gapCents / 100).toFixed(2)} to overtake
            </p>
          </div>
        )}

        <div className="rounded border border-[#38bdf8]/40 bg-[#38bdf8]/5 p-2.5">
          <span className="text-[10px] text-[#38bdf8] font-bold">CURRENT_TARGET [#{myIndex + 1}]</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="font-semibold text-[#f3f4f6]">{star.name}</span>
            <span className="font-bold text-[#fbbf24]">${(star.totalBidCents / 100).toFixed(2)}</span>
          </div>
        </div>

        {nextBelow && (
          <div className="rounded border border-white/[0.06] bg-[#07070b] p-2.5">
            <span className="text-[10px] text-[#52525b]">ORBIT_BELOW [#{myIndex + 2}]</span>
            <div className="flex items-center justify-between mt-0.5">
              <Link href={`/star/${encodeURIComponent(nextBelow.id)}`} className="text-[#71717a] hover:text-[#f3f4f6]">
                {nextBelow.name}
              </Link>
              <span className="text-[#71717a]">${(nextBelow.totalBidCents / 100).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
