import { MyStarsList } from "@/components/dashboard/MyStarsList";
import { LegalLinks } from "@/app/legal-links";
import Link from "next/link";

export const metadata = {
  title: "Dashboard — StarBid",
  description: "Manage your saved stars and claim tokens.",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#05050a] px-4 py-8 text-[#fff4e0] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-mono text-sm text-[#4cc9f0] hover:underline">
          ← Back to galaxy
        </Link>
        <div className="mt-8">
          <MyStarsList />
        </div>
        <footer className="mt-14 border-t border-white/10 pt-5">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
