import type { Metadata } from "next";
import { LiveStarDetails } from "@/components/public/LiveStarDetails";
import { createSupabaseServerClient } from "@/lib/db/serverClient";
import { getPublicStar, listPublicStars } from "@/lib/db/stars";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const star = await loadStar(id);
  return { title: star ? `${star.name} — Gravity Well` : "Star — Gravity Well", description: "Live project placement in the Supermassive Gravity Well." };
}

async function loadStars() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return [];
  try { return await listPublicStars(await createSupabaseServerClient()); } catch { return []; }
}

async function loadStar(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  try { return await getPublicStar(await createSupabaseServerClient(), id); } catch { return null; }
}

export default async function StarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const star = await loadStar(id);
  const stars = star ? await loadStars() : [];
  return <main className="min-h-screen bg-[#05050a] px-6 py-16 text-[#fff4e0]"><div className="mx-auto max-w-2xl"><Link href="/" className="font-mono text-sm text-[#4cc9f0]">← Back to galaxy</Link>{star ? <LiveStarDetails star={star} stars={stars} /> : <><p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-[#8f8c96]">Star {id}</p><h1 className="mt-3 text-4xl font-semibold">Project standing</h1><p className="mt-4 text-[#8f8c96]">This star is not available in the active public galaxy.</p></>}</div></main>;
}
