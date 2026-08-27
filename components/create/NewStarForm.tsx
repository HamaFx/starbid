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
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  }

  if (checkout) return <CheckoutFlow checkoutUrl={checkout.checkoutUrl} pendingBidId={checkout.pendingBidId} rawToken={checkout.rawToken} />;
  if (!paymentsConfigured && !devPayment) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0a0a14] p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-[#ffb627]">Payments Inactive</p>
        <p className="mt-2 text-sm leading-relaxed text-[#8f8c96]">
          Live fiat checkouts are temporarily paused while store onboarding is completed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Live Preview Card */}
      {projectName && (
        <div className="flex items-center justify-between rounded-xl border border-[#4cc9f0]/30 bg-[#05050a] p-3 text-xs">
          <span className="text-[#8f8c96]">Preview in Orbit:</span>
          <span className="font-medium text-[#fff4e0]">{projectName}</span>
          <span className="font-mono text-[#ffb627]">${bidDollars.toFixed(2)}</span>
        </div>
      )}

      <div>
        <label htmlFor="create-name" className="block font-mono text-xs text-[#8f8c96]">Project Name *</label>
        <input id="create-name" name="name" type="text" required maxLength={60} value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. NOVA LABS" className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 text-sm outline-none focus:border-[#4cc9f0]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="create-link_url" className="block font-mono text-xs text-[#8f8c96]">Destination URL *</label>
          <input id="create-link_url" name="link_url" type="url" required placeholder="https://yourproject.com" className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 text-sm outline-none focus:border-[#4cc9f0]" />
        </div>
        <div>
          <label htmlFor="create-x_handle" className="block font-mono text-xs text-[#8f8c96]">X / Twitter Handle (optional)</label>
          <input id="create-x_handle" name="x_handle" type="text" placeholder="@handle" className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 text-sm outline-none focus:border-[#4cc9f0]" />
        </div>
      </div>

      <div>
        <label htmlFor="create-email" className="block font-mono text-xs text-[#8f8c96]">Receipt &amp; Recovery Email *</label>
        <input id="create-email" name="email" type="email" required placeholder="you@example.com" className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 text-sm outline-none focus:border-[#4cc9f0]" />
        <p className="mt-1 text-[11px] text-[#8f8c96]">Used only for payment receipts and private claim link recovery.</p>
      </div>

      {/* Opening Bid Amount & Presets */}
      <div>
        <label htmlFor="create-amount" className="block font-mono text-xs text-[#8f8c96]">Opening Bid ($ USD, min $3) *</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {BID_PRESETS.map((amount) => (
            <button key={amount} type="button" onClick={() => setBidDollars(amount)} className={`rounded-lg px-3 py-1.5 font-mono text-xs transition ${bidDollars === amount ? "bg-[#4cc9f0] font-semibold text-[#05050a]" : "border border-white/10 bg-[#0a0a14] text-[#8f8c96] hover:text-[#fff4e0]"}`}>
              ${amount}
            </button>
          ))}
        </div>
        <input id="create-amount" name="amount" type="number" min="3" step="1" value={bidDollars} onChange={(e) => setBidDollars(Math.max(3, Number(e.target.value) || 3))} required className="mt-2 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 font-mono text-sm outline-none focus:border-[#4cc9f0]" />
      </div>

      {!devPayment && <TurnstileWidget onToken={setTurnstileToken} />}
      <p className="text-xs leading-relaxed text-[#8f8c96]">Payment is final and non-refundable. Your rank is calculated live upon confirmation.</p>
      {error && <p role="alert" className="text-sm text-[#f43f5e]">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-full bg-[#4cc9f0] px-5 py-3.5 text-sm font-semibold text-[#05050a] transition hover:bg-[#3db8df] disabled:opacity-50">
        {loading ? "Preparing checkout…" : `Pay $${bidDollars.toFixed(2)} & Launch Star →`}
      </button>
    </form>
  );
}
