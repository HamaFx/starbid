const SECRET_QUERY_KEYS = new Set(["key", "token", "claim_token"]);

export function redactUrl(input: string): string {
  try {
    const url = new URL(input);
    for (const key of SECRET_QUERY_KEYS) if (url.searchParams.has(key)) url.searchParams.set(key, "[REDACTED]");
    return url.toString();
  } catch { return "[INVALID_URL]"; }
}

export function redactEvent<T extends Record<string, unknown>>(event: T): T {
  const copy: Record<string, unknown> = { ...event };
  for (const key of SECRET_QUERY_KEYS) if (key in copy) copy[key] = "[REDACTED]";
  if (typeof copy.url === "string") copy.url = redactUrl(copy.url);
  return copy as T;
}
