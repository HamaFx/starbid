import type { LemonSqueezyOrderPayload, ParsedOrder } from "@/lib/payments/types";

export function parseOrderPayload(payload: LemonSqueezyOrderPayload): ParsedOrder {
  const eventName = payload.meta?.event_name;
  const orderId = payload.data?.id;
  const pendingBidId = payload.meta?.custom_data?.pending_bid_id;
  const amountCents = payload.data?.attributes?.total ?? null;

  if (!eventName || !orderId || !pendingBidId) {
    throw new Error("Lemon Squeezy payload is missing required fields");
  }
  if (amountCents !== null && (!Number.isSafeInteger(amountCents) || amountCents < 0)) {
    throw new Error("Lemon Squeezy amount is invalid");
  }

  return { eventName, orderId, pendingBidId, amountCents };
}
