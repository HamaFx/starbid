import { createSupabaseAdminClient } from "@/lib/db/serverAdmin";

export async function listPendingModerationFlags() {
  const client = createSupabaseAdminClient();
  const { data, error } = await client.from("moderation_flags").select("id, project_id, reason, source, status, created_at").eq("status", "pending").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateModerationFlag(id: string, status: "cleared" | "actioned") {
  const client = createSupabaseAdminClient();
  const { error } = await client.from("moderation_flags").update({ status }).eq("id", id);
  if (error) throw error;
}
