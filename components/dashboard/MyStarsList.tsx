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
    anchor.download = "starbid-keys.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="font-mono text-xs space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div>
          <span className="text-[10px] text-[#52525b]">LOCAL_KEYRING</span>
          <h2 className="text-sm font-bold text-[#f3f4f6]">Stored Bearer Tokens ({entries.length})</h2>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleExport}
            className="rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#71717a] hover:text-[#f3f4f6]"
          >
            export .txt
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="py-8 text-center text-[#71717a]">
          <p className="text-xs">[STATUS] ZERO_LOCAL_KEYS</p>
          <p className="text-[11px] text-[#52525b] mt-1">No bearer claim tokens stored in this browser session.</p>
          <Link
            href="/create"
            className="mt-3 inline-block rounded border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-3 py-1.5 text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#07070b] transition"
          >
            + spawn new star
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.map(({ starId, token }) => (
            <li
              key={starId}
              className="flex flex-col gap-2 rounded border border-white/[0.06] bg-[#07070b] p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="truncate">
                <span className="text-[10px] text-[#52525b]">PID:</span>
                <span className="ml-1.5 font-bold text-[#f3f4f6]">{starId}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(starId, token)}
                  className="rounded border border-white/[0.08] px-2.5 py-1 text-[10px] text-[#71717a] hover:text-[#f3f4f6]"
                >
                  {copiedId === starId ? "copied ✓" : "copy link"}
                </button>

                <Link
                  href={`/star/${encodeURIComponent(starId)}/manage?key=${encodeURIComponent(token)}`}
                  className="rounded border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-2.5 py-1 text-[10px] font-semibold text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#07070b] transition"
                >
                  manage →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
