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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  }

  if (checkout) return <CheckoutFlow checkoutUrl={checkout.checkoutUrl} pendingBidId={checkout.pendingBidId} />;

  if (!paymentsEnabled) {
    return (
      <div className="rounded border border-white/[0.08] bg-[#07070b] p-3 font-mono text-xs text-[#71717a]">
        [STATUS] PAYMENTS_OFFLINE: Fuel checkout is temporarily paused during onboarding.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 font-mono text-xs">
      <div>
        <label htmlFor="fuel-amount" className="block text-[#71717a]">
          BOOST_AMOUNT ($ USD, min $3)
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {FUEL_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmountDollars(preset)}
              className={`rounded px-2.5 py-1 text-xs transition ${
                amountDollars === preset
                  ? "bg-[#38bdf8] font-bold text-[#07070b]"
                  : "border border-white/[0.08] bg-[#07070b] text-[#71717a] hover:text-[#f3f4f6]"
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
          className="mt-2 w-full rounded border border-white/[0.08] bg-[#07070b] px-3 py-2 text-xs text-[#fbbf24] outline-none focus:border-[#38bdf8]"
        />
      </div>

      {error && <p role="alert" className="text-xs text-[#ff5f56]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded border border-[#38bdf8]/50 bg-[#38bdf8]/15 py-2.5 text-xs font-bold text-[#38bdf8] transition hover:bg-[#38bdf8] hover:text-[#07070b] disabled:opacity-50"
      >
        {loading ? "initiating checkout..." : `> boost gravity (+$${amountDollars.toFixed(2)})`}
      </button>
    </form>
  );
}
