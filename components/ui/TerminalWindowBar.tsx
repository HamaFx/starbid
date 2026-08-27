import Link from "next/link";

export function TerminalWindowBar({
  title = "starbid — ~/supermassive/orbit_001 — zsh",
  rightSlot,
}: {
  title?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="terminal-header flex h-9 items-center justify-between px-3.5 select-none">
      {/* macOS Traffic Lights */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]/90 shadow-sm shadow-[#ff5f56]/20" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]/90 shadow-sm shadow-[#ffbd2e]/20" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]/90 shadow-sm shadow-[#27c93f]/20" />
        </div>
        <Link href="/" className="ml-2 hidden font-mono text-[11px] font-medium text-[#71717a] hover:text-[#f3f4f6] sm:inline-block">
          StarBid
        </Link>
      </div>

      {/* Terminal Title */}
      <div className="truncate px-2 font-mono text-[11px] text-[#71717a]">
        {title}
      </div>

      {/* Right Slot */}
      <div className="flex items-center gap-2 font-mono text-[11px]">
        {rightSlot ? (
          rightSlot
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] text-[#27c93f]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f] animate-pulse" />
            <span>ONLINE</span>
          </span>
        )}
      </div>
    </div>
  );
}
