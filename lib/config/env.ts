const requiredInfrastructure = ["NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "TURNSTILE_SECRET_KEY", "TURNSTILE_HOSTNAMES", "RESEND_API_KEY", "EMAIL_FROM", "ADMIN_ACCESS_TOKEN"] as const;
const paymentKeys = ["LEMONSQUEEZY_API_KEY", "LEMONSQUEEZY_STORE_ID", "LEMONSQUEEZY_VARIANT_ID", "LEMONSQUEEZY_WEBHOOK_SECRET"] as const;

export function validateEnvironment(): { valid: boolean; missing: string[]; optionalMissing: string[] } {
  const missing = process.env.NODE_ENV === "production" ? requiredInfrastructure.filter((key) => !process.env[key]) : [];
  const optionalMissing = process.env.NODE_ENV === "production" ? paymentKeys.filter((key) => !process.env[key]) : [];
  return { valid: missing.length === 0, missing, optionalMissing };
}

export function requireEnvironment(...keys: string[]): void {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}
