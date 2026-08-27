import { describe, expect, it } from "vitest";
import { buildManageUrl, readManageKey } from "@/lib/identity/manageKey";

describe("manage key helpers", () => {
  it("reads only the key query parameter", () => {
    expect(readManageKey("?key=abc123&utm_source=public")).toBe("abc123");
    expect(readManageKey("?token=wrong")).toBe("");
  });

  it("builds an encoded manage URL", () => {
    expect(buildManageUrl("https://example.com", "star/1", "a b")).toBe("https://example.com/star/star%2F1/manage?key=a%20b");
  });
});
