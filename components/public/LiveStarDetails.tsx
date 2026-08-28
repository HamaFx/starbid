"use client";

import { useState } from "react";
import type { Star } from "@/lib/types";
import { ReportStarForm } from "@/components/public/ReportStarForm";
import { CostToRank } from "@/components/public/CostToRank";
import { rankActiveStars } from "@/lib/math/galaxyLayout";

export function LiveStarDetails({ star, stars = [star] }: { star: Star; stars?: Star[] }) {
  const [copied, setCopied] = useState(false);
  const active = rankActiveStars(stars);
  const rank = active.findIndex((s) => s.id === star.id) + 1;
  const rankDisplay = rank > 0 ? `#${rank}` : "UNRANKED";

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://starbid.app";
  const badgeMarkdown = `[![StarBid Orbit](${appUrl}/api/badge/${star.id})](${appUrl}/star/${star.id})`;

  const shareText = encodeURIComponent(
    `Check out ${star.name} orbiting at Rank #${rank} on @StarBidApp! 🌌\n\nCan you outbid us in the living accretion galaxy?\n${appUrl}/star/${star.id}`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  const copyBadge = async () => {
    try {
      await navigator.clipboard.writeText(badgeMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <section className="terminal-window rounded-xl p-4 sm:p-6 font-mono text-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/[0.08] pb-4">
        <div>
          <span className="text-[10px] text-[#52525b]">TELEMETRY // PID:{star.id.slice(0, 8)}</span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f3f4f6] mt-0.5">{star.name}</h1>
          {star.xHandle && <p className="text-[11px] text-[#71717a] mt-0.5">{star.xHandle}</p>}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-[#fbbf24] font-bold">
            RANK {rankDisplay}
          </span>
          {star.isFounding && (
            <span className="rounded bg-[#fbbf24]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#fbbf24]">
              [FOUNDING STAR]
            </span>
          )}
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-2 py-0.5 text-[11px] font-bold text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#07070b] transition"
          >
            𝕏 Challenge
          </a>
        </div>
      </div>

      {/* Telemetry Matrix Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
        <div className="rounded border border-white/[0.06] bg-[#07070b] p-2.5">
          <span className="text-[#52525b]">GRAVITY_TOTAL</span>
          <p className="text-sm font-bold text-[#fbbf24] mt-0.5">
            ${(star.totalBidCents / 100).toFixed(2)}
          </p>
        </div>
        <div className="rounded border border-white/[0.06] bg-[#07070b] p-2.5">
          <span className="text-[#52525b]">STATUS</span>
          <p className="text-sm font-bold text-[#27c93f] mt-0.5">ACTIVE</p>
        </div>
        <div className="rounded border border-white/[0.06] bg-[#07070b] p-2.5">
          <span className="text-[#52525b]">ORBIT_ANGLE</span>
          <p className="text-sm font-bold text-[#f3f4f6] mt-0.5">{Math.round(star.angleSeed)}°</p>
        </div>
        <div className="rounded border border-white/[0.06] bg-[#07070b] p-2.5">
          <span className="text-[#52525b]">BEARER_AUTH</span>
          <p className="text-sm font-bold text-[#38bdf8] mt-0.5">SECURE</p>
        </div>
      </div>

      {/* Outbound Link Bar */}
      <div className="flex items-center justify-between gap-3 rounded border border-white/[0.08] bg-[#07070b] p-3">
        <div className="truncate">
          <span className="text-[10px] text-[#52525b]">DESTINATION_URL:</span>
          <p className="truncate text-xs text-[#f3f4f6]">{star.linkUrl}</p>
        </div>
        <a
          href={`/api/click/${encodeURIComponent(star.id)}`}
          onClick={() => { void fetch(`/api/click/${encodeURIComponent(star.id)}/track`, { method: "POST", keepalive: true }); }}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded border border-[#38bdf8]/50 bg-[#38bdf8]/15 px-3 py-1.5 text-xs font-semibold text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#07070b] transition"
        >
          launch destination ↗
        </a>
      </div>

      {/* Dynamic Live SVG Badge & 1-Click Copy */}
      <div className="flex flex-col gap-2 rounded border border-white/[0.06] bg-[#07070b] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] text-[#52525b]">README & WEBSITE LIVE BADGE:</span>
          <div className="mt-1 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/badge/${encodeURIComponent(star.id)}`}
              alt={`${star.name} badge`}
              className="h-5"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={copyBadge}
          className="rounded border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-[#f3f4f6] hover:border-[#38bdf8]/50 transition"
        >
          {copied ? "✓ Copied Markdown!" : "📋 Copy README Markdown"}
        </button>
      </div>

      {/* Rank Calculator & Fuel Boost */}
      <CostToRank star={star} stars={stars} />

      {/* Report Section */}
      <div className="border-t border-white/[0.06] pt-3">
        <ReportStarForm projectId={star.projectId} />
      </div>
    </section>
  );
}
