"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Route error", { digest: error.digest }); }, [error.digest]);
  return <main className="flex min-h-screen items-center justify-center bg-[#05050a] px-6 text-[#fff4e0]"><section className="max-w-md rounded-2xl border border-white/10 bg-[#0a0a14] p-8"><p className="font-mono text-xs uppercase tracking-[0.2em] text-[#f43f5e]">Gravity disturbance</p><h1 className="mt-3 text-2xl font-semibold">Something went wrong.</h1><p className="mt-3 text-sm leading-6 text-[#8f8c96]">The galaxy is still safe. Try the request again.</p><button type="button" onClick={reset} className="mt-6 rounded-full bg-[#4cc9f0] px-4 py-2 text-sm text-[#05050a]">Try again</button></section></main>;
}
