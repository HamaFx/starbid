import { createSupabaseServerClient } from "@/lib/db/serverClient";
import { listPublicStars } from "@/lib/db/stars";
import { demoStars } from "@/lib/demoStars";
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
    <main className="min-h-screen bg-[#05050a] px-4 py-8 text-[#fff4e0] sm:px-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="font-mono text-sm text-[#4cc9f0] hover:underline">
            ← Back to galaxy
          </Link>
          <Link
            href="/create"
            className="rounded-full border border-[#4cc9f0]/60 px-4 py-1.5 text-xs text-[#4cc9f0] hover:bg-[#4cc9f0] hover:text-[#05050a]"
          >
            Create a star
          </Link>
        </div>

        <div className="mt-8 mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#4cc9f0]">
            Supermassive Rankings
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Live Leaderboard
          </h1>
          <p className="mt-2 text-sm text-[#8f8c96]">
            Positions are determined live by lifetime cumulative spend. The Singularity (#1) requires a +15% hurdle.
          </p>
        </div>

        <LeaderboardTable stars={stars} />

        <footer className="mt-12 border-t border-white/10 pt-5">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
