import { MAX_BID_CENTS } from "@/lib/config/env";
import type { CheckoutParams } from "@/lib/payments/types";

const API_URL = "https://api.lemonsqueezy.com/v1/checkouts";

export async function createCheckoutUrl(params: CheckoutParams): Promise<string> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
  if (!apiKey || !storeId || !variantId) throw new Error("Lemon Squeezy configuration is missing");
  if (!Number.isSafeInteger(params.amountCents) || params.amountCents < 300 || params.amountCents > MAX_BID_CENTS) throw new Error("Invalid checkout amount");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/vnd.api+json", "Content-Type": "application/vnd.api+json" },
    body: JSON.stringify({ data: { type: "checkouts", attributes: { custom_price: params.amountCents, checkout_options: { embed: true }, checkout_data: { custom: { pending_bid_id: params.pendingBidId } }, product_options: { enabled_variants: [Number(variantId)], receipt_button_text: "Return to Gravity Well", receipt_link_url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000" } }, relationships: { store: { data: { type: "stores", id: String(storeId) } }, variant: { data: { type: "variants", id: String(variantId) } } } } }),
  });
  if (!response.ok) throw new Error(`Lemon Squeezy checkout failed (${response.status})`);
  const json = (await response.json()) as { data?: { attributes?: { url?: string; urls?: { checkout?: string } } } };
  const url = json.data?.attributes?.url ?? json.data?.attributes?.urls?.checkout;
  if (!url) throw new Error("Lemon Squeezy response did not contain a checkout URL");
  return url;
}
