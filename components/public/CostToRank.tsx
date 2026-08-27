"use client";

import { useMemo, useState } from "react";
import type { Star } from "@/lib/types";
import { amountToTakeSingularity, rankForTotal } from "@/lib/math/rankTargets";

export function CostToRank({ star, stars }: { star: Star; stars: Star[] }) {
  const active = useMemo(
    () => stars.filter((item) => item.status === "active"),
    [stars]
  );
  const leader = useMemo(
    () => active.reduce((top, item) => (item.totalBidCents > top.totalBidCents ? item : top), star),
    [active, star]
  );

  const singularityNeeded = useMemo(
    () => amountToTakeSingularity(star.totalBidCents, leader.totalBidCents),
    [star.totalBidCents, leader.totalBidCents]
  );

  const [amountDollars, setAmountDollars] = useState(3);
  const amountCents = Math.round(amountDollars * 100);
  const projectedCents = star.totalBidCents + amountCents;
  const projectedRank = rankForTotal(active, projectedCents);

  return (
    <section className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4" aria-label="Cost to rank calculator">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#8f8c96]">
          Rank projection calculator
        </p>
        <span className="font-mono text-xs text-[#4cc9f0]">
          Projected: #{projectedRank}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[5, 15, 50, 100].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setAmountDollars(preset)}
            className={`rounded-lg px-2.5 py-1 font-mono text-xs transition ${
              amountDollars === preset
                ? "bg-[#4cc9f0] text-[#05050a]"
                : "border border-white/10 bg-[#05050a] text-[#8f8c96] hover:text-[#fff4e0]"
            }`}
          >
            +${preset}
          </button>
        ))}
        {singularityNeeded > 0 && (
          <button
            type="button"
            onClick={() => setAmountDollars(singularityNeeded / 100)}
            className="rounded-lg border border-[#ffb627]/40 bg-[#ffb627]/10 px-2.5 py-1 font-mono text-xs text-[#ffb627] hover:bg-[#ffb627]/20"
          >
            Take #1 (${(singularityNeeded / 100).toFixed(2)})
          </button>
        )}
      </div>

      <label className="mt-3 block text-xs text-[#8f8c96]">
        Additional amount ($ USD)
        <input
          value={amountDollars}
          onChange={(event) => setAmountDollars(Math.max(0, Number(event.target.value) || 0))}
          type="number"
          min="0"
          step="1"
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#05050a] px-3 py-2 font-mono text-sm text-[#fff4e0] outline-none focus:border-[#4cc9f0]"
        />
      </label>

      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
        <span className="text-[#8f8c96]">Resulting total:</span>
        <span className="font-mono text-[#ffb627]">${(projectedCents / 100).toFixed(2)}</span>
      </div>
    </section>
  );
}
