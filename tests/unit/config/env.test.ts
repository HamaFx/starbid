import { afterEach, describe, expect, it } from "vitest";
import { paymentsEnabled, requireEnvironment, validateEnvironment } from "@/lib/config/env";

describe("environment validation", () => {
  it("does not require production integrations in tests", () => { expect(validateEnvironment()).toEqual({ valid: true, missing: [], optionalMissing: [] }); });
  it("throws a concise missing-variable error", () => { delete process.env.TEST_REQUIRED_KEY; expect(() => requireEnvironment("TEST_REQUIRED_KEY")).toThrow("TEST_REQUIRED_KEY"); });
  it("only enables payments when the flag and provider configuration are complete", () => { const previous = { flag: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED, api: process.env.LEMONSQUEEZY_API_KEY, store: process.env.LEMONSQUEEZY_STORE_ID, variant: process.env.LEMONSQUEEZY_VARIANT_ID, secret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET }; process.env.NEXT_PUBLIC_PAYMENTS_ENABLED = "true"; process.env.LEMONSQUEEZY_API_KEY = "api"; process.env.LEMONSQUEEZY_STORE_ID = "store"; process.env.LEMONSQUEEZY_VARIANT_ID = "variant"; process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "secret"; expect(paymentsEnabled()).toBe(true); delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET; expect(paymentsEnabled()).toBe(false); for (const [key, value] of Object.entries({ NEXT_PUBLIC_PAYMENTS_ENABLED: previous.flag, LEMONSQUEEZY_API_KEY: previous.api, LEMONSQUEEZY_STORE_ID: previous.store, LEMONSQUEEZY_VARIANT_ID: previous.variant, LEMONSQUEEZY_WEBHOOK_SECRET: previous.secret })) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
});
