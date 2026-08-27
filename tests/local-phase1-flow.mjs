import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
const client = createClient(url, key);
const grant = await client.rpc("issue_action_grant", { p_kind: "new_star" });
if (grant.error) throw grant.error;
const token = "1".repeat(64);
const pending = await client.rpc("create_pending_new_star", { p_grant_id: grant.data, p_draft: { name: `PHASE1 ${Date.now()}`, email: "phase1@example.test", link_url: "https://example.com/phase1" }, p_claim_token_hash: token, p_amount_cents: 300 });
if (pending.error) throw pending.error;
const mismatch = await client.rpc("confirm_pending", { p_pending_id: pending.data, p_ls_order_id: `mismatch-${crypto.randomUUID()}`, p_amount_cents: 301 });
if (!mismatch.error) throw new Error("Amount mismatch was accepted");
const confirmed = await client.rpc("confirm_pending", { p_pending_id: pending.data, p_ls_order_id: `phase1-${crypto.randomUUID()}`, p_amount_cents: 300 });
if (confirmed.error) throw confirmed.error;
const starId = confirmed.data?.[0]?.star_id;
const fuel = await client.rpc("create_pending_fuel", { p_star_id: starId, p_claim_token: "unused", p_amount_cents: 300 });
if (!fuel.error) throw new Error("Invalid fuel token was accepted");
console.log(JSON.stringify({ spawnedStarId: starId, eventType: confirmed.data?.[0]?.event_type, mismatchRejected: Boolean(mismatch.error), invalidFuelRejected: Boolean(fuel.error) }));
