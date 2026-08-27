"use server";

import { createCheckoutUrl } from "@/lib/payments/createCheckoutUrl";
import { createSupabaseServerClient } from "@/lib/db/serverClient";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function startFuelCheckout(input: { starId: string; claimToken: string; amountCents: number }) {
  if (process.env.NEXT_PUBLIC_PAYMENTS_ENABLED !== "true") throw new Error("Payments are currently disabled.");
  if (!input.claimToken) throw new Error("Claim token is required");
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents < 300) throw new Error("Minimum bid is $3.00");

  const rate = await enforceRateLimit(`fuel:${input.starId}`, 10, 60 * 60 * 1000);
  if (!rate.success) throw new Error("Too many fuel attempts. Try again later.");
  const client = await createSupabaseServerClient();
  const { data: pendingBidId, error } = await client.rpc("create_pending_fuel", {
    p_star_id: input.starId,
    p_claim_token: input.claimToken,
    p_amount_cents: input.amountCents,
  });
  if (error) throw error;
  return { checkoutUrl: await createCheckoutUrl({ amountCents: input.amountCents, pendingBidId }), pendingBidId };
}
