import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db/serverAdmin";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });
  const expected = process.env.DEV_PAYMENT_TOKEN;
  if (!expected) return new NextResponse("Not found", { status: 404 });
  if (!expected || request.headers.get("x-dev-payment-token") !== expected) return new NextResponse("Unauthorized", { status: 401 });
  const body = (await request.json()) as { pendingBidId?: string; amountCents?: number };
  if (!body.pendingBidId || !Number.isSafeInteger(body.amountCents)) return new NextResponse("Invalid request", { status: 400 });
  const client = createSupabaseAdminClient();
  const { data, error } = await client.rpc("confirm_pending", { p_pending_id: body.pendingBidId, p_ls_order_id: `dev-${crypto.randomUUID()}`, p_amount_cents: body.amountCents });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
