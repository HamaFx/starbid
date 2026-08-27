import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";
import type { PendingStatus } from "@/lib/types";

export async function getPendingStatus(
  client: SupabaseClient<Database>,
  pendingBidId: string,
): Promise<PendingStatus> {
  const { data, error } = await client.rpc("get_pending_status", {
    p_pending_id: pendingBidId,
  });

  if (error) throw error;
  const result = data?.[0];
  if (!result) throw new Error("Pending bid status was not found");
  return result;
}

export async function confirmPending(
  client: SupabaseClient<Database>,
  pendingBidId: string,
  orderId: string,
) {
  const { data, error } = await client.rpc("confirm_pending", {
    p_pending_id: pendingBidId,
    p_ls_order_id: orderId,
  });

  if (error) throw error;
  return data?.[0] ?? null;
}
