import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  if (!rawBody || !signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const actual = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}
