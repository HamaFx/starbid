"use client";

import { useState, type FormEvent } from "react";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";

export function RecoveryForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(data.get("email") ?? ""), turnstileToken }),
      });
      if (!response.ok) throw new Error("Unable to process recovery");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process recovery");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div aria-live="polite" className="rounded border border-[#27c93f]/40 bg-[#27c93f]/10 p-3 font-mono text-xs text-[#27c93f]">
        [DISPATCHED] If a star exists for that email, a fresh bearer manage link has been sent.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 font-mono text-xs">
      <div>
        <label htmlFor="recovery-email" className="block text-[#71717a]">
          RECOVERY_EMAIL *
        </label>
        <input
          id="recovery-email"
          name="email"
          type="email"
          required
          placeholder="you@domain.com"
          className="mt-1 w-full rounded border border-white/[0.08] bg-[#07070b] px-3 py-2 text-xs text-[#f3f4f6] outline-none focus:border-[#38bdf8]"
        />
      </div>

      <TurnstileWidget onToken={setTurnstileToken} />
      {error && <p role="alert" className="text-xs text-[#ff5f56]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded border border-[#38bdf8]/50 bg-[#38bdf8]/15 py-2.5 text-xs font-bold text-[#38bdf8] transition hover:bg-[#38bdf8] hover:text-[#07070b] disabled:opacity-50"
      >
        {loading ? "dispatching..." : "> request bearer link"}
      </button>
    </form>
  );
}
