import { GalaxyLiveView } from "@/components/galaxy/GalaxyLiveView";
import { LiveLeaderboardAside } from "@/components/galaxy/LiveLeaderboardAside";
import { AccretionStats } from "@/components/galaxy/AccretionStats";
import { Ticker } from "@/components/galaxy/Ticker";
import { HowItWorks } from "@/components/galaxy/HowItWorks";
import { LegalLinks } from "@/app/legal-links";
import { demoStars } from "@/lib/demoStars";
import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#05050a] px-4 py-6 text-[#fff4e0] sm:px-8">
      {/* Top App Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-white/10 pb-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#4cc9f0]">
            Supermassive / 001
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            StarBid
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden font-mono text-xs text-[#8f8c96] hover:text-[#fff4e0] sm:inline-block"
          >
            My Stars
          </Link>
          <Link
            href="/create"
            className="rounded-full border border-[#4cc9f0]/60 bg-[#4cc9f0]/10 px-4 py-2 text-xs font-semibold text-[#4cc9f0] transition hover:bg-[#4cc9f0] hover:text-[#05050a]"
          >
            + Create a star
          </Link>
        </div>
      </header>

      {/* Accretion Telemetry Grid */}
      <div className="mx-auto mt-6 max-w-6xl">
        <AccretionStats initialStars={demoStars} />
      </div>

      {/* Live Social Proof Ticker */}
      <div className="mx-auto mt-4 max-w-6xl">
        <Ticker initialStars={demoStars} />
      </div>

      {/* Main Galaxy Arena */}
      <section className="mx-auto grid max-w-6xl gap-6 py-6 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a14] shadow-2xl shadow-orange-950/20">
          <GalaxyLiveView initialStars={demoStars} />
        </div>
        <LiveLeaderboardAside initialStars={demoStars} />
      </section>

      {/* Collapsible Rules / How it Works */}
      <div className="mx-auto max-w-6xl pb-6">
        <HowItWorks />
      </div>

      <footer className="mx-auto max-w-6xl border-t border-white/10 pt-5">
        <LegalLinks />
      </footer>
    </main>
  );
}
