import { afterEach, describe, expect, it } from "vitest";
import { requireEnvironment, validateEnvironment } from "@/lib/config/env";

describe("environment validation", () => {
  it("does not require production integrations in tests", () => { expect(validateEnvironment()).toEqual({ valid: true, missing: [], optionalMissing: [] }); });
  it("throws a concise missing-variable error", () => { delete process.env.TEST_REQUIRED_KEY; expect(() => requireEnvironment("TEST_REQUIRED_KEY")).toThrow("TEST_REQUIRED_KEY"); });
});
