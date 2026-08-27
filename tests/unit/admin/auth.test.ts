import { describe, expect, it } from "vitest";
import { isAdminAuthorized } from "@/lib/admin/auth";

describe("admin authorization", () => {
  it("accepts only the configured exact token", () => {
    process.env.ADMIN_ACCESS_TOKEN = "secret-token";
    expect(isAdminAuthorized("secret-token")).toBe(true);
    expect(isAdminAuthorized("wrong-token")).toBe(false);
    expect(isAdminAuthorized(null)).toBe(false);
  });
});
