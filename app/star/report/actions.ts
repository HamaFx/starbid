"use server";

import { createSupabaseServerClient } from "@/lib/db/serverClient";

export async function reportStar(input: { projectId: string; reason: string }) {
  if (!input.projectId || input.reason.trim().length < 1) throw new Error("A report reason is required");
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("report_star", { p_project_id: input.projectId, p_reason: input.reason.trim() });
  if (error) throw error;
  return data;
}
