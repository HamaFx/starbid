import { describe, expect, it } from "vitest";
import { redactEvent, redactUrl } from "@/lib/analytics/redact";

describe("analytics redaction", () => {
  it("redacts bearer keys from URLs", () => { expect(redactUrl("https://example.com/manage?key=secret&utm=x")).toContain("key=%5BREDACTED%5D"); });
  it("redacts sensitive event fields", () => { expect(redactEvent({ key: "secret", url: "https://x.test/?token=abc" })).toEqual({ key: "[REDACTED]", url: "https://x.test/?token=%5BREDACTED%5D" }); });
});
