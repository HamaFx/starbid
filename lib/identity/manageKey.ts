export function readManageKey(search: string): string {
  if (!search) return "";
  return new URLSearchParams(search).get("key") ?? "";
}

export function buildManageUrl(origin: string, starId: string, token: string): string {
  return `${origin}/star/${encodeURIComponent(starId)}/manage?key=${encodeURIComponent(token)}`;
}
