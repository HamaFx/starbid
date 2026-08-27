import { describe, it, expect, beforeEach, vi } from "vitest";
import { enforceRateLimit } from "@/lib/rateLimit";

describe("Rate Limiting", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("allows requests under the rate limit in local memory mode", async () => {
    const key = `test-ip-${Math.random()}`;
    const res1 = await enforceRateLimit(key, 5, 10_000);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(4);

    const res2 = await enforceRateLimit(key, 5, 10_000);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(3);
  });

  it("blocks requests that exceed the limit", async () => {
    const key = `test-block-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      const res = await enforceRateLimit(key, 3, 10_000);
      expect(res.success).toBe(true);
    }
    const blocked = await enforceRateLimit(key, 3, 10_000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets limit after the window expires", async () => {
    const key = `test-expire-${Math.random()}`;
    const res1 = await enforceRateLimit(key, 1, 50);
    expect(res1.success).toBe(true);

    const blocked = await enforceRateLimit(key, 1, 50);
    expect(blocked.success).toBe(false);

    await new Promise((r) => setTimeout(r, 60));

    const afterExpire = await enforceRateLimit(key, 1, 50);
    expect(afterExpire.success).toBe(true);
  });
});
