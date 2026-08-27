"use client";

import { useState, type FormEvent } from "react";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";

export function RecoveryForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    const data = new FormData(event.currentTarget);
    try { const response = await fetch("/api/recover", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: String(data.get("email") ?? ""), turnstileToken }) }); if (!response.ok) throw new Error("Unable to process recovery"); setSent(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to process recovery"); }
  }
  if (sent) return <p aria-live="polite" className="rounded-xl border border-[#4ade80]/30 bg-[#0a0a14] p-4 text-sm text-[#4ade80]">If that address has a star, you&apos;ll receive a fresh manage link.</p>;
  return <form onSubmit={submit} className="space-y-4"><label htmlFor="recovery-email" className="sr-only">Email address</label><input id="recovery-email" name="email" type="email" required placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 outline-none focus:border-[#4cc9f0]" /><TurnstileWidget onToken={setTurnstileToken} />{error && <p role="alert" className="text-sm text-[#f43f5e]">{error}</p>}<button type="submit" className="rounded-full bg-[#4cc9f0] px-5 py-3 text-sm font-medium text-[#05050a]">Send recovery link</button></form>;
}
