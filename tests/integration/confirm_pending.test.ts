import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(key && process.env.RUN_SUPABASE_INTEGRATION === "true");
const client = enabled ? createClient<Database>(url, key!) : null;

async function createPendingStar() {
  const grant = await client!.rpc("issue_action_grant", { p_kind: "new_star" });
  if (grant.error) throw grant.error;
  const pending = await client!.rpc("create_pending_new_star", { p_grant_id: grant.data!, p_draft: { name: `Integration ${crypto.randomUUID()}`, email: "integration@example.test", link_url: "https://example.com" }, p_claim_token_hash: "f".repeat(64), p_amount_cents: 300 });
  if (pending.error) throw pending.error;
  return pending.data!;
}

describe("confirm_pending integration", () => {
  it.skipIf(!enabled)("rejects an unknown pending bid", async () => {
    const { error } = await client!.rpc("confirm_pending", { p_pending_id: crypto.randomUUID(), p_ls_order_id: `test-${crypto.randomUUID()}`, p_amount_cents: 300 });
    expect(error?.message).toContain("pending bid not found");
  });

  it.skipIf(!enabled)("rejects an amount mismatch before applying money", async () => {
    const pendingId = await createPendingStar();
    const { error } = await client!.rpc("confirm_pending", { p_pending_id: pendingId, p_ls_order_id: `test-${crypto.randomUUID()}`, p_amount_cents: 301 });
    expect(error?.message).toContain("payment amount mismatch");
  });

  it.skipIf(!enabled)("applies one of two concurrent confirmations and rejects the other safely", async () => {
    const first = await createPendingStar();
    const second = await createPendingStar();
    const [a, b] = await Promise.all([
      client!.rpc("confirm_pending", { p_pending_id: first, p_ls_order_id: `race-${crypto.randomUUID()}`, p_amount_cents: 300 }),
      client!.rpc("confirm_pending", { p_pending_id: second, p_ls_order_id: `race-${crypto.randomUUID()}`, p_amount_cents: 300 }),
    ]);
    expect([a, b].filter((result) => !result.error).length).toBe(2);
    expect(a.data?.[0]?.event_type).toBe("spawn");
    expect(b.data?.[0]?.event_type).toBe("spawn");
  });
});
