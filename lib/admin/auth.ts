import { timingSafeEqual } from "node:crypto";

export function isAdminAuthorized(requestToken: string | null | undefined): boolean {
  const expected = process.env.ADMIN_ACCESS_TOKEN;
  if (!expected || !requestToken) return false;
  const actualBuffer = Buffer.from(requestToken);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function requireAdminToken(requestToken: string | null | undefined): void {
  if (!isAdminAuthorized(requestToken)) throw new Error("Admin authorization required");
}
