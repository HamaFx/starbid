import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db/serverAdmin";

export async function GET(request: Request, { params }: { params: Promise<{ starId: string }> }) {
  const { starId } = await params;
  const client = createSupabaseAdminClient();
  const { data: star, error } = await client.from("stars").select("d_link_url").eq("id", starId).eq("status", "active").maybeSingle();
  if (error || !star?.d_link_url) return new NextResponse("Star not found", { status: 404 });
  const destination = new URL(star.d_link_url);
  const visitor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "anonymous";
  const visitorHash = createHash("sha256").update(visitor).digest("hex");
  const { error: clickError } = await client.from("star_clicks").upsert({ star_id: starId, click_day: new Date().toISOString().slice(0, 10), visitor_hash: visitorHash }, { onConflict: "star_id,click_day,visitor_hash", ignoreDuplicates: true });
  if (clickError) console.error("Click tracking failed", { code: clickError.code });
  if (!["http:", "https:"].includes(destination.protocol)) return new NextResponse("Invalid destination", { status: 400 });
  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
