"use client";

import { useState } from "react";

export function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a14] p-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between font-mono text-xs uppercase tracking-wider text-[#4cc9f0] hover:underline"
      >
        <span>✦ Rules of the Gravity Well</span>
        <span>{open ? "▲ Hide" : "▼ How it works"}</span>
      </button>

      {open && (
        <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-[#8f8c96] sm:grid-cols-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-[#fff4e0]">1. Logarithmic Gravity</h3>
            <p>
              Distance from the Singularity scales with lifetime cumulative spend: <code className="font-mono text-[#ffb627]">r = rMax / (1 + ln(1 + spend))</code>.
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-[#fff4e0]">2. The Singularity Rule</h3>
            <p>
              To conquer rank #1, a challenger must surpass the leader by at least <strong>+15%</strong>. A 60-second anti-snipe immunity window is granted.
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-[#fff4e0]">3. Bearer Key Ownership</h3>
            <p>
              Zero passwords or sessions. Your star is managed exclusively through your private cryptographic manage link.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
