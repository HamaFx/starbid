"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { TerminalWindowBar } from "@/components/ui/TerminalWindowBar";
import { GalaxyCanvas } from "@/components/galaxy/GalaxyCanvas";
import { GalaxyListView } from "@/components/galaxy/GalaxyListView";
import { ObservatoryHUD, type FilterTier } from "@/components/galaxy/ObservatoryHUD";
import { FloatingTicker } from "@/components/galaxy/FloatingTicker";
import { LeaderboardDrawer } from "@/components/galaxy/LeaderboardDrawer";
import { StarPreviewModal } from "@/components/galaxy/StarPreviewModal";
import { CommandPalette } from "@/components/galaxy/CommandPalette";
import { useGalaxyStore } from "@/lib/store/galaxyStore";
import { createSupabaseBrowserClient } from "@/lib/db/browserClient";
import { listPublicStars } from "@/lib/db/stars";
import { subscribeToGalaxy } from "@/lib/db/realtimeSync";
import type { Star } from "@/lib/types";
import { rankActiveStars } from "@/lib/math/galaxyLayout";

export function ObservatoryStage({ initialStars = [] }: { initialStars?: Star[] }) {
  const stars = useGalaxyStore((state) => state.stars);
  const setStars = useGalaxyStore((state) => state.setStars);

  const [view, setView] = useState<"galaxy" | "list">("galaxy");
  const [filterTier, setFilterTier] = useState<FilterTier>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectedStar, setSelectedStar] = useState<{ star: Star; rank: number } | null>(null);
  const cameraActionsRef = useRef<{
    resetCamera: () => void;
    focusCameraOn: (starId: string, zoom?: number) => void;
  } | null>(null);

  const initialStarsRef = useRef(initialStars);

  useEffect(() => {
    let cancelled = false;
    setStars(initialStarsRef.current);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const client = createSupabaseBrowserClient();
    void listPublicStars(client).then((live) => { if (!cancelled && live.length) useGalaxyStore.getState().mergeStars(live); });
    const unsubscribe = subscribeToGalaxy(client);
    return () => { cancelled = true; unsubscribe(); };
  }, [setStars]);

  const currentStars = stars.length ? stars : initialStars;
  const activeList = useMemo(() => rankActiveStars(currentStars), [currentStars]);

  const cycleStar = useCallback((offset: number) => {
    if (!activeList.length) return;
    setSelectedStar((prev) => {
      const curIdx = prev ? activeList.findIndex((s) => s.id === prev.star.id) : -1;
      const nextIdx = (curIdx + offset + activeList.length) % activeList.length;
      return { star: activeList[nextIdx], rank: nextIdx + 1 };
    });
  }, [activeList]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((prev) => !prev); }
      if (paletteOpen || leaderboardOpen || selectedStar) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "j" || e.key === "ArrowDown") { e.preventDefault(); cycleStar(1); }
      if (e.key === "k" || e.key === "ArrowUp") { e.preventDefault(); cycleStar(-1); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [cycleStar, paletteOpen, leaderboardOpen, selectedStar]);

  return (
    <div className="terminal-window relative flex h-[calc(100dvh-1.5rem)] sm:h-[calc(100dvh-3rem)] max-h-[920px] min-h-[480px] w-full flex-col overflow-hidden rounded-xl border border-white/[0.08] shadow-2xl">
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
        filterTier={filterTier}
        onSelectTier={setFilterTier}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenLeaderboard={() => setLeaderboardOpen(true)}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <div className="relative flex-1 min-h-0 w-full bg-[#07070b]">
        {view === "galaxy" ? (
          <div className="h-full w-full min-h-0">
            <GalaxyCanvas
              stars={currentStars}
              filterTier={filterTier}
              searchQuery={searchQuery}
              onSelectStar={(star, rank) => setSelectedStar({ star, rank })}
              onSceneReady={(actions) => {
                cameraActionsRef.current = actions;
              }}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-4xl p-4 sm:p-6">
            <GalaxyListView stars={currentStars} />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-14 left-2.5 right-2.5 z-20 flex flex-wrap items-end justify-between gap-2 sm:bottom-3 sm:left-3 sm:right-3">
        <div className="flex items-center gap-2 max-w-full overflow-hidden">
          <FloatingTicker initialStars={currentStars} />
        </div>
      </div>

      <LeaderboardDrawer stars={currentStars} open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} onSelectStar={(star, rank) => setSelectedStar({ star, rank })} />
      <StarPreviewModal star={selectedStar?.star ?? null} rank={selectedStar?.rank ?? 1} onClose={() => setSelectedStar(null)} onNextStar={() => cycleStar(1)} onPrevStar={() => cycleStar(-1)} />
      <CommandPalette stars={currentStars} open={paletteOpen} onClose={() => setPaletteOpen(false)} onSelectStar={(star, rank) => setSelectedStar({ star, rank })} onToggleView={() => setView((v) => (v === "galaxy" ? "list" : "galaxy"))} onResetCamera={() => cameraActionsRef.current?.resetCamera()} />
    </div>
  );
}
