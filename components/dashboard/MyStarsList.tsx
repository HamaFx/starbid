"use client";

import { useEffect, useState } from "react";
import { exportClaimTokens, readAllClaimTokens } from "@/components/dashboard/ClaimTokenStorage";

export function MyStarsList() {
  const [entries, setEntries] = useState<{ starId: string; token: string }[]>([]);

  useEffect(() => setEntries(readAllClaimTokens()), []);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0a0a14] p-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg">My stars</h1>
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([exportClaimTokens()], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "gravitywell-claim-links.txt";
            anchor.click();
            URL.revokeObjectURL(url);
          }}
          className="font-mono text-xs text-[#4cc9f0]"
        >
          Export links
        </button>
      </div>
      <p className="mt-4 text-sm text-[#8f8c96]">
        {entries.length ? `${entries.length} saved claim link${entries.length === 1 ? "" : "s"}.` : "No claim links saved on this device yet."}
      </p>
    </section>
  );
}
