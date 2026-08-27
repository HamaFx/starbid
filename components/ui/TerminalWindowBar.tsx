import Link from "next/link";

export function TerminalWindowBar({
  title = "starbid — ~/supermassive/orbit_001 — zsh",
  rightSlot,
}: {
  title?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="terminal-header flex h-10 items-center justify-between px-3.5 select-none font-mono text-xs">
      {/* macOS Traffic Lights + Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56] transition hover:brightness-125 shadow-xs shadow-[#ff5f56]/30" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e] transition hover:brightness-125 shadow-xs shadow-[#ffbd2e]/30" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f] transition hover:brightness-125 shadow-xs shadow-[#27c93f]/30" />
        </div>
        <Link
          href="/"
          className="ml-1.5 hidden text-[11px] font-bold tracking-wider text-[#f3f4f6] hover:text-[#38bdf8] sm:inline-block transition"
        >
          STARBID<span className="text-[#38bdf8]">.APP</span>
        </Link>
      </div>

      {/* Terminal Title */}
      <div className="truncate px-2 text-[11px] text-[#71717a] hidden md:block">
        {title}
      </div>

      {/* Right Navigation & Status Slot */}
      <div className="flex items-center gap-2 text-[11px]">
        {rightSlot ? (
          rightSlot
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/leaderboard" className="text-[#71717a] hover:text-[#f3f4f6] transition">
              top
            </Link>
            <Link
              href="/create"
              className="font-bold text-[#38bdf8] hover:underline transition"
            >
              + spawn
            </Link>
            <span className="flex items-center gap-1.5 text-[10px] text-[#27c93f]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f] animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
