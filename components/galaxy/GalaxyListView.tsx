import type { Star } from "@/lib/types";

export function GalaxyListView({ stars }: { stars: Star[] }) {
  const ranked = [...stars].filter((star) => star.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents || a.enteredAt.localeCompare(b.enteredAt));
  return (
    <ol className="space-y-3" aria-label="Galaxy leaderboard">
      {ranked.map((star, index) => (
        <li key={star.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0a0a14] p-4">
          <span className="font-mono text-xs text-[#8f8c96]">{String(index + 1).padStart(2, "0")}</span>
          <a href={`/star/${encodeURIComponent(star.id)}`} className="min-w-0 flex-1 truncate text-sm text-[#fff4e0] hover:text-[#4cc9f0]">{star.name}</a>
          {star.isFounding && <span className="font-mono text-[10px] text-[#ffb627]">FOUNDING</span>}
          {star.isDemo && <span className="font-mono text-[10px] text-[#ffb627]">DEMO</span>}
          <span className="font-mono text-xs text-[#ffb627]">${(star.totalBidCents / 100).toFixed(2)}</span>
        </li>
      ))}
    </ol>
  );
}
