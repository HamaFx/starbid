import { MyStarsList } from "@/components/dashboard/MyStarsList";
import { TerminalWindowBar } from "@/components/ui/TerminalWindowBar";
import { LegalLinks } from "@/app/legal-links";
import Link from "next/link";

export const metadata = {
  title: "Keyring & Stars — StarBid",
  description: "Manage your saved stars and claim tokens.",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#07070b] p-2 pb-24 text-[#f3f4f6] sm:p-6 sm:pb-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-[#71717a]">
          <Link href="/" className="hover:text-[#38bdf8] transition">
            &lt;- ~/galaxy
          </Link>
          <Link href="/create" className="hover:text-[#38bdf8] transition">
            + spawn star
          </Link>
        </div>

        <div className="terminal-window rounded-xl overflow-hidden font-mono">
          <TerminalWindowBar title="starbid — keyring --list — zsh" />
          <div className="p-4 sm:p-6">
            <MyStarsList />
          </div>
        </div>

        <footer className="pt-4">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
