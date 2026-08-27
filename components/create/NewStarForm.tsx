"use client";

import { useState, useMemo, type FormEvent } from "react";
import { startNewStarCheckout } from "@/app/create/actions";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";

const BID_PRESETS = [3, 10, 25, 50, 100];

export function NewStarForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkout, setCheckout] = useState<{ checkoutUrl: string; pendingBidId: string; rawToken: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [bidDollars, setBidDollars] = useState(3);
  const [projectName, setProjectName] = useState("");

  const devPayment = useMemo(() => process.env.NODE_ENV !== "production" && Boolean(process.env.NEXT_PUBLIC_DEV_PAYMENT_MODE), []);
  const paymentsConfigured = useMemo(() => process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true", []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const data = new FormData(event.currentTarget);
    try {
      const result = await startNewStarCheckout({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        link_url: String(data.get("link_url") ?? ""),
        logo_url: String(data.get("logo_url") ?? "") || null,
        x_handle: String(data.get("x_handle") ?? "") || null,
        amountCents: Math.round(bidDollars * 100),
        turnstileToken,
      });
      setCheckout(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  }

  if (checkout) return <CheckoutFlow checkoutUrl={checkout.checkoutUrl} pendingBidId={checkout.pendingBidId} rawToken={checkout.rawToken} />;
  if (!paymentsConfigured && !devPayment) {
    return (
      <div className="rounded border border-white/[0.08] bg-[#07070b] p-4 font-mono text-xs">
        <p className="text-[#fbbf24]">[STATUS] PAYMENTS_OFFLINE</p>
        <p className="mt-1 text-[#71717a]">Live checkouts are temporarily paused while store credentials are initialized.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 font-mono text-xs">
      {projectName && (
        <div className="flex items-center justify-between rounded border border-[#38bdf8]/40 bg-[#38bdf8]/5 p-2.5">
          <span className="text-[#71717a]">preview:</span>
          <span className="font-semibold text-[#f3f4f6]">{projectName}</span>
          <span className="text-[#fbbf24]">${bidDollars.toFixed(2)}</span>
        </div>
      )}

      <div>
        <label htmlFor="create-name" className="block text-[#71717a]">PROJECT_NAME *</label>
        <input id="create-name" name="name" type="text" required maxLength={60} value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. NOVA LABS" className="mt-1 w-full rounded border border-white/[0.08] bg-[#07070b] px-3 py-2 text-xs text-[#f3f4f6] outline-none focus:border-[#38bdf8]" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="create-link_url" className="block text-[#71717a]">TARGET_URL *</label>
          <input id="create-link_url" name="link_url" type="url" required placeholder="https://..." className="mt-1 w-full rounded border border-white/[0.08] bg-[#07070b] px-3 py-2 text-xs text-[#f3f4f6] outline-none focus:border-[#38bdf8]" />
        </div>
        <div>
          <label htmlFor="create-x_handle" className="block text-[#71717a]">X_HANDLE (optional)</label>
          <input id="create-x_handle" name="x_handle" type="text" placeholder="@handle" className="mt-1 w-full rounded border border-white/[0.08] bg-[#07070b] px-3 py-2 text-xs text-[#f3f4f6] outline-none focus:border-[#38bdf8]" />
        </div>
      </div>

      <div>
        <label htmlFor="create-email" className="block text-[#71717a]">RECOVERY_EMAIL *</label>
        <input id="create-email" name="email" type="email" required placeholder="you@domain.com" className="mt-1 w-full rounded border border-white/[0.08] bg-[#07070b] px-3 py-2 text-xs text-[#f3f4f6] outline-none focus:border-[#38bdf8]" />
      </div>

      <div>
        <label htmlFor="create-amount" className="block text-[#71717a]">OPENING_BID ($ USD, min $3) *</label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {BID_PRESETS.map((amt) => (
            <button key={amt} type="button" onClick={() => setBidDollars(amt)} className={`rounded px-2.5 py-1 text-xs transition ${bidDollars === amt ? "bg-[#38bdf8] font-bold text-[#07070b]" : "border border-white/[0.08] bg-[#07070b] text-[#71717a] hover:text-[#f3f4f6]"}`}>
              ${amt}
            </button>
          ))}
        </div>
        <input id="create-amount" name="amount" type="number" min="3" step="1" value={bidDollars} onChange={(e) => setBidDollars(Math.max(3, Number(e.target.value) || 3))} required className="mt-2 w-full rounded border border-white/[0.08] bg-[#07070b] px-3 py-2 text-xs text-[#fbbf24] outline-none focus:border-[#38bdf8]" />
      </div>

      {!devPayment && <TurnstileWidget onToken={setTurnstileToken} />}
      {error && <p role="alert" className="text-xs text-[#ff5f56]">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded border border-[#38bdf8]/50 bg-[#38bdf8]/15 py-2.5 text-xs font-bold text-[#38bdf8] transition hover:bg-[#38bdf8] hover:text-[#07070b] disabled:opacity-50">
        {loading ? "initiating checkout..." : `> execute payment ($${bidDollars.toFixed(2)})`}
      </button>
    </form>
  );
}
