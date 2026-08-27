type TurnstileResponse = { success: boolean; action?: string; hostname?: string; "error-codes"?: string[] };

export async function verifyTurnstile(token: string, remoteip?: string, expectedAction = "new_star"): Promise<void> {
  if (process.env.STARBOARD_TESTING === "true" && token === "phase-0-placeholder") return;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const hostnames = new Set((process.env.TURNSTILE_HOSTNAMES ?? "").split(",").map((hostname) => hostname.trim()).filter(Boolean));
  if (!secret || !token || token.length > 2048 || !hostnames.size) throw new Error("Bot verification is required");
  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error("Bot verification service is unavailable");
  const result = (await response.json()) as TurnstileResponse;
  if (!result.success || result.action !== expectedAction || !result.hostname || !hostnames.has(result.hostname)) throw new Error("Bot verification failed");
}
