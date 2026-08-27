"use server";

import { createSupabaseAdminClient } from "@/lib/db/serverAdmin";
import { issueActionGrant } from "@/lib/db/adminActions";
import { enforceRateLimit } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { generateClaimToken, hashClaimToken } from "@/lib/identity/claimToken";
import { sendRecoveryEmail } from "@/lib/email/sendEmail";
import { buildManageUrl } from "@/lib/identity/manageKey";

export async function requestRecovery(input: { email: string; turnstileToken: string }): Promise<void> {
  const email = input.email.trim().toLowerCase();
  await verifyTurnstile(input.turnstileToken);
  const rate = await enforceRateLimit(`recover:${email}`, 3, 60 * 60 * 1000);
  if (!rate.success) throw new Error("Too many recovery requests. Try again later.");
  await issueActionGrant("recover");

  const client = createSupabaseAdminClient();
  const { data: projects, error } = await client.rpc("find_recovery_projects", { p_email: email });
  if (error) throw error;
  for (const project of projects ?? []) {
    const token = generateClaimToken();
    const { error: updateError } = await client.from("projects").update({ claim_token_hash: hashClaimToken(token) }).eq("id", project.project_id);
    if (updateError) throw updateError;
    await sendRecoveryEmail({ to: email, manageUrl: buildManageUrl(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000", project.project_id, token) });
  }
}
