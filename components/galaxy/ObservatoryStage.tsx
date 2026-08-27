"use client";

import { useEffect, useState } from "react";
import { TerminalWindowBar } from "@/components/ui/TerminalWindowBar";
import { GalaxyCanvas } from "@/components/galaxy/GalaxyCanvas";
import { GalaxyListView } from "@/components/galaxy/GalaxyListView";
import { ObservatoryHUD } from "@/components/galaxy/ObservatoryHUD";
import { FloatingTicker } from "@/components/galaxy/FloatingTicker";
import { SectorMinimap } from "@/components/galaxy/SectorMinimap";
import { LeaderboardDrawer } from "@/components/galaxy/LeaderboardDrawer";
import { StarPreviewModal } from "@/components/galaxy/StarPreviewModal";
import { CommandPalette } from "@/components/galaxy/CommandPalette";
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
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectedStar, setSelectedStar] = useState<{ star: Star; rank: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStars(initialStars);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const client = createSupabaseBrowserClient();
    void listPublicStars(client).then((live) => { if (!cancelled && live.length) setStars(live); });
    const unsubscribe = subscribeToGalaxy(client);
    return () => { cancelled = true; unsubscribe(); };
  }, [initialStars, setStars]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const currentStars = stars.length ? stars : initialStars;

  return (
    <div className="terminal-window relative flex min-h-[85vh] w-full flex-col overflow-hidden rounded-xl border border-white/[0.08] sm:min-h-[88vh]">
      <TerminalWindowBar
        title="starbid — ~/supermassive/accretion_alpha — zsh"
        rightSlot={
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <button type="button" onClick={() => setView("galaxy")} className={`rounded px-1.5 py-0.5 transition ${view === "galaxy" ? "bg-white/10 text-[#38bdf8]" : "text-[#71717a] hover:text-[#f3f4f6]"}`}>canvas</button>
            <button type="button" onClick={() => setView("list")} className={`rounded px-1.5 py-0.5 transition ${view === "list" ? "bg-white/10 text-[#38bdf8]" : "text-[#71717a] hover:text-[#f3f4f6]"}`}>matrix</button>
          </div>
        }
      />

      <ObservatoryHUD
        stars={currentStars}
        onOpenLeaderboard={() => setLeaderboardOpen(true)}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <div className="relative flex-1 bg-[#07070b]">
        {view === "galaxy" ? (
          <div className="h-full w-full">
            <GalaxyCanvas stars={currentStars} onSelectStar={(star, rank) => setSelectedStar({ star, rank })} />
          </div>
        ) : (
          <div className="mx-auto max-w-4xl p-4 sm:p-6">
            <GalaxyListView stars={currentStars} />
          </div>
        )}
      </div>

      {/* Bottom Floating Telemetry & Minimap HUD */}
      <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-end justify-between gap-2 sm:bottom-3 sm:left-3 sm:right-3">
        <div className="flex items-center gap-2">
          <FloatingTicker initialStars={currentStars} />
          <SectorMinimap stars={currentStars} onFocusStar={(s) => setSelectedStar({ star: s, rank: 1 })} />
        </div>
      </div>

      <LeaderboardDrawer
        stars={currentStars}
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        onSelectStar={(star, rank) => setSelectedStar({ star, rank })}
      />

      <StarPreviewModal
        star={selectedStar?.star ?? null}
        rank={selectedStar?.rank ?? 1}
        onClose={() => setSelectedStar(null)}
      />

      <CommandPalette
        stars={currentStars}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectStar={(star, rank) => setSelectedStar({ star, rank })}
        onToggleView={() => setView((v) => (v === "galaxy" ? "list" : "galaxy"))}
        onResetCamera={() => {}}
      />
    </div>
  );
}
