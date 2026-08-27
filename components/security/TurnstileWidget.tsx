"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void; "error-callback"?: () => void }) => string; remove: (widgetId: string) => void };
declare global { interface Window { turnstile?: TurnstileApi } }

export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!siteKey || !container.current) return;
    const render = () => { if (container.current && window.turnstile) window.turnstile.render(container.current, { sitekey: siteKey, callback: onToken, "expired-callback": () => onToken(""), "error-callback": () => onToken("") }); };
    if (window.turnstile) { render(); return; }
    const script = document.createElement("script"); script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; script.async = true; script.onload = render; document.head.appendChild(script);
    return () => { script.remove(); };
  }, [siteKey, onToken]);
  if (!siteKey) return <p className="text-xs text-[#8f8c96]">Bot protection is configured on the server.</p>;
  return <div ref={container} aria-label="Bot protection" />;
}
