import type { Star } from "@/lib/types";
import { ReportStarForm } from "@/components/public/ReportStarForm";
import { CostToRank } from "@/components/public/CostToRank";

export function LiveStarDetails({ star, stars = [star] }: { star: Star; stars?: Star[] }) {
  const active = stars.filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);
  const rank = active.findIndex((s) => s.id === star.id) + 1;
  const rankDisplay = rank > 0 ? `#${rank}` : "In Orbit";

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-[#0a0a14] p-5 sm:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#4cc9f0]">
            Orbit Telemetry / {star.id.slice(0, 8)}
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#fff4e0] sm:text-3xl">
            {star.name}
          </h1>
          {star.xHandle && (
            <p className="mt-1 font-mono text-xs text-[#8f8c96]">
              {star.xHandle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {star.isFounding && (
            <span className="rounded-full border border-[#ffb627]/40 bg-[#ffb627]/10 px-3 py-1 font-mono text-xs text-[#ffb627]">
              FOUNDING
            </span>
          )}
          {star.isDemo && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-[#8f8c96]">
              DEMO
            </span>
          )}
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-[#05050a] p-4 sm:grid-cols-4 sm:gap-4">
        <div>
          <dt className="text-xs text-[#8f8c96]">Current Rank</dt>
          <dd className="mt-1 font-mono text-lg font-bold text-[#fff4e0]">{rankDisplay}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#8f8c96]">Total Gravity</dt>
          <dd className="mt-1 font-mono text-lg font-bold text-[#ffb627]">
            ${(star.totalBidCents / 100).toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#8f8c96]">Status</dt>
          <dd className="mt-1 text-sm font-medium text-[#4ade80]">Active</dd>
        </div>
        <div>
          <dt className="text-xs text-[#8f8c96]">Angle Seed</dt>
          <dd className="mt-1 font-mono text-sm text-[#8f8c96]">{Math.round(star.angleSeed)}°</dd>
        </div>
      </dl>

      {/* Outbound Link CTA */}
      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#4cc9f0]/30 bg-[#4cc9f0]/5 p-4">
        <div>
          <p className="text-xs text-[#8f8c96]">Direct Project Link</p>
          <p className="truncate text-sm font-medium text-[#fff4e0]">{star.linkUrl}</p>
        </div>
        <a
          href={`/api/click/${encodeURIComponent(star.id)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#4cc9f0] px-4 py-2 text-xs font-semibold text-[#05050a] transition hover:bg-[#3db8df]"
        >
          <span>Visit Website</span>
          <span>↗</span>
        </a>
      </div>

      {/* Dynamic SVG Badge Preview */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#05050a] p-3.5">
        <div>
          <span className="font-mono text-[10px] uppercase text-[#8f8c96]">Dynamic Live Badge</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/badge/${encodeURIComponent(star.id)}`} alt={`${star.name} badge`} className="mt-1.5 h-6" />
        </div>
        <a href={`/api/badge/${encodeURIComponent(star.id)}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-[#4cc9f0] hover:underline">
          View SVG ↗
        </a>
      </div>

      {/* Interactive Rank Calculator */}
      <CostToRank star={star} stars={stars} />

      {/* Report Form */}
      <div className="mt-6 border-t border-white/10 pt-4">
        <ReportStarForm projectId={star.projectId} />
      </div>
    </section>
  );
}
