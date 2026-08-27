"use client";

import { useState } from "react";
import Link from "next/link";
import { exportClaimTokens, readAllClaimTokens } from "@/components/dashboard/ClaimTokenStorage";
import { buildManageUrl } from "@/lib/identity/manageKey";

export function MyStarsList() {
  const [entries] = useState<{ starId: string; token: string }[]>(() => readAllClaimTokens());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (starId: string, token: string) => {
    if (typeof window === "undefined") return;
    const url = buildManageUrl(window.location.origin, starId, token);
    void navigator.clipboard?.writeText(url).then(() => {
      setCopiedId(starId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleExport = () => {
    const blob = new Blob([exportClaimTokens()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gravitywell-claim-links.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0a0a14] p-6">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-semibold">My Stars</h1>
          <p className="text-xs text-[#8f8c96]">Bearer claim tokens saved in this browser</p>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleExport}
            className="rounded-full border border-[#4cc9f0]/60 px-3 py-1.5 font-mono text-xs text-[#4cc9f0] transition hover:bg-[#4cc9f0] hover:text-[#05050a]"
          >
            Export all (.txt)
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-[#8f8c96]">No claim links saved on this device yet.</p>
          <Link
            href="/create"
            className="mt-4 inline-block rounded-full bg-[#4cc9f0] px-4 py-2 text-sm font-medium text-[#05050a]"
          >
            Create a star →
          </Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {entries.map(({ starId, token }) => (
            <li
              key={starId}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#05050a] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-xs text-[#8f8c96]">Star ID</p>
                <p className="font-mono text-sm font-medium text-[#fff4e0]">{starId}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(starId, token)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-[#8f8c96] hover:text-[#fff4e0]"
                >
                  {copiedId === starId ? "Copied ✓" : "Copy key link"}
                </button>

                <Link
                  href={`/star/${encodeURIComponent(starId)}/manage?key=${encodeURIComponent(token)}`}
                  className="rounded-lg bg-[#4cc9f0] px-3 py-1.5 font-mono text-xs font-medium text-[#05050a]"
                >
                  Manage & Fuel →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
