"use client";

import { useState, type FormEvent } from "react";
import { startNewStarCheckout } from "@/app/create/actions";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import { useMemo } from "react";

export function NewStarForm() {
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<{ checkoutUrl: string; pendingBidId: string; rawToken: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const devPayment = useMemo(() => process.env.NODE_ENV !== "production" && Boolean(process.env.NEXT_PUBLIC_DEV_PAYMENT_MODE), []);
  const paymentsConfigured = useMemo(() => process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true", []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const result = await startNewStarCheckout({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        link_url: String(data.get("link_url") ?? ""),
        logo_url: String(data.get("logo_url") ?? "") || null,
        x_handle: String(data.get("x_handle") ?? "") || null,
        amountCents: Math.round(Number(data.get("amount")) * 100),
        turnstileToken,
      });
      setCheckout(result);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to start checkout");
    }
  }

  if (checkout) return <CheckoutFlow checkoutUrl={checkout.checkoutUrl} pendingBidId={checkout.pendingBidId} rawToken={checkout.rawToken} />;
  if (!paymentsConfigured && !devPayment) return <p className="rounded-xl border border-white/10 bg-[#0a0a14] p-4 text-sm leading-6 text-[#8f8c96]">Payments are currently disabled. Star creation will return when payment processing is available.</p>;

  return (
    <form onSubmit={submit} className="space-y-4">
      {[
        ["name", "Project name", "text"],
        ["link_url", "Project URL", "url"],
        ["logo_url", "Logo URL (optional)", "url"],
        ["x_handle", "X handle (optional)", "text"],
        ["email", "Receipt email", "email"],
      ].map(([name, placeholder, type]) => <input key={name} name={name} type={type} required={name !== "logo_url" && name !== "x_handle"} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 text-sm outline-none focus:border-[#4cc9f0]" />)}
      <input name="amount" type="number" min="3" step="0.01" defaultValue="3" required placeholder="Opening bid ($)" className="w-full rounded-xl border border-white/10 bg-[#0a0a14] px-4 py-3 font-mono text-sm outline-none focus:border-[#4cc9f0]" />
      {!devPayment && <TurnstileWidget onToken={setTurnstileToken} />}
      <p className="text-xs leading-5 text-[#8f8c96]">Payment is final and non-refundable. Your rank is determined at payment confirmation and is not guaranteed.</p>
      {error && <p role="alert" className="text-sm text-[#f43f5e]">{error}</p>}
      <button className="rounded-full bg-[#4cc9f0] px-5 py-3 text-sm font-medium text-[#05050a]">Continue to checkout</button>
    </form>
  );
}
