import { NextResponse } from "next/server";
import { validateEnvironment } from "@/lib/config/env";

export const dynamic = "force-dynamic";

export function GET() {
  const environment = validateEnvironment();
  return NextResponse.json({ status: environment.valid ? "ok" : "degraded", environment: { valid: environment.valid, missing: environment.missing, optionalMissing: environment.optionalMissing } }, { status: environment.valid ? 200 : 503 });
}
