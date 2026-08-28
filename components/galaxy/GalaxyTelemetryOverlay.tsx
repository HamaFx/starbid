import type { HoveredStar } from "@/components/galaxy/useGalaxyInteraction";

export function GalaxyTelemetryOverlay({ hovered }: { hovered: HoveredStar | null }) {
  if (!hovered) return null;
  return (
    <aside className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full space-y-2 rounded-xl border border-[#38bdf8]/40 bg-[#0c0c12]/95 p-3.5 font-mono text-xs shadow-2xl backdrop-blur-lg" style={{ left: hovered.x, top: hovered.y - 12, minWidth: 240 }} aria-live="polite">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
        <div className="flex min-w-0 items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#38bdf8]" /><p className="truncate text-xs font-bold text-[#f3f4f6]">{hovered.star.name}</p></div>
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-[#fbbf24]">#{hovered.rank}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-[#71717a]">
        <div><span className="text-[#52525b]">DISTANCE:</span><p className="font-semibold text-[#38bdf8]">{hovered.au} AU</p></div>
        <div><span className="text-[#52525b]">VELOCITY:</span><p className="font-semibold text-[#22d3ee]">{hovered.speed} km/s</p></div>
        <div><span className="text-[#52525b]">GRAVITY MASS:</span><p className="font-bold text-[#fbbf24]">${(hovered.star.totalBidCents / 100).toFixed(2)}</p></div>
        <div><span className="text-[#52525b]">BEARING:</span><p className="font-semibold text-[#f3f4f6]">{hovered.angle}°</p></div>
      </div>
      {hovered.rank > 1 && <div className="flex justify-between rounded border border-[#fbbf24]/20 bg-[#fbbf24]/5 px-2 py-1 text-[10px] text-[#fbbf24]"><span>+${hovered.deltaDollars} to pass #{hovered.rank - 1}</span><span className="font-bold">↗</span></div>}
    </aside>
  );
}
