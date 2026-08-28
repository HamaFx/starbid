import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db/serverAdmin";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ starId: string }> }) {
  const { starId } = await params;
  const client = createSupabaseAdminClient();
  const { data: star, error } = await client.from("stars").select("id").eq("id", starId).eq("status", "active").maybeSingle();
  if (error || !star) return new NextResponse(null, { status: 204 });

  const visitor = request.headers.get("x-real-ip")?.split(",", 1)[0]?.trim() || "anonymous";
  const visitorHash = createHash("sha256")
    .update(`${process.env.CLICK_TRACKING_SALT ?? ""}:${visitor}`)
    .digest("hex");
  const { error: clickError } = await client.from("star_clicks").upsert(
    { star_id: starId, click_day: new Date().toISOString().slice(0, 10), visitor_hash: visitorHash },
    { onConflict: "star_id,click_day,visitor_hash", ignoreDuplicates: true },
  );
  if (clickError) console.error("Click tracking failed", { code: clickError.code });
  return new NextResponse(null, { status: 204 });
}
