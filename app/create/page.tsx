import { TerminalWindowBar } from "@/components/ui/TerminalWindowBar";
import { NewStarForm } from "@/components/create/NewStarForm";
import { CreationSimulator } from "@/components/create/CreationSimulator";
import { LegalLinks } from "@/app/legal-links";
import Link from "next/link";

export const metadata = {
  title: "Spawn Star — StarBid",
  description: "Place your project into the live visual accretion disk.",
};

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-[#07070b] p-2 pb-24 text-[#f3f4f6] sm:p-6 sm:pb-6">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between font-mono text-xs text-[#71717a]">
          <Link href="/" className="hover:text-[#38bdf8] transition">
            &lt;- ~/galaxy
          </Link>
          <Link href="/leaderboard" className="hover:text-[#38bdf8] transition">
            top --gravity -&gt;
          </Link>
        </div>

        {/* macOS Terminal Window Frame */}
        <div className="terminal-window rounded-xl overflow-hidden">
          <TerminalWindowBar title="starbid — spawn --sector=001 — zsh" />

          <div className="p-4 sm:p-6 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
            <NewStarForm />
            <CreationSimulator />
          </div>
        </div>

        <footer className="pt-4">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
