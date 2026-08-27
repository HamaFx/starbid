export function CreationSimulator() {
  const tiers = [
    { name: "CORE", range: "Rank #01", min: "$100+", desc: "Ivory corona, +15% dethrone hurdle" },
    { name: "PHOTON", range: "Ranks 2–3", min: "$50+", desc: "Amber halo, high orbital velocity" },
    { name: "INNER", range: "Ranks 4–8", min: "$25+", desc: "Thermal orange accretion corridor" },
    { name: "RIM", range: "Ranks 9+", min: "$3+", desc: "Baseline entrance trajectory" },
  ];

  return (
    <div className="terminal-window rounded-xl p-4 font-mono text-xs space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
        <span className="text-[#38bdf8]">$ cat physics.conf</span>
        <span className="text-[10px] text-[#52525b]">RO_MODE</span>
      </div>

      <div className="space-y-2">
        {tiers.map((t) => (
          <div key={t.name} className="flex items-start justify-between gap-2 border-b border-white/[0.04] pb-2 text-[11px]">
            <div>
              <span className="font-bold text-[#f3f4f6]">[{t.name}]</span>
              <span className="ml-1.5 text-[#52525b]">{t.range}</span>
              <p className="text-[10px] text-[#71717a] mt-0.5">{t.desc}</p>
            </div>
            <span className="text-[#fbbf24] font-semibold">{t.min}</span>
          </div>
        ))}
      </div>

      <div className="rounded border border-white/[0.06] bg-[#07070b] p-3 text-[10px] text-[#71717a] space-y-1">
        <p className="text-[#f3f4f6] font-semibold"># SYSTEM GUARANTEES</p>
        <p>• Zero passwords: controlled via bearer tokens.</p>
        <p>• Cumulative spend: gravity never decays.</p>
        <p>• Live redirect beacon with salted IP hash.</p>
      </div>
    </div>
  );
}
