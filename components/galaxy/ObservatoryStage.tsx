"use client";

import { useEffect, useState } from "react";
import { GalaxyCanvas } from "@/components/galaxy/GalaxyCanvas";
import { GalaxyListView } from "@/components/galaxy/GalaxyListView";
import { ObservatoryHUD } from "@/components/galaxy/ObservatoryHUD";
import { FloatingTicker } from "@/components/galaxy/FloatingTicker";
import { LeaderboardDrawer } from "@/components/galaxy/LeaderboardDrawer";
import { StarPreviewModal } from "@/components/galaxy/StarPreviewModal";
import { useGalaxyStore } from "@/lib/store/galaxyStore";
import { createSupabaseBrowserClient } from "@/lib/db/browserClient";
import { listPublicStars } from "@/lib/db/stars";
import { subscribeToGalaxy } from "@/lib/db/realtimeSync";
import type { Star } from "@/lib/types";

export function ObservatoryStage({ initialStars = [] }: { initialStars?: Star[] }) {
  const stars = useGalaxyStore((state) => state.stars);
  const setStars = useGalaxyStore((state) => state.setStars);

  const [view, setView] = useState<"galaxy" | "list">("galaxy");
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [selectedStar, setSelectedStar] = useState<{ star: Star; rank: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStars(initialStars);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const client = createSupabaseBrowserClient();
    void listPublicStars(client).then((liveStars) => {
      if (!cancelled && liveStars.length) setStars(liveStars);
    });
    const unsubscribe = subscribeToGalaxy(client);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [initialStars, setStars]);

  const currentStars = stars.length ? stars : initialStars;

  return (
    <div className="relative flex min-h-[85vh] w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#05050a] shadow-2xl shadow-orange-950/20 sm:min-h-[88vh]">
      {/* Top Floating HUD Bar */}
      <div className="absolute left-3 right-3 top-3 z-30 sm:left-5 sm:right-5 sm:top-5">
        <ObservatoryHUD
          stars={currentStars}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
        />
      </div>

      {/* Main Galaxy Arena */}
      <div className="relative flex-1">
        {view === "galaxy" ? (
          <div className="accretion-glow h-full w-full">
            <GalaxyCanvas
              stars={currentStars}
              onSelectStar={(star, rank) => setSelectedStar({ star, rank })}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl p-6 pt-24">
            <GalaxyListView stars={currentStars} />
          </div>
        )}
      </div>

      {/* Bottom Floating Bar */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 sm:bottom-5 sm:left-5 sm:right-5">
        <FloatingTicker initialStars={currentStars} />

        {/* View Toggle */}
        <div className="pointer-events-auto flex rounded-xl border border-white/10 bg-[#05050a]/80 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setView("galaxy")}
            className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition ${
              view === "galaxy" ? "bg-[#4cc9f0] font-semibold text-[#05050a]" : "text-[#8f8c96] hover:text-[#fff4e0]"
            }`}
          >
            🌌 Canvas
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition ${
              view === "list" ? "bg-[#4cc9f0] font-semibold text-[#05050a]" : "text-[#8f8c96] hover:text-[#fff4e0]"
            }`}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Slide-Over Leaderboard Drawer */}
      <LeaderboardDrawer
        stars={currentStars}
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        onSelectStar={(star, rank) => setSelectedStar({ star, rank })}
      />

      {/* Star Preview Inspector */}
      <StarPreviewModal
        star={selectedStar?.star ?? null}
        rank={selectedStar?.rank ?? 1}
        onClose={() => setSelectedStar(null)}
      />
    </div>
  );
}
