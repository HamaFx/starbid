const PREFIX = "gravitywell:star:";

type ClaimEntry = { starId: string; token: string };

export function saveClaimToken(starId: string, token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${PREFIX}${starId}`, token);
}

export function readClaimToken(starId: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`${PREFIX}${starId}`);
}

export function readAllClaimTokens(): ClaimEntry[] {
  if (typeof window === "undefined") return [];
  return Object.keys(window.localStorage)
    .filter((key) => key.startsWith(PREFIX))
    .map((key) => ({ starId: key.slice(PREFIX.length), token: window.localStorage.getItem(key) ?? "" }))
    .filter((entry) => entry.token.length > 0);
}

export function exportClaimTokens(): string {
  return readAllClaimTokens().map(({ starId, token }) => `${starId}\t${token}`).join("\n");
}
