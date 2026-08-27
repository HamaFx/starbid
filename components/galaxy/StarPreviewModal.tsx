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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!star) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/20 bg-[#0a0a14]/95 p-6 shadow-2xl shadow-orange-950/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#4cc9f0]">
              Orbit Sector / #{rank}
            </span>
            <h2 id="preview-title" className="mt-1 text-xl font-bold text-[#fff4e0]">
              {star.name}
            </h2>
            {star.xHandle && (
              <p className="font-mono text-xs text-[#8f8c96]">{star.xHandle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 font-mono text-sm text-[#8f8c96] hover:text-[#fff4e0]"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-[#05050a] p-3 text-xs">
          <div>
            <span className="text-[#8f8c96]">Total Gravity:</span>
            <p className="font-mono text-base font-bold text-[#ffb627]">
              ${(star.totalBidCents / 100).toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-[#8f8c96]">Orbital Angle:</span>
            <p className="font-mono text-sm text-[#fff4e0]">{Math.round(star.angleSeed)}°</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <a
            href={`/api/click/${encodeURIComponent(star.id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#4cc9f0] py-2.5 text-xs font-semibold text-[#05050a] transition hover:bg-[#3db8df]"
          >
            <span>Visit Website</span>
            <span>↗</span>
          </a>
          <Link
            href={`/star/${encodeURIComponent(star.id)}`}
            className="flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-[#fff4e0] transition hover:bg-white/10"
          >
            Full Telemetry →
          </Link>
        </div>
      </div>
    </div>
  );
}
