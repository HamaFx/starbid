"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckoutOverlay } from "@/components/checkout/CheckoutOverlay";
import { ConfirmingState } from "@/components/checkout/ConfirmingState";
import { useConfirmPolling } from "@/components/checkout/useConfirmPolling";
import { createSupabaseBrowserClient } from "@/lib/db/browserClient";
import { getPendingStatus } from "@/lib/db/pendingBids";
import { buildManageUrl } from "@/lib/identity/manageKey";
import { saveClaimToken } from "@/components/dashboard/ClaimTokenStorage";

type CheckoutFlowProps = {
  checkoutUrl: string | null;
  pendingBidId: string | null;
  rawToken?: string | null;
};

export function CheckoutFlow({ checkoutUrl, pendingBidId, rawToken }: CheckoutFlowProps) {
  const [opened, setOpened] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const poller = useCallback(
    async () => getPendingStatus(createSupabaseBrowserClient(), pendingBidId ?? ""),
    [pendingBidId]
  );
  const { status, timedOut, refresh } = useConfirmPolling(
    opened ? pendingBidId : null,
    pendingBidId ? poller : null
  );

  const failed = status?.status === "failed" || status?.status === "expired";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const manageUrl =
    status?.star_id && rawToken ? buildManageUrl(origin, status.star_id, rawToken) : "";

  useEffect(() => {
    if (status?.status === "confirmed" && status.star_id && rawToken) {
      saveClaimToken(status.star_id, rawToken);
    }
  }, [status, rawToken]);

  if (status?.status === "confirmed" && status.star_id && rawToken) {
    return (
      <section className="rounded-2xl border border-[#4ade80]/40 bg-[#0a0a14] p-6 shadow-2xl shadow-green-950/20" aria-live="polite">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#4ade80]">
          ✓ Payment Confirmed
        </span>
        <h2 className="mt-2 text-2xl font-bold text-[#fff4e0]">Your Star is in Orbit!</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#8f8c96]">
          Save this manage link now. It contains your private cryptographic key.
        </p>

        <div className="mt-4 break-all rounded-xl border border-white/10 bg-[#05050a] p-3.5 font-mono text-xs text-[#4cc9f0]">
          {manageUrl}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(manageUrl).then(() => setCopied(true));
              setTimeout(() => setCopied(false), 2500);
            }}
            className="rounded-full border border-[#4cc9f0]/60 px-4 py-2 text-xs font-mono text-[#4cc9f0] hover:bg-[#4cc9f0]/10"
          >
            {copied ? "Copied to Clipboard ✓" : "Copy Manage Link"}
          </button>
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="rounded-full bg-[#4cc9f0] px-4 py-2 text-xs font-semibold text-[#05050a]"
          >
            I Saved It ✓
          </button>
        </div>

        {saved && (
          <Link
            href={manageUrl}
            className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-[#4ade80] hover:underline"
          >
            <span>Open Star Control Panel</span>
            <span>→</span>
          </Link>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-[#8f8c96]">
        This payment is final and non-refundable. Your exact rank is determined at confirmation time.
      </p>
      <CheckoutOverlay
        checkoutUrl={checkoutUrl ?? undefined}
        onOpen={() => setOpened(true)}
        onSuccess={() => setOpened(true)}
      >
        Pay and Launch Orbit →
      </CheckoutOverlay>
      {opened && <ConfirmingState timedOut={timedOut} failed={failed} onRefresh={refresh} />}
    </div>
  );
}
