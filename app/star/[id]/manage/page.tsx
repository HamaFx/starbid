import type { Metadata } from "next";
import { FuelForm } from "@/components/dashboard/FuelForm";
import { readManageKey } from "@/lib/identity/manageKey";
import { OwnerAnalytics } from "@/components/dashboard/OwnerAnalytics";
import { TerminalWindowBar } from "@/components/ui/TerminalWindowBar";
import { LegalLinks } from "@/app/legal-links";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ManageStarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const claimToken = readManageKey(new URLSearchParams(query as Record<string, string>).toString());

  return (
    <main className="min-h-screen bg-[#07070b] p-3 text-[#f3f4f6] sm:p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-[#71717a]">
          <Link href="/" className="hover:text-[#38bdf8] transition">
            &lt;- ~/galaxy
          </Link>
          <Link href={`/star/${encodeURIComponent(id)}`} className="hover:text-[#38bdf8] transition">
            inspect public -&gt;
          </Link>
        </div>

        <div className="terminal-window rounded-xl overflow-hidden font-mono">
          <TerminalWindowBar title={`starbid — manage --key=0x${id.slice(0, 6)} — zsh`} />

          <div className="p-4 sm:p-6 space-y-4">
            <div className="border-b border-white/[0.08] pb-3 text-xs">
              <span className="text-[10px] text-[#52525b]">AUTHENTICATED_BEARER_SESSION</span>
              <h1 className="text-xl font-bold text-[#f3f4f6] mt-0.5">Control Panel // {id}</h1>
            </div>

            <div className="rounded border border-white/[0.08] bg-[#07070b] p-4">
              <h2 className="text-xs font-semibold text-[#f3f4f6]">Add Fuel &amp; Migrate Inward</h2>
              <p className="text-[11px] text-[#71717a] mt-0.5 mb-3">Every boost permanently increases orbital gravity.</p>
              <FuelForm starId={id} claimToken={claimToken} />
            </div>

            <OwnerAnalytics starId={id} claimToken={claimToken} />
          </div>
        </div>

        <footer className="pt-4">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
