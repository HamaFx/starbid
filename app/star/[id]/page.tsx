import type { Metadata } from "next";
import { LiveStarDetails } from "@/components/public/LiveStarDetails";
import { SectorRadar } from "@/components/public/SectorRadar";
import { TerminalWindowBar } from "@/components/ui/TerminalWindowBar";
import { createSupabaseServerClient } from "@/lib/db/serverClient";
import { getPublicStar, listPublicStars } from "@/lib/db/stars";
import { demoStars } from "@/lib/demoStars";
import { LegalLinks } from "@/app/legal-links";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const star = await loadStar(id);
  return {
    title: star ? `${star.name} — StarBid` : "Star Orbit — StarBid",
    description: star
      ? `Live standing for ${star.name} in the StarBid Supermassive Gravity Well.`
      : "Live project placement in the StarBid Gravity Well.",
  };
}

async function loadStars() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return demoStars;
  try {
    const live = await listPublicStars(await createSupabaseServerClient());
    return live.length ? live : demoStars;
  } catch {
    return demoStars;
  }
}

async function loadStar(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return demoStars.find((s) => s.id === id) ?? null;
  }
  try {
    const live = await getPublicStar(await createSupabaseServerClient(), id);
    return live ?? demoStars.find((s) => s.id === id) ?? null;
  } catch {
    return demoStars.find((s) => s.id === id) ?? null;
  }
}

export default async function StarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const star = await loadStar(id);
  const stars = await loadStars();

  return (
    <main className="min-h-screen bg-[#07070b] p-2 pb-24 text-[#f3f4f6] sm:p-6 sm:pb-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-[#71717a]">
          <Link href="/" className="hover:text-[#38bdf8] transition">
            &lt;- ~/galaxy
          </Link>
          <Link href="/create" className="hover:text-[#38bdf8] transition">
            + spawn star
          </Link>
        </div>

        <div className="terminal-window rounded-xl overflow-hidden">
          <TerminalWindowBar title={`starbid — inspect --star=${id} — zsh`} />
          <div className="p-4 sm:p-6">
            {star ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
                <LiveStarDetails star={star} stars={stars} />
                <SectorRadar star={star} stars={stars} />
              </div>
            ) : (
              <div className="p-8 text-center font-mono text-xs text-[#71717a]">
                <p className="text-[#ff5f56]">[ERROR] STAR_NOT_FOUND: {id}</p>
                <Link href="/" className="mt-4 inline-block text-[#38bdf8] hover:underline">
                  &lt;- return to galaxy
                </Link>
              </div>
            )}
          </div>
        </div>

        <footer className="pt-4">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
