"use client";

import Link from "next/link";

export function HowItWorks() {
  return (
    <section className="terminal-window rounded-xl p-5 sm:p-7 font-mono text-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8] font-bold text-sm">$</span>
          <h2 className="text-sm sm:text-base font-bold text-[#f3f4f6]">
            man starbid-physics(7) — Living Galaxy Protocol
          </h2>
        </div>
        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-[#38bdf8]">
          v2.0 // SINGULARITY
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: Logarithmic Orbits */}
        <div className="accretion-card rounded-lg border border-white/[0.08] bg-[#07070b] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#38bdf8]">
            <span className="text-base">🌌</span>
            <h3 className="font-bold text-xs">1. LOGARITHMIC ORBIT</h3>
          </div>
          <p className="text-[11px] leading-relaxed text-[#71717a]">
            Distance from the core follows <code className="text-[#fbbf24]">r = rMax / (1 + ln(1 + spend))</code>.
            Fuel spend is cumulative. Your project remains in orbit permanently without monthly subscription fees.
          </p>
        </div>

        {/* Card 2: Singularity Hurdle */}
        <div className="accretion-card rounded-lg border border-white/[0.08] bg-[#07070b] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#fbbf24]">
            <span className="text-base">👑</span>
            <h3 className="font-bold text-xs">2. SINGULARITY HURDLE</h3>
          </div>
          <p className="text-[11px] leading-relaxed text-[#71717a]">
            Dethroning the #1 Core star requires surpassing the current leader by <strong className="text-[#f3f4f6]">+15%</strong>.
            The new champion receives a <strong>60-second anti-snipe lock</strong> and live terminal marquee broadcast.
          </p>
        </div>

        {/* Card 3: Cryptographic Tokens */}
        <div className="accretion-card rounded-lg border border-white/[0.08] bg-[#07070b] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#27c93f]">
            <span className="text-base">🔑</span>
            <h3 className="font-bold text-xs">3. BEARER KEY ACCESS</h3>
          </div>
          <p className="text-[11px] leading-relaxed text-[#71717a]">
            Zero passwords or tracking cookies. Stars are managed via high-entropy cryptographic bearer claim tokens
            issued immediately upon payment confirmation.
          </p>
        </div>
      </div>

      {/* High-Converting Launch Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-[#38bdf8]/30 bg-[#38bdf8]/5 p-4">
        <div>
          <p className="font-bold text-[#f3f4f6] text-xs">Ready to claim your place in orbit?</p>
          <p className="text-[11px] text-[#71717a] mt-0.5">
            Opening bids start at $3. First 50 projects receive permanent <span className="text-[#fbbf24]">[FOUNDING STAR]</span> status.
          </p>
        </div>
        <Link
          href="/create"
          className="shrink-0 rounded-lg border border-[#38bdf8]/60 bg-[#38bdf8] px-4 py-2 font-bold text-[#05050a] shadow-md hover:bg-[#38bdf8]/90 transition"
        >
          + Spawn Star ($3+) ↗
        </Link>
      </div>
    </section>
  );
}
