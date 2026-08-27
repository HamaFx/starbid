"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Star } from "@/lib/types";

export function CommandPalette({
  stars,
  open,
  onClose,
  onSelectStar,
  onToggleView,
  onResetCamera,
}: {
  stars: Star[];
  open: boolean;
  onClose: () => void;
  onSelectStar: (star: Star, rank: number) => void;
  onToggleView: () => void;
  onResetCamera: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeStars = useMemo(() => {
    return [...stars].filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);
  }, [stars]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const actions = [
      { id: "action-spawn", title: "+ Spawn New Star", subtitle: "Enter orbit with minimum $3 bid", execute: () => router.push("/create") },
      { id: "action-leaderboard", title: "top -o gravity", subtitle: "Open complete orbital matrix ranking", execute: () => router.push("/leaderboard") },
      { id: "action-keyring", title: "~/keyring", subtitle: "View stored bearer claim tokens", execute: () => router.push("/dashboard") },
      { id: "action-matrix", title: "toggle-view", subtitle: "Switch between canvas and list matrix", execute: () => { onToggleView(); onClose(); } },
      { id: "action-reset", title: "viewport --recenter", subtitle: "Reset camera zoom and center", execute: () => { onResetCamera(); onClose(); } },
    ];

    if (!q) return [...actions, ...activeStars.map((s, idx) => ({ id: s.id, star: s, rank: idx + 1, title: s.name, subtitle: `#${idx + 1} · $${(s.totalBidCents / 100).toFixed(2)} · ${s.xHandle ?? "orbit"}`, execute: () => { onSelectStar(s, idx + 1); onClose(); } }))];

    const filteredActions = actions.filter((a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q));
    const filteredStars = activeStars
      .map((s, idx) => ({ s, rank: idx + 1 }))
      .filter(({ s }) => s.name.toLowerCase().includes(q) || (s.xHandle && s.xHandle.toLowerCase().includes(q)))
      .map(({ s, rank }) => ({ id: s.id, star: s, rank, title: s.name, subtitle: `#${rank} · $${(s.totalBidCents / 100).toFixed(2)} · ${s.xHandle ?? "orbit"}`, execute: () => { onSelectStar(s, rank); onClose(); } }));

    return [...filteredActions, ...filteredStars];
  }, [query, activeStars, onSelectStar, onToggleView, onResetCamera, onClose, router]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => (i + 1) % Math.max(1, results.length)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => (i - 1 + results.length) % Math.max(1, results.length)); }
      if (e.key === "Enter" && results[selectedIndex]) { e.preventDefault(); results[selectedIndex].execute(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, results, selectedIndex, onClose]);

  if (!open) return null;

  const handleClose = () => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[12vh] p-4 backdrop-blur-xs font-mono" onClick={handleClose}>
      <div className="terminal-window w-full max-w-lg rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="terminal-header flex h-8 items-center justify-between px-3 text-[11px] text-[#71717a]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span>command_palette --fuzzy</span>
          <button type="button" onClick={handleClose} className="text-[10px] text-[#71717a] hover:text-[#f3f4f6]">[esc]</button>
        </div>

        <div className="border-b border-white/[0.08] p-3">
          <div className="flex items-center gap-2 rounded border border-white/[0.08] bg-[#07070b] px-3 py-2 text-xs">
            <span className="text-[#38bdf8]">&gt;</span>
            <input ref={inputRef} type="search" value={query} onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }} placeholder="type command or search star..." className="flex-1 bg-transparent text-[#f3f4f6] outline-none placeholder-[#52525b]" />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1 text-xs">
          {results.length === 0 ? (
            <p className="p-4 text-center text-[#52525b]">no matching commands or stars found</p>
          ) : (
            results.map((item, idx) => (
              <div key={item.id} onClick={item.execute} onMouseEnter={() => setSelectedIndex(idx)} className={`flex items-center justify-between gap-2 rounded px-3 py-2 transition cursor-pointer ${selectedIndex === idx ? "bg-white/10 text-[#38bdf8]" : "text-[#71717a] hover:text-[#f3f4f6]"}`}>
                <div className="truncate">
                  <span className="font-semibold text-[#f3f4f6]">{item.title}</span>
                  <p className="text-[10px] text-[#52525b] truncate">{item.subtitle}</p>
                </div>
                <span className="text-[10px] text-[#52525b]">↵ select</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
