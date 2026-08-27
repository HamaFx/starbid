"use server";

import { createSupabaseServerClient } from "@/lib/db/serverClient";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function reportStar(input: { projectId: string; reason: string }) {
  const reason = input.reason.trim();
  if (!input.projectId || reason.length < 1 || reason.length > 500) throw new Error("A valid report reason is required");
  const rate = await enforceRateLimit(`report:${input.projectId}`, 5, 60 * 60 * 1000);
  if (!rate.success) throw new Error("Too many reports for this star. Try again later.");
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("report_star", { p_project_id: input.projectId, p_reason: reason });
  if (error) throw error;
  return data;
}
