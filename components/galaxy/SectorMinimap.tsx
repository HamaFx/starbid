"use client";

import { useEffect, useState } from "react";
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
  const [radarAngle, setRadarAngle] = useState(0);
  const active = [...stars].filter((s) => s.status === "active").slice(0, 20);
  const size = 68;
  const center = size / 2;

  useEffect(() => {
    let animId: number;
    let last = performance.now();

    const frame = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      setRadarAngle((prev) => (prev + delta * 120) % 360);
      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, []);

  const sweepRad = (radarAngle * Math.PI) / 180;
  const sweepX = center + Math.cos(sweepRad) * 30;
  const sweepY = center + Math.sin(sweepRad) * 30 * 0.62;

  return (
    <div
      aria-label="Sector Radar Minimap"
      className="pointer-events-auto flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-[#0c0c12]/90 p-2 font-mono text-[10px] backdrop-blur-md shadow-xl"
    >
      <svg width={size} height={size} className="overflow-visible">
        {/* Radar Background Glow */}
        <circle cx={center} cy={center} r={30} fill="rgba(56,189,248,0.02)" />

        {/* Accretion Ring Guides with 0.62 tilt projection */}
        <ellipse
          cx={center}
          cy={center}
          rx={30}
          ry={18.6}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.8"
        />
        <ellipse
          cx={center}
          cy={center}
          rx={20}
          ry={12.4}
          fill="none"
          stroke="rgba(251,191,36,0.12)"
          strokeWidth="0.8"
        />
        <ellipse
          cx={center}
          cy={center}
          rx={10}
          ry={6.2}
          fill="none"
          stroke="rgba(56,189,248,0.22)"
          strokeWidth="1"
        />

        {/* Scanning Sweep Line */}
        <line
          x1={center}
          y1={center}
          x2={sweepX}
          y2={sweepY}
          stroke="rgba(56,189,248,0.4)"
          strokeWidth="1.2"
        />

        {/* Singularity Core */}
        <circle cx={center} cy={center} r={3.5} fill="#050508" stroke="#38bdf8" strokeWidth="1.2" />

        {/* Star Plot Dots */}
        {active.map((star, idx) => {
          const rad = (star.angleSeed * Math.PI) / 180;
          const dist = 8 + (idx / Math.max(1, active.length)) * 21;
          const x = center + Math.cos(rad) * dist;
          const y = center + Math.sin(rad) * dist * 0.62;
          const color =
            idx === 0 ? "#38bdf8" : idx < 3 ? "#fbbf24" : idx < 8 ? "#f97316" : "#71717a";

          return (
            <circle
              key={star.id}
              cx={x}
              cy={y}
              r={idx === 0 ? 2.5 : 1.4}
              fill={color}
              className="transition cursor-pointer hover:r-3"
              onClick={() => onFocusStar?.(star)}
            >
              <title>{`${star.name} (#${idx + 1})`}</title>
            </circle>
          );
        })}
      </svg>

      <div className="hidden flex-col justify-center gap-0.5 text-[9px] text-[#52525b] sm:flex">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
          <span className="text-[#38bdf8] font-bold">RADAR // 001</span>
        </div>
        <span>{active.length} ORBITING</span>
        <span className="text-[#71717a]">{zoom.toFixed(1)}x ZOOM</span>
      </div>
    </div>
  );
}
