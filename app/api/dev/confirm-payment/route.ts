import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db/serverAdmin";
import { MAX_BID_CENTS } from "@/lib/config/env";
import { timingSafeEqual } from "node:crypto";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });
  const expected = process.env.DEV_PAYMENT_TOKEN;
  if (!expected) return new NextResponse("Not found", { status: 404 });
  const actual = Buffer.from(request.headers.get("x-dev-payment-token") ?? "");
  const target = Buffer.from(expected);
  if (actual.length !== target.length || !timingSafeEqual(actual, target)) return new NextResponse("Unauthorized", { status: 401 });
  const body = (await request.json()) as { pendingBidId?: string; amountCents?: number };
  const amountCents = body.amountCents;
  if (!body.pendingBidId || typeof amountCents !== "number" || !Number.isSafeInteger(amountCents) || amountCents < 300 || amountCents > MAX_BID_CENTS) return new NextResponse("Invalid request", { status: 400 });
  const client = createSupabaseAdminClient();
  const { data, error } = await client.rpc("confirm_pending", { p_pending_id: body.pendingBidId, p_ls_order_id: `dev-${crypto.randomUUID()}`, p_amount_cents: amountCents });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
