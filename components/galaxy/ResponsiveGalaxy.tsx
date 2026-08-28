"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GalaxyCanvas } from "@/components/galaxy/GalaxyCanvas";
import { GalaxyListView } from "@/components/galaxy/GalaxyListView";
import { StarPreviewModal } from "@/components/galaxy/StarPreviewModal";
import type { Star } from "@/lib/types";
import { useLOD } from "@/components/galaxy/useLOD";

export function ResponsiveGalaxy({ stars }: { stars: Star[] }) {
  const lod = useLOD();
  const [view, setView] = useState<"list" | "galaxy">("galaxy");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncView = () => {
      if (mediaQuery.matches) setView("list");
    };
    syncView();
    mediaQuery.addEventListener("change", syncView);
    return () => mediaQuery.removeEventListener("change", syncView);
  }, []);
  const [selectedStar, setSelectedStar] = useState<{ star: Star; rank: number } | null>(null);

  const effectiveView = lod === "list" ? "list" : view;
  const activeStars = stars.filter((s) => s.status === "active");

  return (
    <div className="p-3.5 sm:p-5">
      {/* Top Controls Bar */}
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        {/* Segmented Control */}
        <div className="flex rounded-lg border border-white/10 bg-[#05050a] p-1">
          <button
            type="button"
            onClick={() => setView("galaxy")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition ${
              effectiveView === "galaxy"
                ? "bg-[#4cc9f0] font-semibold text-[#05050a] shadow-sm"
                : "text-[#8f8c96] hover:text-[#fff4e0]"
            }`}
          >
            <span>🌌</span>
            <span>Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition ${
              effectiveView === "list"
                ? "bg-[#4cc9f0] font-semibold text-[#05050a] shadow-sm"
                : "text-[#8f8c96] hover:text-[#fff4e0]"
            }`}
          >
            <span>📋</span>
            <span>List</span>
          </button>
        </div>

        {/* Orbit Telemetry Info */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#8f8c96]">
            <strong className="text-[#ffb627]">{activeStars.length}</strong> in orbit
          </span>
          <Link
            href="/create"
            className="hidden rounded-lg bg-white/5 px-2.5 py-1 font-mono text-xs text-[#4cc9f0] hover:bg-white/10 sm:inline-block"
          >
            + New Star
          </Link>
        </div>
      </div>

      {/* Render Surface */}
      <div>
        {effectiveView === "list" ? (
          <GalaxyListView stars={stars} />
        ) : (
          <div className="accretion-glow rounded-xl">
            <GalaxyCanvas
              stars={stars}
              onSelectStar={(star, rank) => setSelectedStar({ star, rank })}
            />
          </div>
        )}
      </div>

      {/* Interactive Modal Drawer */}
      <StarPreviewModal
        star={selectedStar?.star ?? null}
        rank={selectedStar?.rank ?? 1}
        onClose={() => setSelectedStar(null)}
      />
    </div>
  );
}
