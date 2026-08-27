import { NextResponse } from "next/server";
import { createSupabaseBrowserClient } from "@/lib/db/browserClient";
import { enforceRateLimit } from "@/lib/rateLimit";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "public, max-age=10, stale-while-revalidate=30" };

export function OPTIONS() { return new NextResponse(null, { status: 204, headers }); }

export async function GET(request: Request) {
  const ip = request.headers.get("x-real-ip") ?? "anonymous";
  const rate = await enforceRateLimit(`public-api:events:${ip}`, 60, 60_000);
  if (!rate.success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers });
  const limit = Number(new URL(request.url).searchParams.get("limit") ?? 50);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return NextResponse.json({ error: "limit must be between 1 and 100" }, { status: 400, headers });
  const { data, error } = await createSupabaseBrowserClient().rpc("list_public_bid_events", { p_limit: limit });
  if (error) return NextResponse.json({ error: "Public data unavailable" }, { status: 503, headers });
  return NextResponse.json({ data, remaining: rate.remaining }, { headers });
}
