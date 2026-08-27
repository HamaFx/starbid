import type { Metadata } from "next";
import { LiveStarDetails } from "@/components/public/LiveStarDetails";
import { SectorRadar } from "@/components/public/SectorRadar";
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
    <main className="min-h-screen bg-[#05050a] px-4 py-8 text-[#fff4e0] sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link href="/" className="font-mono text-sm text-[#4cc9f0] hover:underline">
            ← Back to galaxy
          </Link>
          <Link
            href="/create"
            className="rounded-full border border-[#4cc9f0]/60 px-3 py-1 font-mono text-xs text-[#4cc9f0] hover:bg-[#4cc9f0] hover:text-[#05050a]"
          >
            + Create star
          </Link>
        </div>

        {star ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
            <LiveStarDetails star={star} stars={stars} />
            <SectorRadar star={star} stars={stars} />
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-white/10 bg-[#0a0a14] p-8 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8f8c96]">Star {id}</p>
            <h1 className="mt-3 text-2xl font-bold">Star Not Found</h1>
            <p className="mt-2 text-sm text-[#8f8c96]">This star is not currently available in the active public galaxy.</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-[#4cc9f0] px-5 py-2.5 text-xs font-semibold text-[#05050a]"
            >
              Return to Orbit →
            </Link>
          </div>
        )}

        <footer className="mt-14 border-t border-white/10 pt-5">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
