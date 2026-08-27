import { GalaxyLiveView } from "@/components/galaxy/GalaxyLiveView";
import type { Star } from "@/lib/types";
import { LegalLinks } from "@/app/legal-links";

const demoStars: Star[] = [
  {
    id: "demo-singularity",
    projectId: "demo-project-1",
    name: "NOVA LABS",
    logoUrl: null,
    linkUrl: "#",
    xHandle: "@novalabs",
    totalBidCents: 12500,
    angleSeed: 20,
    enteredAt: "2026-01-01T00:00:00.000Z",
    verified: true,
    isFounding: true,
    isDemo: true,
    status: "active",
  },
  {
    id: "demo-orbit-2",
    projectId: "demo-project-2",
    name: "KINETIC TYPE",
    logoUrl: null,
    linkUrl: "#",
    xHandle: "@kinetictype",
    totalBidCents: 4200,
    angleSeed: 160,
    enteredAt: "2026-01-02T00:00:00.000Z",
    verified: false,
    isFounding: false,
    isDemo: true,
    status: "active",
  },
  {
    id: "demo-orbit-3",
    projectId: "demo-project-3",
    name: "ORBITAL GOODS",
    logoUrl: null,
    linkUrl: "#",
    xHandle: null,
    totalBidCents: 900,
    angleSeed: 280,
    enteredAt: "2026-01-03T00:00:00.000Z",
    verified: false,
    isFounding: false,
    isDemo: true,
    status: "active",
  },
];

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#05050a] px-5 py-6 text-[#fff4e0] sm:px-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-white/10 pb-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#4cc9f0]">
            Supermassive / 001
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            StarBid
          </h1>
        </div>
        <a
          href="/create"
          className="rounded-full border border-[#4cc9f0]/60 px-4 py-2 text-sm text-[#4cc9f0] transition hover:bg-[#4cc9f0] hover:text-[#05050a]"
        >
          Create a star
        </a>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 py-10 lg:grid-cols-[1fr_280px] lg:items-center">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a14] shadow-2xl shadow-orange-950/20">
          <GalaxyLiveView initialStars={demoStars} />
        </div>
        <aside className="rounded-2xl border border-white/10 bg-[#0a0a14] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#8f8c96]">
            Live leaderboard
          </p>
          <ol className="mt-5 space-y-4">
            {demoStars.map((star, index) => (
              <li key={star.id} className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm text-[#8f8c96]">0{index + 1}</span>
                <span className="flex-1 truncate text-sm">{star.name}</span>
                <span className="font-mono text-xs text-[#ffb627]">
                  ${(star.totalBidCents / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-7 border-t border-white/10 pt-4 text-xs leading-5 text-[#8f8c96]">
            Demo orbit. DEMO stars are placeholders; position is determined by lifetime cumulative spend.
          </p>
        </aside>
      </section>
      <footer className="mx-auto max-w-6xl border-t border-white/10 pt-5"><LegalLinks /></footer>
    </main>
  );
}
