import { NextResponse } from "next/server";
import { requestRecovery } from "@/app/recover/actions";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; turnstileToken?: string };
    await requestRecovery({
      email: body.email ?? "",
      turnstileToken: body.turnstileToken ?? "",
      clientIp: request.headers.get("x-real-ip") ?? "unknown",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to process recovery" }, { status: 400 });
  }
}
