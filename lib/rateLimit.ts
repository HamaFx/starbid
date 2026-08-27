type RateLimitResult = { success: boolean; remaining: number };

const localHits = new Map<string, { count: number; expiresAt: number }>();

export async function enforceRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return localRateLimit(key, limit, windowMs);

  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([["INCR", key], ["PEXPIRE", key, windowMs]]),
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
  return { success: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}
