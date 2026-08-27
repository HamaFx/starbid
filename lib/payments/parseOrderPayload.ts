import { MAX_BID_CENTS } from "@/lib/config/env";
import type { LemonSqueezyOrderPayload, ParsedOrder } from "@/lib/payments/types";

export function parseOrderPayload(payload: LemonSqueezyOrderPayload): ParsedOrder {
  const eventName = payload.meta?.event_name;
  const orderId = payload.data?.id;
  const pendingBidId = payload.meta?.custom_data?.pending_bid_id;
  const amountCents = payload.data?.attributes?.total;
  const attributes = payload.data?.attributes;

  if (!eventName || !orderId || !pendingBidId) {
    throw new Error("Lemon Squeezy payload is missing required fields");
  }
  if (eventName === "order_created" && (amountCents === undefined || !Number.isSafeInteger(amountCents) || amountCents < 300 || amountCents > MAX_BID_CENTS)) {
    throw new Error("Lemon Squeezy amount is invalid");
  }
  if (eventName === "order_created" && attributes?.currency && attributes.currency !== "USD") {
    throw new Error("Lemon Squeezy currency is invalid");
  }

  return { eventName, orderId, pendingBidId, amountCents: amountCents ?? 0 };
}
