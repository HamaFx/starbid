"use server";

import { createCheckoutUrl } from "@/lib/payments/createCheckoutUrl";
import { createSupabaseServerClient } from "@/lib/db/serverClient";
import { issueActionGrant } from "@/lib/db/adminActions";
import { generateClaimToken, hashClaimToken } from "@/lib/identity/claimToken";
import { verifyTurnstile } from "@/lib/turnstile";
import { enforceRateLimit } from "@/lib/rateLimit";
import { MAX_BID_CENTS, paymentsEnabled } from "@/lib/config/env";
import type { ProjectDraft } from "@/lib/types";

export async function startNewStarCheckout(input: ProjectDraft & { turnstileToken: string; amountCents: number }) {
  if (!paymentsEnabled()) throw new Error("Payments are temporarily unavailable. Please try again later.");
  await verifyTurnstile(input.turnstileToken);
  const rate = await enforceRateLimit("new-star:server", 3, 60 * 60 * 1000);
  if (!rate.success) throw new Error("Too many star attempts. Try again later.");
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents < 300 || input.amountCents > MAX_BID_CENTS) throw new Error("Bid amount is outside the allowed range");

  const client = await createSupabaseServerClient();
  const rawToken = generateClaimToken();
  const grant = await issueActionGrant("new_star");
  const { data: pendingId, error } = await client.rpc("create_pending_new_star", {
    p_grant_id: grant,
    p_draft: input as unknown as Record<string, unknown>,
    p_claim_token_hash: hashClaimToken(rawToken),
    p_amount_cents: input.amountCents,
  });
  if (error) throw error;
  return { checkoutUrl: await createCheckoutUrl({ amountCents: input.amountCents, pendingBidId: pendingId }), pendingBidId: pendingId, rawToken };
}
