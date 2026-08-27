"use server";

import { listPendingModerationFlags, updateModerationFlag } from "@/lib/db/moderation";
import { createSupabaseAdminClient } from "@/lib/db/serverAdmin";
import { requireAdminToken } from "@/lib/admin/auth";

async function requireActionAdmin() {
  const { cookies } = await import("next/headers");
  requireAdminToken((await cookies()).get("gravitywell_admin")?.value);
}

export async function getModerationQueue() { await requireActionAdmin(); return listPendingModerationFlags(); }

export async function resolveModerationFlag(input: { id: string; status: "cleared" | "actioned" }) {
  await requireActionAdmin();
  if (!input.id) throw new Error("Moderation flag is required");
  await updateModerationFlag(input.id, input.status);
}

export async function banProject(projectId: string, flagId: string) {
  await requireActionAdmin();
  if (!projectId || !flagId) throw new Error("Project and flag are required");
  const client = createSupabaseAdminClient();
  const { error } = await client.from("projects").update({ is_banned: true }).eq("id", projectId);
  if (error) throw error;
  await client.from("stars").update({ status: "banned" }).eq("project_id", projectId);
  await updateModerationFlag(flagId, "actioned");
}

export async function revokeProjectToken(projectId: string, flagId: string) {
  await requireActionAdmin();
  const client = createSupabaseAdminClient();
  const { error } = await client.from("projects").update({ claim_token_hash: "revoked" }).eq("id", projectId);
  if (error) throw error;
  await updateModerationFlag(flagId, "actioned");
}
