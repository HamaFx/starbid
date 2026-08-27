import type { Star } from "@/lib/types";
import { ReportStarForm } from "@/components/public/ReportStarForm";
import { CostToRank } from "@/components/public/CostToRank";

export function LiveStarDetails({ star, stars = [star] }: { star: Star; stars?: Star[] }) {
  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-[#0a0a14] p-6">
      <div className="flex items-start justify-between gap-4">
        <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8f8c96]">Current project</p><h2 className="mt-2 text-2xl">{star.name}</h2></div>
        {star.isDemo && <span className="rounded-full border border-[#ffb627]/50 px-3 py-1 font-mono text-xs text-[#ffb627]">DEMO</span>}
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-[#8f8c96]">Total gravity</dt><dd className="mt-1 font-mono text-[#ffb627]">${(star.totalBidCents / 100).toFixed(2)}</dd></div><div><dt className="text-[#8f8c96]">Status</dt><dd className="mt-1 text-[#4ade80]">Active</dd></div></dl>
      <CostToRank star={star} stars={stars} />
      <p className="mt-6 text-sm text-[#8f8c96]">Payments are currently disabled; ranking changes will return when payment processing is available.</p><a href={`/api/click/${encodeURIComponent(star.id)}`} className="mt-3 inline-block text-sm text-[#4cc9f0]">Visit project →</a><ReportStarForm projectId={star.projectId} />
    </section>
  );
}
