import { createSupabaseServerClient } from "@/lib/db/serverClient";
import { listPublicStars } from "@/lib/db/stars";
import { demoStars } from "@/lib/demoStars";
import { TerminalWindowBar } from "@/components/ui/TerminalWindowBar";
import { LeaderboardTable } from "@/components/public/LeaderboardTable";
import { LegalLinks } from "@/app/legal-links";
import Link from "next/link";

export const metadata = {
  title: "Leaderboard — StarBid",
  description: "Live orbital rankings by lifetime cumulative gravity spend.",
};

async function loadStars() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return demoStars;
  try {
    const live = await listPublicStars(await createSupabaseServerClient());
    return live.length ? live : demoStars;
  } catch {
    return demoStars;
  }
}

export default async function LeaderboardPage() {
  const stars = await loadStars();

  return (
    <main className="min-h-screen bg-[#07070b] p-2 pb-24 text-[#f3f4f6] sm:p-6 sm:pb-6">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between font-mono text-xs text-[#71717a]">
          <Link href="/" className="hover:text-[#38bdf8] transition">
            &lt;- ~/galaxy
          </Link>
          <Link href="/create" className="hover:text-[#38bdf8] transition">
            + spawn star
          </Link>
        </div>

        {/* macOS Terminal Window Frame */}
        <div className="terminal-window rounded-xl overflow-hidden">
          <TerminalWindowBar title="starbid — top -o gravity — zsh" />
          <div className="p-4 sm:p-6">
            <LeaderboardTable stars={stars} />
          </div>
        </div>

        <footer className="pt-4">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
