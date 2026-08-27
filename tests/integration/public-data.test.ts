import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(key && process.env.RUN_SUPABASE_INTEGRATION === "true");

describe("public data integration", () => {
  it.skipIf(!enabled)("returns seeded active stars through public_stars", async () => {
    const client = createClient<Database>(url, key!);
    const { data, error } = await client.from("public_stars").select("*");
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThanOrEqual(3);
    expect(data?.[0]).not.toHaveProperty("email");
    expect(data?.[0]).not.toHaveProperty("claim_token_hash");
  });
});
