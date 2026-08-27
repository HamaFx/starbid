type RateLimitResult = { success: boolean; remaining: number };

const localHits = new Map<string, { count: number; expiresAt: number }>();
const MAX_LOCAL_ENTRIES = 10_000;

/** Prune expired entries to prevent unbounded memory growth */
function pruneExpired(): void {
  const now = Date.now();
  for (const [key, entry] of localHits) {
    if (entry.expiresAt <= now) localHits.delete(key);
  }
  // Safety valve: if still too large after pruning, clear entirely
  if (localHits.size > MAX_LOCAL_ENTRIES) localHits.clear();
}

export async function enforceRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return localRateLimit(key, limit, windowMs);

  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([["INCR", key], ["PEXPIRE", key, windowMs, "NX"]]),
    signal: AbortSignal.timeout(3_000),
  });
  if (!response.ok) throw new Error("Rate-limit service is unavailable");
  const result = (await response.json()) as Array<{ result?: number }>;
  const count = Number(result[0]?.result ?? limit + 1);
  return { success: count <= limit, remaining: Math.max(0, limit - count) };
}

function localRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = localHits.get(key);
  const entry = !current || current.expiresAt <= now ? { count: 0, expiresAt: now + windowMs } : current;
  entry.count += 1;
  localHits.set(key, entry);

  // Periodically prune to prevent memory leaks (every ~100 calls)
  if (localHits.size > 500 && Math.random() < 0.01) pruneExpired();

  return { success: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}
