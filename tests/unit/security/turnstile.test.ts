import { describe, it, expect, beforeEach, vi } from "vitest";
import { verifyTurnstile } from "@/lib/turnstile";

describe("Turnstile Bot Verification", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  it("bypasses verification when STARBOARD_TESTING is enabled with placeholder token", async () => {
    process.env.STARBOARD_TESTING = "true";
    await expect(verifyTurnstile("phase-0-placeholder")).resolves.toBeUndefined();
  });

  it("throws error if secret or hostnames are missing", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.TURNSTILE_HOSTNAMES;
    process.env.STARBOARD_TESTING = "false";

    await expect(verifyTurnstile("some-token")).rejects.toThrow("Bot verification is required");
  });

  it("validates successful token response from Cloudflare API", async () => {
    process.env.TURNSTILE_SECRET_KEY = "dummy-secret";
    process.env.TURNSTILE_HOSTNAMES = "localhost,starboard.app";
    process.env.STARBOARD_TESTING = "false";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        action: "new_star",
        hostname: "localhost",
      }),
    } as Response);

    await expect(verifyTurnstile("valid-token", "127.0.0.1", "new_star")).resolves.toBeUndefined();
    expect(fetchSpy).toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("rejects token if action or hostname does not match allowed list", async () => {
    process.env.TURNSTILE_SECRET_KEY = "dummy-secret";
    process.env.TURNSTILE_HOSTNAMES = "starboard.app";
    process.env.STARBOARD_TESTING = "false";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        action: "new_star",
        hostname: "untrusted-evil.com",
      }),
    } as Response);

    await expect(verifyTurnstile("token", "1.2.3.4", "new_star")).rejects.toThrow("Bot verification failed");
    fetchSpy.mockRestore();
  });
});
