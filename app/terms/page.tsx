import { TerminalWindowBar } from "@/components/ui/TerminalWindowBar";
import { LegalLinks } from "@/app/legal-links";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service — StarBid",
  description: "Terms and conditions for StarBid advertising placement.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#07070b] p-3 text-[#f3f4f6] sm:p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-[#71717a]">
          <Link href="/" className="hover:text-[#38bdf8] transition">
            &lt;- ~/galaxy
          </Link>
        </div>

        <div className="terminal-window rounded-xl overflow-hidden font-mono">
          <TerminalWindowBar title="starbid — legal/terms.md — zsh" />

          <div className="p-5 sm:p-7 space-y-5 text-xs text-[#71717a] leading-relaxed">
            <div>
              <span className="text-[10px] text-[#52525b]">LEGAL_PROTOCOL_V1</span>
              <h1 className="text-xl font-bold text-[#f3f4f6] mt-0.5">Terms of Service</h1>
            </div>

            <section className="space-y-1.5">
              <h2 className="text-[#f3f4f6] font-semibold">1. SERVICE PROTOCOL</h2>
              <p>StarBid is a real-time digital advertising auction and visual link placement system. Bids permanently increase orbital position in the live visual accretion disk.</p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-[#f3f4f6] font-semibold">2. NO-REFUND POLICY</h2>
              <p>All transactions are direct fiat purchases via Lemon Squeezy (Merchant of Record). Payments are final and non-refundable once confirmed.</p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-[#f3f4f6] font-semibold">3. DYNAMIC RANKING &amp; SINGULARITY +15%</h2>
              <p>Rankings are computed live by lifetime cumulative spend. Dethroning #1 requires exceeding the leader by at least +15%.</p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-[#f3f4f6] font-semibold">4. BEARER CLAIM TOKENS</h2>
              <p>Stars are managed exclusively through unique cryptographic bearer tokens delivered upon payment confirmation. Store your manage URLs securely.</p>
            </section>
          </div>
        </div>

        <footer className="pt-4">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
