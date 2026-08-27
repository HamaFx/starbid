import { describe, expect, it } from "vitest";
import { generateClaimToken, hashClaimToken, isValidClaimToken } from "@/lib/identity/claimToken";

describe("claim tokens", () => {
  it("generates a valid 256-bit base64url token", () => { const token = generateClaimToken(); expect(isValidClaimToken(token)).toBe(true); expect(token).toHaveLength(43); });
  it("hashes the raw token to SHA-256", () => { expect(hashClaimToken("token")).toBe("3c469e9d6c5875d37a43f353d4f88e61fcf812c66eee3457465a40b0da4153e0"); });
  it("rejects malformed tokens", () => { expect(isValidClaimToken("")).toBe(false); expect(isValidClaimToken("short")).toBe(false); expect(isValidClaimToken("!".repeat(43))).toBe(false); });
});
