import type { Metadata } from "next";
import { FuelForm } from "@/components/dashboard/FuelForm";
import { readManageKey } from "@/lib/identity/manageKey";
import { OwnerAnalytics } from "@/components/dashboard/OwnerAnalytics";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ManageStarPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ key?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const claimToken = readManageKey(new URLSearchParams(query as Record<string, string>).toString());
  return (
    <main className="min-h-screen bg-[#05050a] px-6 py-16 text-[#fff4e0]">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="font-mono text-sm text-[#4cc9f0]">← Back to galaxy</a>
        <p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-[#8f8c96]">Manage star {id}</p>
        <h1 className="mt-3 text-4xl font-semibold">Your star</h1>
        <p className="mt-4 text-[#8f8c96]">Fuel checkout requires the claim key in the manage URL. Keep it private.</p>
        <div className="mt-8"><FuelForm starId={id} claimToken={claimToken} /></div><OwnerAnalytics starId={id} claimToken={claimToken} />
      </div>
    </main>
  );
}
