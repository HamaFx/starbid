import { NewStarForm } from "@/components/create/NewStarForm";
import { CreationSimulator } from "@/components/create/CreationSimulator";
import { LegalLinks } from "@/app/legal-links";
import Link from "next/link";

export const metadata = {
  title: "Create a Star — StarBid",
  description: "Put your project in orbit around the Singularity.",
};

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-[#05050a] px-4 py-8 text-[#fff4e0] sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link href="/" className="font-mono text-sm text-[#4cc9f0] hover:underline">
            ← Back to galaxy
          </Link>
          <Link
            href="/leaderboard"
            className="font-mono text-xs text-[#8f8c96] hover:text-[#fff4e0]"
          >
            View Leaderboard →
          </Link>
        </div>

        <div className="mt-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#4cc9f0]">
            Orbital Placement
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Create a Star
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#8f8c96]">
            Place your project into the live visual accretion disk. Opening bid: $3 minimum.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="rounded-2xl border border-white/10 bg-[#0a0a14] p-5 sm:p-7">
            <NewStarForm />
          </div>
          <CreationSimulator />
        </div>

        <footer className="mt-14 border-t border-white/10 pt-5">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
