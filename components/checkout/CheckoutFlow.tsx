"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckoutOverlay } from "@/components/checkout/CheckoutOverlay";
import { ConfirmingState } from "@/components/checkout/ConfirmingState";
import { useConfirmPolling } from "@/components/checkout/useConfirmPolling";
import { createSupabaseBrowserClient } from "@/lib/db/browserClient";
import { getPendingStatus } from "@/lib/db/pendingBids";
import { buildManageUrl } from "@/lib/identity/manageKey";
import { saveClaimToken } from "@/components/dashboard/ClaimTokenStorage";

type CheckoutFlowProps = { checkoutUrl: string | null; pendingBidId: string | null; rawToken?: string | null };

export function CheckoutFlow({ checkoutUrl, pendingBidId, rawToken }: CheckoutFlowProps) {
  const [opened, setOpened] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const poller = useCallback(async () => getPendingStatus(createSupabaseBrowserClient(), pendingBidId ?? ""), [pendingBidId]);
  const { status, timedOut, refresh } = useConfirmPolling(opened ? pendingBidId : null, pendingBidId ? poller : null);
  const failed = status?.status === "failed" || status?.status === "expired";
  const manageUrl = useMemo(() => status?.star_id && rawToken ? buildManageUrl(window.location.origin, status.star_id, rawToken) : "", [status?.star_id, rawToken]);

  useEffect(() => {
    if (status?.status === "confirmed" && status.star_id && rawToken) saveClaimToken(status.star_id, rawToken);
  }, [status, rawToken]);

  if (status?.status === "confirmed" && status.star_id && rawToken) {
    return (
      <section className="rounded-2xl border border-[#4ade80]/40 bg-[#0a0a14] p-6" aria-live="polite">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4ade80]">Payment confirmed</p>
        <h2 className="mt-3 text-xl">Your star is live.</h2>
        <p className="mt-3 text-sm leading-6 text-[#8f8c96]">Save this manage link now. It is the bearer key to your star.</p>
        <div className="mt-4 break-all rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs text-[#4cc9f0]">{manageUrl}</div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => { void navigator.clipboard.writeText(manageUrl); setCopied(true); }} className="rounded-full border border-[#4cc9f0]/60 px-4 py-2 text-sm text-[#4cc9f0]">{copied ? "Copied" : "Copy manage link"}</button>
          <button type="button" onClick={() => setSaved(true)} className="rounded-full bg-[#4cc9f0] px-4 py-2 text-sm font-medium text-[#05050a]">I saved it</button>
        </div>
        {saved && <a href={manageUrl} className="mt-5 inline-block text-sm text-[#4ade80]">Open your manage page →</a>}
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-5 text-[#8f8c96]">This payment is final and non-refundable. It adds to your total bid. Your exact rank is determined at confirmation time and is not guaranteed if others are bidding simultaneously.</p>
      <CheckoutOverlay checkoutUrl={checkoutUrl ?? undefined} onOpen={() => setOpened(true)} onSuccess={() => setOpened(true)}>Pay and add fuel</CheckoutOverlay>
      {opened && <ConfirmingState timedOut={timedOut} failed={failed} onRefresh={refresh} />}
    </div>
  );
}
