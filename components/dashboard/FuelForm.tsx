"use client";

import { useState, type FormEvent } from "react";
import { startFuelCheckout } from "@/app/star/[id]/manage/actions";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export function FuelForm({ starId, claimToken }: { starId: string; claimToken: string }) {
  const [checkout, setCheckout] = useState<{ checkoutUrl: string; pendingBidId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const amount = Number(new FormData(event.currentTarget).get("amount"));
    try {
      setCheckout(await startFuelCheckout({ starId, claimToken, amountCents: Math.round(amount * 100) }));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to start checkout");
    }
  }

  if (checkout) return <CheckoutFlow checkoutUrl={checkout.checkoutUrl} pendingBidId={checkout.pendingBidId} />;
  if (!paymentsEnabled) return <p className="rounded-xl border border-white/10 bg-[#0a0a14] p-4 text-sm leading-6 text-[#8f8c96]">Payments are currently disabled. Fuel will return when payment processing is available.</p>;
  return (
    <form onSubmit={submit} className="space-y-4">
      <label htmlFor="fuel-amount" className="sr-only">Additional amount in dollars</label><input id="fuel-amount" name="amount" type="number" min="3" step="0.01" defaultValue="3" required className="w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 font-mono outline-none focus:border-[#4cc9f0]" />
      {error && <p role="alert" className="text-sm text-[#f43f5e]">{error}</p>}
      <button className="rounded-full bg-[#4cc9f0] px-5 py-3 text-sm font-medium text-[#05050a]">Add fuel</button>
    </form>
  );
}
