import { describe, expect, it } from "vitest";
import { parseOrderPayload } from "@/lib/payments/parseOrderPayload";

describe("parseOrderPayload", () => {
  const base = { meta: { event_name: "order_created", custom_data: { pending_bid_id: "pending-1" } }, data: { id: "order-1", attributes: { total: 300 } } };
  it("extracts order-created data", () => { expect(parseOrderPayload(base)).toEqual({ eventName: "order_created", orderId: "order-1", pendingBidId: "pending-1", amountCents: 300 }); });
  it("preserves refund and dispute event names", () => { expect(parseOrderPayload({ ...base, meta: { ...base.meta, event_name: "order_refunded" } }).eventName).toBe("order_refunded"); expect(parseOrderPayload({ ...base, meta: { ...base.meta, event_name: "order_disputed" } }).eventName).toBe("order_disputed"); });
  it("rejects payloads without identifiers", () => { expect(() => parseOrderPayload({})).toThrow("missing required fields"); });
  it("rejects unsafe or negative amounts", () => { expect(() => parseOrderPayload({ ...base, data: { ...base.data, attributes: { total: -1 } } })).toThrow("amount is invalid"); });
});
