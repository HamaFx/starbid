"use client";

import { useEffect } from "react";
import Link from "next/link";
import { sound } from "@/components/galaxy/AudioFeedback";
import type { Star } from "@/lib/types";

export function StarPreviewModal({
  star,
  rank,
  onClose,
  onNextStar,
  onPrevStar,
}: {
  star: Star | null;
  rank: number;
  onClose: () => void;
  onNextStar?: () => void;
  onPrevStar?: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNextStar) {
        sound.playTick();
        onNextStar();
      }
      if (e.key === "ArrowLeft" && onPrevStar) {
        sound.playTick();
        onPrevStar();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNextStar, onPrevStar]);

  if (!star) return null;

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://starbid.app";
  const shareText = encodeURIComponent(
    `Check out ${star.name} orbiting at Rank #${rank} on @StarBidApp! 🌌\n\nCan you outbid us in the living accretion galaxy?\n${appUrl}/star/${star.id}`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="star-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-mono"
      onClick={onClose}
    >
      <div
        className="terminal-window w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="terminal-header flex h-8 items-center justify-between px-3 text-[11px] text-[#71717a]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="truncate px-2">inspect --pid={star.id.slice(0, 8)}</span>
          <button type="button" onClick={onClose} className="hover:text-[#f3f4f6]">
            [x]
          </button>
        </div>

        <div className="p-4 text-xs space-y-3">
          <div className="flex items-baseline justify-between border-b border-white/[0.04] pb-2">
            <div>
              <span id="star-preview-title" className="text-[#38bdf8] text-sm font-bold">
                {star.name}
              </span>
              {star.xHandle && <p className="text-[10px] text-[#52525b]">{star.xHandle}</p>}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-white/5 px-2 py-0.5 text-[#fbbf24] font-semibold">
                RANK #{rank}
              </span>
              {star.isFounding && (
                <span className="rounded bg-[#fbbf24]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#fbbf24]">
                  [FOUNDING]
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#71717a]">
            <div className="rounded border border-white/[0.04] bg-[#07070b] p-2">
              <span className="text-[#52525b]">GRAVITY_TOTAL:</span>
              <p className="text-[#fbbf24] font-bold text-xs mt-0.5">
                ${(star.totalBidCents / 100).toFixed(2)}
              </p>
            </div>
            <div className="rounded border border-white/[0.04] bg-[#07070b] p-2">
              <span className="text-[#52525b]">ORBIT_VECTOR:</span>
              <p className="text-[#f3f4f6] font-semibold text-xs mt-0.5">
                {Math.round(star.angleSeed)}°
              </p>
            </div>
          </div>

          {/* Share & Social Battle Link */}
          <div className="flex items-center justify-between rounded border border-white/[0.06] bg-[#07070b] px-3 py-2 text-[11px]">
            <span className="text-[#71717a]">Share or Challenge:</span>
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[10px] font-bold text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#07070b] transition"
            >
              <span>𝕏 Post Challenge ↗</span>
            </a>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between border-t border-b border-white/[0.04] py-1.5 text-[10px] text-[#71717a]">
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                onPrevStar?.();
              }}
              className="hover:text-[#38bdf8]"
            >
              ← [prev]
            </button>
            <span className="text-[#52525b]">use ←/→ keys</span>
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                onNextStar?.();
              }}
              className="hover:text-[#38bdf8]"
            >
              [next] →
            </button>
          </div>

          <div className="pt-1 flex gap-2">
            <a
              href={`/api/click/${encodeURIComponent(star.id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center rounded border border-[#38bdf8]/40 bg-[#38bdf8]/10 py-2 text-xs font-semibold text-[#38bdf8] transition hover:bg-[#38bdf8] hover:text-[#07070b]"
            >
              launch destination ↗
            </a>
            <Link
              href={`/star/${encodeURIComponent(star.id)}`}
              className="flex-1 text-center rounded border border-white/[0.08] bg-white/[0.03] py-2 text-xs text-[#71717a] transition hover:text-[#f3f4f6] hover:bg-white/[0.06]"
            >
              telemetry matrix →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
