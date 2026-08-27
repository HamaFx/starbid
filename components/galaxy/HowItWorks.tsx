"use client";

import { useState } from "react";

export function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="terminal-window rounded-xl p-4 font-mono text-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-[#71717a] transition hover:text-[#38bdf8]"
      >
        <span className="flex items-center gap-2">
          <span className="text-[#38bdf8]">$</span>
          <span>man starbid-physics(7)</span>
        </span>
        <span className="text-[10px] text-[#52525b]">{open ? "[--collapse]" : "[--expand]"}</span>
      </button>

      {open && (
        <div className="mt-4 grid gap-4 border-t border-white/[0.08] pt-4 text-[11px] leading-relaxed text-[#71717a] sm:grid-cols-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-[#f3f4f6]">1. LOGARITHMIC ORBIT</h3>
            <p>
              Distance from singularity follows <code className="text-[#fbbf24]">r = rMax / (1 + ln(1 + spend))</code>. Spend is cumulative; gravity never decays.
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-[#f3f4f6]">2. SINGULARITY HURDLE</h3>
            <p>
              Dethroning rank #1 requires surpassing the current leader by <strong>+15%</strong>. A 60-second anti-snipe lock is granted.
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-[#f3f4f6]">3. BEARER KEY ACCESS</h3>
            <p>
              Zero passwords or centralized cookies. Projects are controlled via cryptographic claim tokens delivered on confirmation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
