import { NextResponse } from "next/server";
import { createSupabaseBrowserClient } from "@/lib/db/browserClient";
import { listPublicStars } from "@/lib/db/stars";
import { enforceRateLimit } from "@/lib/rateLimit";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "public, max-age=15, stale-while-revalidate=60" };

export function OPTIONS() { return new NextResponse(null, { status: 204, headers }); }

export async function GET(request: Request) {
  const ip = request.headers.get("x-real-ip") ?? "anonymous";
  const rate = await enforceRateLimit(`public-api:stars:${ip}`, 60, 60_000);
  if (!rate.success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers });
  try {
    const stars = await listPublicStars(createSupabaseBrowserClient());
    return NextResponse.json({ data: stars, remaining: rate.remaining }, { headers });
  } catch {
    return NextResponse.json({ error: "Public data unavailable" }, { status: 503, headers });
  }
}
