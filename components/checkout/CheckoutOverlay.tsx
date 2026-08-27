"use client";

import { useEffect, useState, type ReactNode } from "react";

type LemonEvent = { event?: string; data?: unknown };
type LemonApi = {
  Url: { Open: (url: string) => void };
  Setup?: (options: { eventHandler: (event: LemonEvent) => void }) => void;
};
declare global {
  interface Window {
    LemonSqueezy?: LemonApi;
  }
}

type CheckoutOverlayProps = {
  checkoutUrl?: string;
  children?: ReactNode;
  onOpen?: () => void;
  onSuccess?: () => void;
};

export function CheckoutOverlay({ checkoutUrl, children, onOpen, onSuccess }: CheckoutOverlayProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleReady = () => {
      window.LemonSqueezy?.Setup?.({
        eventHandler: (event) => {
          if (event.event === "Checkout.Success") onSuccess?.();
        },
      });
      setReady(true);
    };

    if (window.LemonSqueezy) {
      handleReady();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.lemonsqueezy.com/js/lemon.js";
    script.defer = true;
    script.onload = handleReady;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [onSuccess]);

  return (
    <button
      type="button"
      disabled={!checkoutUrl || !ready}
      onClick={() => {
        onOpen?.();
        if (checkoutUrl) window.LemonSqueezy?.Url.Open(checkoutUrl);
      }}
      className="w-full rounded-full bg-[#4cc9f0] px-6 py-3.5 text-sm font-semibold text-[#05050a] transition hover:bg-[#3db8df] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
    >
      {children ?? (ready ? "Proceed to Checkout →" : "Initializing secure checkout…")}
    </button>
  );
}
