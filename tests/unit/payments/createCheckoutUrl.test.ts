import { afterEach, describe, expect, it, vi } from "vitest";
import { createCheckoutUrl } from "@/lib/payments/createCheckoutUrl";

describe("createCheckoutUrl", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it("sends custom cents, overlay mode, and pending metadata", async () => {
    process.env.LEMONSQUEEZY_API_KEY = "key";
    process.env.LEMONSQUEEZY_STORE_ID = "10";
    process.env.LEMONSQUEEZY_VARIANT_ID = "20";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { attributes: { url: "https://checkout.test" } } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(createCheckoutUrl({ amountCents: 300, pendingBidId: "pending" })).resolves.toBe("https://checkout.test");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.data.attributes.custom_price).toBe(300);
    expect(body.data.attributes.checkout_options.embed).toBe(true);
    expect(body.data.attributes.checkout_data.custom.pending_bid_id).toBe("pending");
  });

  it("rejects amounts below the product minimum", async () => {
    await expect(createCheckoutUrl({ amountCents: 299, pendingBidId: "pending" })).rejects.toThrow("Invalid checkout amount");
  });
});
