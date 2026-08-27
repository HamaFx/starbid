export function CreationSimulator() {
  const tiers = [
    { name: "Singularity Core", color: "bg-[#fff4e0] text-[#05050a]", desc: "Rank #1 — Ivory corona, +15% dethrone hurdle" },
    { name: "Photon Ring", color: "bg-[#ffb627] text-[#05050a]", desc: "Ranks #2–3 — Amber glow, high orbital speed" },
    { name: "Inner Disk", color: "bg-[#ff6b35] text-[#05050a]", desc: "Ranks #4–8 — Thermal orange accretion band" },
    { name: "Mid Disk", color: "bg-[#8f8c96] text-[#05050a]", desc: "Ranks #9–15 — Dense traffic corridor" },
    { name: "Outer Rim", color: "bg-[#7a2e1d] text-[#fff4e0]", desc: "Ranks #16+ — Baseline orbit entry point" },
  ];

  return (
    <aside className="rounded-2xl border border-white/10 bg-[#0a0a14] p-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4cc9f0]">
        Accretion Physics
      </p>
      <h2 className="mt-1 text-xl font-bold text-[#fff4e0]">
        How Your Star Orbits
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-[#8f8c96]">
        Position and visibility in StarBid scale continuously with cumulative lifetime spend.
      </p>

      {/* Accretion Bands Legend */}
      <div className="mt-5 space-y-2.5">
        {tiers.map((tier) => (
          <div key={tier.name} className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-[#05050a] p-3 text-xs">
            <span className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-bold ${tier.color}`}>
              {tier.name}
            </span>
            <p className="text-[11px] leading-tight text-[#8f8c96]">
              {tier.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Key Architectural Notes */}
      <div className="mt-6 rounded-xl border border-white/10 bg-[#05050a] p-4 text-xs">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-[#ffb627]">
          ⚡ Creator Guarantees
        </h3>
        <ul className="mt-2 space-y-1.5 text-[11px] text-[#8f8c96]">
          <li>• <strong>No Accounts</strong>: Instant setup via cryptographic claim keys.</li>
          <li>• <strong>Permanent Spend</strong>: Add fuel anytime to migrate inward.</li>
          <li>• <strong>Direct Clicks</strong>: Track visitor referrals in real-time.</li>
        </ul>
      </div>
    </aside>
  );
}
