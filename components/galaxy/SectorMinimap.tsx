"use client";

import type { Star } from "@/lib/types";

export function SectorMinimap({
  stars,
  zoom = 1,
  onFocusStar,
}: {
  stars: Star[];
  zoom?: number;
  onFocusStar?: (star: Star) => void;
}) {
  const active = [...stars].filter((s) => s.status === "active").slice(0, 15);
  const size = 64;
  const center = size / 2;

  return (
    <div
      aria-label="Sector Radar Minimap"
      className="pointer-events-auto flex items-center gap-2 rounded border border-white/[0.08] bg-[#0c0c12]/90 p-1.5 font-mono text-[10px] backdrop-blur-md"
    >
      <svg width={size} height={size} className="overflow-visible">
        {/* Accretion Ring Guides */}
        <circle cx={center} cy={center} r={28} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
        <circle cx={center} cy={center} r={16} fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="0.8" />
        <circle cx={center} cy={center} r={7} fill="none" stroke="rgba(56,189,248,0.3)" strokeWidth="1" />

        {/* Singularity Core */}
        <circle cx={center} cy={center} r={3} fill="#07070b" stroke="#38bdf8" strokeWidth="1" />

        {/* Star Plot Dots */}
        {active.map((star, idx) => {
          const rad = (star.angleSeed * Math.PI) / 180;
          const dist = 7 + (idx / Math.max(1, active.length)) * 20;
          const x = center + Math.cos(rad) * dist;
          const y = center + Math.sin(rad) * dist * 0.62;
          const color = idx === 0 ? "#38bdf8" : idx < 3 ? "#fbbf24" : idx < 8 ? "#f97316" : "#71717a";

          return (
            <circle
              key={star.id}
              cx={x}
              cy={y}
              r={idx === 0 ? 2 : 1.2}
              fill={color}
              className="transition cursor-pointer hover:r-3"
              onClick={() => onFocusStar?.(star)}
            />
          );
        })}
      </svg>

      <div className="hidden flex-col justify-center gap-0.5 text-[9px] text-[#52525b] sm:flex">
        <span className="text-[#38bdf8] font-bold">RADAR // 001</span>
        <span>{active.length} ORBITING</span>
        <span className="text-[#71717a]">{zoom.toFixed(1)}x ZOOM</span>
      </div>
    </div>
  );
}
