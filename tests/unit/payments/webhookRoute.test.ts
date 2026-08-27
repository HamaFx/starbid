import { describe, expect, it } from "vitest";
import { parseOrderPayload } from "@/lib/payments/parseOrderPayload";

describe("webhook fixtures", () => {
  it("parses an order fixture with custom pending metadata", () => {
    const fixture = { meta: { event_name: "order_created", custom_data: { pending_bid_id: "pending-fixture" } }, data: { id: "order-fixture", attributes: { total: 500, currency: "USD", status: "paid" } } };
    expect(parseOrderPayload(fixture).pendingBidId).toBe("pending-fixture");
  });

  it("parses provider dispute fixtures without changing their event name", () => {
    const fixture = { meta: { event_name: "order_refunded", custom_data: { pending_bid_id: "pending-fixture" } }, data: { id: "order-fixture", attributes: { total: 500 } } };
    expect(parseOrderPayload(fixture).eventName).toBe("order_refunded");
  });
});
