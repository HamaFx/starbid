import { createSupabaseServerClient } from "@/lib/db/serverClient";
import { listPublicStars } from "@/lib/db/stars";
import Link from "next/link";

async function loadStars() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return [];
  try { return await listPublicStars(await createSupabaseServerClient()); } catch { return []; }
}

export default async function LeaderboardPage() {
  const stars = await loadStars();
  return <main className="min-h-screen bg-[#05050a] px-6 py-16 text-[#fff4e0]"><div className="mx-auto max-w-3xl"><Link href="/" className="font-mono text-sm text-[#4cc9f0]">← Back to galaxy</Link><h1 className="mt-10 text-4xl font-semibold">Leaderboard</h1><p className="mt-4 text-[#8f8c96]">Live rankings by lifetime cumulative gravity.</p><div className="mt-8 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-[#0a0a14] text-[#8f8c96]"><tr><th className="p-4">Rank</th><th className="p-4">Project</th><th className="p-4">Total</th></tr></thead><tbody>{stars.length ? stars.map((star, index) => <tr key={star.id} className="border-t border-white/10"><td className="p-4 font-mono">{index + 1}</td><td className="p-4">{star.name}{star.isDemo && <span className="ml-2 text-xs text-[#ffb627]">DEMO</span>}</td><td className="p-4 font-mono text-[#ffb627]">${(star.totalBidCents / 100).toFixed(2)}</td></tr>) : <tr><td colSpan={3} className="p-6 text-[#8f8c96]">No live data yet.</td></tr>}</tbody></table></div></div></main>;
}
