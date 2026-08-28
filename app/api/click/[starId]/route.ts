import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/serverClient";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ starId: string }> }) {
  const { starId } = await params;
  const client = await createSupabaseServerClient();
  const { data: star, error } = await client
    .from("stars")
    .select("d_link_url")
    .eq("id", starId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !star?.d_link_url) return new NextResponse("Star not found", { status: 404 });

  let destination: URL;
  try {
    destination = new URL(star.d_link_url);
  } catch {
    return new NextResponse("Invalid destination", { status: 400 });
  }
  if (!["http:", "https:"].includes(destination.protocol)) {
    return new NextResponse("Invalid destination", { status: 400 });
  }

  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
