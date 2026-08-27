import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
const client = createClient(url, key);
const grant = await client.rpc("issue_action_grant", { p_kind: "new_star" });
if (grant.error) throw grant.error;
const pending = await client.rpc("create_pending_new_star", { p_grant_id: grant.data, p_draft: { name: `LOCAL ${Date.now()}`, email: "local-payment@example.test", link_url: "https://example.com/local" }, p_claim_token_hash: "e".repeat(64), p_amount_cents: 300 });
if (pending.error) throw pending.error;
const orderId = `local-${crypto.randomUUID()}`;
const confirmed = await client.rpc("confirm_pending", { p_pending_id: pending.data, p_ls_order_id: orderId, p_amount_cents: 300 });
if (confirmed.error) throw confirmed.error;
const repeated = await client.rpc("confirm_pending", { p_pending_id: pending.data, p_ls_order_id: orderId, p_amount_cents: 300 });
if (repeated.error) throw repeated.error;
console.log(JSON.stringify({ pendingBidId: pending.data, confirmation: confirmed.data, repeated: repeated.data }));
