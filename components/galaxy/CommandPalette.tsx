"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Star } from "@/lib/types";
import { rankActiveStars } from "@/lib/math/galaxyLayout";

type CommandPaletteProps = {
  stars: Star[];
  open: boolean;
  onClose: () => void;
  onSelectStar: (star: Star, rank: number) => void;
  onToggleView: () => void;
  onResetCamera: () => void;
};

export function CommandPalette({ stars, open, onClose, onSelectStar, onToggleView, onResetCamera }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose);
  const resultsRef = useRef<typeof results>([]);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  const activeStars = useMemo(() => rankActiveStars(stars), [stars]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const actions = [
      { id: "action-spawn", title: "+ Spawn New Star", subtitle: "Enter orbit with minimum $3 bid", execute: () => router.push("/create") },
      { id: "action-leaderboard", title: "top -o gravity", subtitle: "Open complete orbital matrix ranking", execute: () => router.push("/leaderboard") },
      { id: "action-keyring", title: "~/keyring", subtitle: "View stored bearer claim tokens", execute: () => router.push("/dashboard") },
      { id: "action-matrix", title: "toggle-view", subtitle: "Switch between canvas and list matrix", execute: () => { onToggleView(); onClose(); } },
      { id: "action-reset", title: "viewport --recenter", subtitle: "Reset camera zoom and center", execute: () => { onResetCamera(); onClose(); } },
    ];
    const filteredActions = q ? actions.filter((action) => `${action.title} ${action.subtitle}`.toLowerCase().includes(q)) : actions;
    const starResults = activeStars.flatMap((star, index) => {
      const rank = index + 1;
      if (q && !`${star.name} ${star.xHandle ?? ""}`.toLowerCase().includes(q)) return [];
      return [{ id: star.id, title: star.name, subtitle: `#${rank} · $${(star.totalBidCents / 100).toFixed(2)} · ${star.xHandle ?? "orbit"}`, execute: () => { onSelectStar(star, rank); onClose(); } }];
    });
    return [...filteredActions, ...starResults];
  }, [activeStars, onClose, onResetCamera, onSelectStar, onToggleView, query, router]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    resultsRef.current = results;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key === "ArrowDown") { event.preventDefault(); setSelectedIndex((index) => (index + 1) % Math.max(1, results.length)); }
      if (event.key === "ArrowUp") { event.preventDefault(); setSelectedIndex((index) => (index - 1 + results.length) % Math.max(1, results.length)); }
      if (event.key === "Enter" && resultsRef.current[selectedIndex]) { event.preventDefault(); resultsRef.current[selectedIndex].execute(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, results, selectedIndex]);

  if (!open) return null;
  const handleClose = () => { setQuery(""); setSelectedIndex(0); onClose(); };

  return (
    <dialog open aria-modal="true" aria-labelledby="cmd-palette-title" className="fixed inset-0 z-50 m-0 flex h-full w-full max-w-none items-start justify-center border-0 bg-black/60 p-4 pt-[12vh] backdrop-blur-xs font-mono" onClick={(event) => { if (event.target === event.currentTarget) handleClose(); }}>
      <div className="terminal-window w-full max-w-lg overflow-hidden rounded-xl shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="terminal-header flex h-8 items-center justify-between px-3 text-[11px] text-[#71717a]">
          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" /><span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" /></div>
          <span id="cmd-palette-title">command_palette --fuzzy</span>
          <button type="button" onClick={handleClose} aria-label="Close command palette" className="text-[10px] text-[#71717a] hover:text-[#f3f4f6]">[esc]</button>
        </div>
        <div className="border-b border-white/[0.08] p-3"><div className="flex items-center gap-2 rounded border border-white/[0.08] bg-[#07070b] px-3 py-2 text-xs"><span className="text-[#38bdf8]">&gt;</span><input ref={inputRef} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setSelectedIndex(0); }} aria-label="Search commands and stars" aria-controls="command-palette-results" className="flex-1 bg-transparent text-[#f3f4f6] outline-none placeholder-[#52525b]" placeholder="type command or search star..." /></div></div>
        <div id="command-palette-results" className="max-h-72 overflow-y-auto space-y-1 p-2 text-xs">
          {results.length === 0 ? <p className="p-4 text-center text-[#52525b]">no matching commands or stars found</p> : results.map((item, index) => <button type="button" key={item.id} onClick={item.execute} onMouseEnter={() => setSelectedIndex(index)} className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded px-3 py-2 text-left transition ${selectedIndex === index ? "bg-white/10 text-[#38bdf8]" : "text-[#71717a] hover:text-[#f3f4f6]"}`}><span className="truncate"><span className="font-semibold text-[#f3f4f6]">{item.title}</span><span className="block truncate text-[10px] text-[#52525b]">{item.subtitle}</span></span><span className="text-[10px] text-[#52525b]">↵ select</span></button>)}
        </div>
      </div>
    </dialog>
  );
}
