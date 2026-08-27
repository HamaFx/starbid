"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Star } from "@/lib/types";

export function StarPreviewModal({
  star,
  rank,
  onClose,
}: {
  star: Star | null;
  rank: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!star) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-mono"
      onClick={onClose}
    >
      <div
        className="terminal-window w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="terminal-header flex h-8 items-center justify-between px-3 text-[11px] text-[#71717a]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="truncate px-2">inspect --pid={star.id}</span>
          <button type="button" onClick={onClose} className="hover:text-[#f3f4f6]">[x]</button>
        </div>

        {/* Body Content */}
        <div className="p-4 text-xs space-y-3">
          <div className="flex items-baseline justify-between border-b border-white/[0.04] pb-2">
            <div>
              <span className="text-[#38bdf8] text-sm font-bold">{star.name}</span>
              {star.xHandle && <p className="text-[10px] text-[#52525b]">{star.xHandle}</p>}
            </div>
            <span className="rounded bg-white/5 px-2 py-0.5 text-[#fbbf24] font-semibold">
              RANK #{rank}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#71717a]">
            <div>
              <span>GRAVITY_TOTAL:</span>
              <p className="text-[#f3f4f6] font-semibold">${(star.totalBidCents / 100).toFixed(2)}</p>
            </div>
            <div>
              <span>ORBIT_VECTOR:</span>
              <p className="text-[#f3f4f6]">{Math.round(star.angleSeed)}°</p>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
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
