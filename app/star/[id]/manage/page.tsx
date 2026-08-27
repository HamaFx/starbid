import type { Metadata } from "next";
import { FuelForm } from "@/components/dashboard/FuelForm";
import { readManageKey } from "@/lib/identity/manageKey";
import { OwnerAnalytics } from "@/components/dashboard/OwnerAnalytics";
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
    <main className="min-h-screen bg-[#05050a] px-4 py-8 text-[#fff4e0] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link href="/" className="font-mono text-sm text-[#4cc9f0] hover:underline">
            ← Back to galaxy
          </Link>
          <Link
            href={`/star/${encodeURIComponent(id)}`}
            className="font-mono text-xs text-[#8f8c96] hover:text-[#fff4e0]"
          >
            Public View ↗
          </Link>
        </div>

        <div className="mt-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ffb627]">
            Private Management
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Star Control Panel
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#8f8c96]">
            Star ID: <code className="font-mono text-[#fff4e0]">{id}</code>. Keep this URL secret; it is the bearer key to your star.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#0a0a14] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[#fff4e0]">Add Fuel &amp; Boost Rank</h2>
          <p className="mt-1 text-xs text-[#8f8c96]">Every dollar added moves your star inward towards the Singularity.</p>
          <div className="mt-4">
            <FuelForm starId={id} claimToken={claimToken} />
          </div>
        </div>

        <div className="mt-6">
          <OwnerAnalytics starId={id} claimToken={claimToken} />
        </div>

        <footer className="mt-14 border-t border-white/10 pt-5">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
