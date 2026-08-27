import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhookSignature } from "@/lib/payments/verifyWebhookSignature";

describe("verifyWebhookSignature", () => {
  it("accepts a matching HMAC signature", () => { const body = '{"ok":true}'; const signature = createHmac("sha256", "secret").update(body).digest("hex"); expect(verifyWebhookSignature(body, signature, "secret")).toBe(true); });
  it("rejects altered bodies or secrets", () => { const signature = createHmac("sha256", "secret").update("body").digest("hex"); expect(verifyWebhookSignature("altered", signature, "secret")).toBe(false); expect(verifyWebhookSignature("body", signature, "wrong")).toBe(false); });
  it("rejects empty and malformed signatures", () => { expect(verifyWebhookSignature("body", "", "secret")).toBe(false); expect(verifyWebhookSignature("body", "not-hex", "secret")).toBe(false); });
});
