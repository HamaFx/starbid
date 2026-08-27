import { NextResponse } from "next/server";
import { createSupabaseBrowserClient } from "@/lib/db/browserClient";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const starId = query.get("star_id");
  const claimToken = query.get("key");
  if (!starId || !claimToken || claimToken.length > 256) return NextResponse.json({ error: "star_id and key are required" }, { status: 400 });
  const ip = request.headers.get("x-real-ip") ?? "anonymous";
  const rate = await enforceRateLimit(`public-api:analytics:${ip}:${starId}`, 30, 60_000);
  if (!rate.success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  const { data, error } = await createSupabaseBrowserClient().rpc("get_star_analytics", { p_star_id: starId, p_claim_token: claimToken });
  if (error || !data?.[0]) return NextResponse.json({ error: "Analytics unavailable" }, { status: 403 });
  return NextResponse.json({ data: data[0] }, { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
}
