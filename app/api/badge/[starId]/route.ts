import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/serverClient";
import { getPublicStar, listPublicStars } from "@/lib/db/stars";
import { demoStars } from "@/lib/demoStars";
import type { Star } from "@/lib/types";

function generateBadgeSvg(starName: string, rank: string, totalDollars: string): string {
  const label = "★ StarBid";
  const status = `${rank} · $${totalDollars}`;
  const labelWidth = 72;
  const statusWidth = Math.max(80, status.length * 7.8 + 14);
  const totalWidth = labelWidth + statusWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="24" viewBox="0 0 ${totalWidth} 24" role="img" aria-label="${starName}: ${status}">
  <clipPath id="r">
    <rect width="${totalWidth}" height="24" rx="4" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="24" fill="#0a0a14"/>
    <rect x="${labelWidth}" width="${statusWidth}" height="24" fill="#ffb627"/>
    <rect width="${totalWidth}" height="24" fill="url(#g)" fill-opacity="0.1"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="16" fill="#fff4e0" font-weight="600">${label}</text>
    <text x="${labelWidth + statusWidth / 2}" y="16" fill="#05050a" font-weight="700">${status}</text>
  </g>
</svg>`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ starId: string }> }) {
  const { starId } = await params;
  let star: Star | null = null;
  let rankStr = "Orbit";

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const client = await createSupabaseServerClient();
      star = await getPublicStar(client, starId);
      if (star) {
        const allStars = await listPublicStars(client);
        const sorted = allStars.filter((s) => s.status === "active").sort((a, b) => b.totalBidCents - a.totalBidCents);
        const rank = sorted.findIndex((s) => s.id === star?.id) + 1;
        if (rank > 0) rankStr = `#${rank}`;
      }
    }
  } catch {
    // fallback
  }

  if (!star) {
    star = demoStars.find((s) => s.id === starId) ?? null;
    if (star) {
      const sorted = [...demoStars].sort((a, b) => b.totalBidCents - a.totalBidCents);
      const rank = sorted.findIndex((s) => s.id === star?.id) + 1;
      if (rank > 0) rankStr = `#${rank}`;
    }
  }

  const name = star?.name ?? "Star";
  const dollars = star ? (star.totalBidCents / 100).toFixed(2) : "0.00";
  const svg = generateBadgeSvg(name, rankStr, dollars);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
