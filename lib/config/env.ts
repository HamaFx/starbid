const requiredInfrastructure = ["NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "TURNSTILE_SECRET_KEY", "TURNSTILE_HOSTNAMES", "RESEND_API_KEY", "EMAIL_FROM", "ADMIN_ACCESS_TOKEN"] as const;
const paymentKeys = ["LEMONSQUEEZY_API_KEY", "LEMONSQUEEZY_STORE_ID", "LEMONSQUEEZY_VARIANT_ID", "LEMONSQUEEZY_WEBHOOK_SECRET"] as const;

export const MAX_BID_CENTS = 10_000_000;

export function paymentsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true" && paymentKeys.every((key) => Boolean(process.env[key]));
}

export function validateEnvironment(): { valid: boolean; missing: string[]; optionalMissing: string[] } {
  const isProd = process.env.NODE_ENV === "production";
  const missing = isProd ? requiredInfrastructure.filter((key) => !process.env[key]) : [];
  const optionalMissing = isProd ? paymentKeys.filter((key) => !process.env[key]) : [];
  if (process.env.NODE_ENV === "development") {
    const devMissing = requiredInfrastructure.filter((key) => !process.env[key]);
    if (devMissing.length) {
      console.warn(`[StarBoard] Missing environment variables (non-fatal in dev): ${devMissing.join(", ")}`);
    }
  }
  return { valid: missing.length === 0, missing, optionalMissing };
}

export function requireEnvironment(...keys: string[]): void {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}
