"use client";

export function CanvasControls({
  paused,
  onTogglePause,
  speed,
  onChangeSpeed,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: {
  paused: boolean;
  onTogglePause: () => void;
  speed: number;
  onChangeSpeed: (nextSpeed: number) => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}) {
  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded border border-white/[0.08] bg-[#0c0c12]/90 p-1 font-mono text-[10px] backdrop-blur-md">
      {/* Zoom / Pan Controls */}
      {onZoomIn && onZoomOut && onResetZoom && (
        <>
          <button type="button" onClick={onZoomIn} aria-label="Zoom in" className="rounded px-1.5 py-0.5 text-[#71717a] hover:bg-white/[0.06] hover:text-[#f3f4f6]">
            +
          </button>
          <button type="button" onClick={onZoomOut} aria-label="Zoom out" className="rounded px-1.5 py-0.5 text-[#71717a] hover:bg-white/[0.06] hover:text-[#f3f4f6]">
            -
          </button>
          <button type="button" onClick={onResetZoom} className="rounded px-1.5 py-0.5 text-[#71717a] hover:bg-white/[0.06] hover:text-[#38bdf8]">
            ↺ {zoom.toFixed(1)}x
          </button>
          <span className="text-[#27272a]">|</span>
        </>
      )}

      {/* Orbit Speed & Pause */}
      <button
        type="button"
        onClick={onTogglePause}
        className="rounded px-2 py-0.5 text-[#71717a] transition hover:bg-white/[0.06] hover:text-[#f3f4f6]"
      >
        {paused ? "▶ resume" : "⏸ pause"}
      </button>

      <span className="text-[#27272a]">|</span>

      <div className="flex items-center gap-0.5">
        {[0.5, 1, 2].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChangeSpeed(s)}
            className={`rounded px-1.5 py-0.5 transition ${
              speed === s
                ? "bg-white/10 font-semibold text-[#38bdf8]"
                : "text-[#71717a] hover:text-[#f3f4f6]"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
