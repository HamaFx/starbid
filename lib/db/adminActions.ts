import { createSupabaseAdminClient } from "@/lib/db/serverAdmin";
import type { PendingBidKind } from "@/lib/types";

export async function issueActionGrant(kind: "new_star" | "recover"): Promise<string> {
  const client = createSupabaseAdminClient();
  const { data, error } = await client.rpc("issue_action_grant", { p_kind: kind });
  if (error) throw error;
  return data;
}

export function isPendingBidKind(value: string): value is PendingBidKind {
  return value === "new_star" || value === "fuel";
}
