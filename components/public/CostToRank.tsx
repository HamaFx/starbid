"use client";

import { useMemo, useState } from "react";
import type { Star } from "@/lib/types";
import { amountToTakeSingularity, rankForTotal } from "@/lib/math/rankTargets";

export function CostToRank({ star, stars }: { star: Star; stars: Star[] }) {
  const [amount, setAmount] = useState(300);
  const active = useMemo(() => stars.filter((item) => item.status === "active"), [stars]);
  const leader = active.reduce((top, item) => item.totalBidCents > top.totalBidCents ? item : top, star);
  const projected = star.totalBidCents + amount;
  const rank = rankForTotal(active, projected);
  const singularity = amountToTakeSingularity(star.totalBidCents, leader.totalBidCents);
  return (
    <section className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4" aria-label="Cost to rank calculator">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#8f8c96]">Rank calculator</p>
      <label className="mt-3 block text-sm text-[#8f8c96]">Additional amount (cents)
        <input value={amount} onChange={(event) => setAmount(Math.max(0, Number(event.target.value) || 0))} type="number" min="0" step="100" className="mt-2 w-full rounded-lg border border-white/10 bg-[#05050a] px-3 py-2 font-mono text-sm text-[#fff4e0]" />
      </label>
      <p className="mt-3 text-sm">Projected rank: <strong className="font-mono text-[#ffb627]">#{rank}</strong></p>
      <p className="mt-2 text-xs text-[#8f8c96]">Current singularity target: ${(singularity / 100).toFixed(2)} minimum additional total.</p>
    </section>
  );
}
