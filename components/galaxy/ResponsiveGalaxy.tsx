"use client";

import { useState } from "react";
import { GalaxyCanvas } from "@/components/galaxy/GalaxyCanvas";
import { GalaxyListView } from "@/components/galaxy/GalaxyListView";
import type { Star } from "@/lib/types";
import { useLOD } from "@/components/galaxy/useLOD";

export function ResponsiveGalaxy({ stars }: { stars: Star[] }) {
  const [view, setView] = useState<"list" | "galaxy">("list");
  const lod = useLOD();
  return <div><div className="mb-4 flex gap-2"><button type="button" onClick={() => setView("list")} className={`rounded-full px-3 py-1 font-mono text-xs ${view === "list" ? "bg-[#4cc9f0] text-[#05050a]" : "border border-white/10 text-[#8f8c96]"}`}>List</button><button type="button" onClick={() => setView("galaxy")} className={`rounded-full px-3 py-1 font-mono text-xs ${view === "galaxy" ? "bg-[#4cc9f0] text-[#05050a]" : "border border-white/10 text-[#8f8c96]"}`}>View Galaxy</button></div><div className={view === "list" || lod === "list" ? "block lg:hidden" : "hidden"}><GalaxyListView stars={stars} /></div><div className={view === "galaxy" ? "block" : "hidden lg:block"}><GalaxyCanvas stars={stars} /></div></div>;
}
