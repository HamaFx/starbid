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
  const { error } = await client.rpc("admin_ban_project", { p_project_id: projectId, p_flag_id: flagId });
  if (error) throw error;
}

export async function revokeProjectToken(projectId: string, flagId: string) {
  await requireActionAdmin();
  const client = createSupabaseAdminClient();
  const { error } = await client.rpc("admin_revoke_project_token", { p_project_id: projectId, p_flag_id: flagId });
  if (error) throw error;
}
