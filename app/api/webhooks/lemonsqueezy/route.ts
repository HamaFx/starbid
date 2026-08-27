import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db/serverAdmin";
import { parseOrderPayload } from "@/lib/payments/parseOrderPayload";
import { verifyWebhookSignature } from "@/lib/payments/verifyWebhookSignature";
import type { LemonSqueezyOrderPayload } from "@/lib/payments/types";
import { sendPurchaseReceipt } from "@/lib/email/sendEmail";
import { paymentsEnabled } from "@/lib/config/env";

export async function POST(request: Request) {
  if (!paymentsEnabled()) return NextResponse.json({ disabled: true }, { status: 503 });
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";
  if (!verifyWebhookSignature(rawBody, signature, secret)) return new NextResponse("bad signature", { status: 401 });

  try {
    const order = parseOrderPayload(JSON.parse(rawBody) as LemonSqueezyOrderPayload);
    const client = createSupabaseAdminClient();
    if (["order_refunded", "order_disputed"].includes(order.eventName)) {
      const { error } = await client.rpc("flag_project_chargeback", { p_order_id: order.orderId, p_reason: order.eventName });
      if (error) throw error;
      return NextResponse.json({ ok: true, flagged: true });
    }
    if (order.eventName !== "order_created") return NextResponse.json({ ignored: true });
    const { error } = await client.rpc("confirm_pending", { p_pending_id: order.pendingBidId, p_ls_order_id: order.orderId, p_amount_cents: order.amountCents });
    if (error) throw error;
    try {
      const { data: receipt, error: receiptError } = await client.rpc("get_project_email", { p_pending_id: order.pendingBidId });
      if (receiptError) throw receiptError;
      const details = receipt?.[0];
      if (details?.email && details.star_id) await sendPurchaseReceipt({ to: details.email, projectName: details.project_name, starId: details.star_id, amountCents: details.amount_cents });
    } catch (emailError) {
      console.error("Purchase receipt delivery failed", { pendingBidId: order.pendingBidId, error: emailError instanceof Error ? emailError.message : "unknown error" });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lemon Squeezy webhook processing failed", error);
    return new NextResponse("invalid webhook", { status: 400 });
  }
}
