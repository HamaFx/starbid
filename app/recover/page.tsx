import { RecoveryForm } from "@/components/recover/RecoveryForm";
import { TerminalWindowBar } from "@/components/ui/TerminalWindowBar";
import { LegalLinks } from "@/app/legal-links";
import Link from "next/link";

export const metadata = {
  title: "Recover Bearer Key — StarBid",
  description: "Recover private claim tokens for your stars.",
};

export default function RecoverPage() {
  return (
    <main className="min-h-screen bg-[#07070b] p-3 text-[#f3f4f6] sm:p-6">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-[#71717a]">
          <Link href="/" className="hover:text-[#38bdf8] transition">
            &lt;- ~/galaxy
          </Link>
          <Link href="/create" className="hover:text-[#38bdf8] transition">
            + spawn star
          </Link>
        </div>

        <div className="terminal-window rounded-xl overflow-hidden font-mono">
          <TerminalWindowBar title="starbid — auth --recover — zsh" />
          <div className="p-4 sm:p-6 space-y-3">
            <div>
              <span className="text-[10px] text-[#52525b]">RECOVERY_DISPATCH</span>
              <h1 className="text-lg font-bold text-[#f3f4f6] mt-0.5">Recover Bearer Key</h1>
              <p className="text-[11px] text-[#71717a] mt-1">
                Enter your payment receipt email to receive your star management link.
              </p>
            </div>

            <RecoveryForm />
          </div>
        </div>

        <footer className="pt-4">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
