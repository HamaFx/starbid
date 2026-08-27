"use client";

export function CanvasControls({
  paused,
  onTogglePause,
  speed,
  onChangeSpeed,
}: {
  paused: boolean;
  onTogglePause: () => void;
  speed: number;
  onChangeSpeed: (nextSpeed: number) => void;
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-white/10 bg-[#05050a]/80 px-2.5 py-1.5 backdrop-blur-md">
      {/* Sector Badge */}
      <span className="hidden font-mono text-[10px] uppercase tracking-wider text-[#8f8c96] sm:inline-block">
        SECTOR: <strong className="text-[#4cc9f0]">001-ALPHA</strong>
      </span>

      <div className="hidden h-3 w-px bg-white/10 sm:block" />

      {/* Play / Pause Toggle */}
      <button
        type="button"
        onClick={onTogglePause}
        aria-label={paused ? "Resume orbit motion" : "Pause orbit motion"}
        className="flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] text-[#fff4e0] transition hover:bg-white/10"
      >
        <span>{paused ? "▶ Resume" : "⏸ Pause"}</span>
      </button>

      <div className="h-3 w-px bg-white/10" />

      {/* Speed Controls */}
      <div className="flex items-center gap-1 font-mono text-[10px]">
        {[0.5, 1, 2].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChangeSpeed(s)}
            className={`rounded px-1.5 py-0.5 transition ${
              speed === s
                ? "bg-[#4cc9f0] font-semibold text-[#05050a]"
                : "text-[#8f8c96] hover:text-[#fff4e0]"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
