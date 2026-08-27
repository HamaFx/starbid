"use client";

import { useState, type FormEvent } from "react";
import { startFuelCheckout } from "@/app/star/[id]/manage/actions";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

const FUEL_PRESETS = [5, 15, 50, 100];

export function FuelForm({ starId, claimToken }: { starId: string; claimToken: string }) {
  const [checkout, setCheckout] = useState<{ checkoutUrl: string; pendingBidId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [amountDollars, setAmountDollars] = useState(5);
  const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      setCheckout(
        await startFuelCheckout({
          starId,
          claimToken,
          amountCents: Math.round(amountDollars * 100),
        })
      );
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  }

  if (checkout) return <CheckoutFlow checkoutUrl={checkout.checkoutUrl} pendingBidId={checkout.pendingBidId} />;

  if (!paymentsEnabled) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#05050a] p-4 text-xs leading-relaxed text-[#8f8c96]">
        Payments are temporarily paused during onboarding. Fuel checkout will be active once store variables are configured.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="fuel-amount" className="block font-mono text-xs text-[#8f8c96]">
          Fuel Amount ($ USD, min $3)
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {FUEL_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmountDollars(preset)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs transition ${
                amountDollars === preset
                  ? "bg-[#4cc9f0] font-semibold text-[#05050a]"
                  : "border border-white/10 bg-[#05050a] text-[#8f8c96] hover:text-[#fff4e0]"
              }`}
            >
              +${preset}
            </button>
          ))}
        </div>
        <input
          id="fuel-amount"
          name="amount"
          type="number"
          min="3"
          step="1"
          value={amountDollars}
          onChange={(e) => setAmountDollars(Math.max(3, Number(e.target.value) || 3))}
          required
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#05050a] px-4 py-3 font-mono text-sm outline-none focus:border-[#4cc9f0]"
        />
      </div>

      {error && <p role="alert" className="text-xs text-[#f43f5e]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#4cc9f0] px-5 py-3 text-sm font-semibold text-[#05050a] transition hover:bg-[#3db8df] disabled:opacity-50"
      >
        {loading ? "Preparing checkout…" : `Pay $${amountDollars.toFixed(2)} & Boost Star →`}
      </button>
    </form>
  );
}
