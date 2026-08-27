import { TerminalWindowBar } from "@/components/ui/TerminalWindowBar";
import { LegalLinks } from "@/app/legal-links";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — StarBid",
  description: "Privacy policy and cryptographic data retention rules for StarBid.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#07070b] p-3 text-[#f3f4f6] sm:p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-[#71717a]">
          <Link href="/" className="hover:text-[#38bdf8] transition">
            &lt;- ~/galaxy
          </Link>
        </div>

        <div className="terminal-window rounded-xl overflow-hidden font-mono">
          <TerminalWindowBar title="starbid — legal/privacy.md — zsh" />

          <div className="p-5 sm:p-7 space-y-5 text-xs text-[#71717a] leading-relaxed">
            <div>
              <span className="text-[10px] text-[#52525b]">PRIVACY_PROTOCOL_V1</span>
              <h1 className="text-xl font-bold text-[#f3f4f6] mt-0.5">Privacy Policy</h1>
            </div>

            <section className="space-y-1.5">
              <h2 className="text-[#f3f4f6] font-semibold">1. DATA MINIMIZATION</h2>
              <p>We do not use tracking cookies, tracking pixels, or third-party behavioral analytics on public pages.</p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-[#f3f4f6] font-semibold">2. CLICK TELEMETRY DEDUPLICATION</h2>
              <p>Outbound click tracking hashes visitor IP addresses using SHA-256 with a secret cryptographic salt that rotates daily. Raw IPs are never written to disk.</p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-[#f3f4f6] font-semibold">3. BEARER TOKEN INTEGRITY</h2>
              <p>Private claim tokens are hashed using SHA-256 before storage in Supabase. Only holders of the raw token can view private analytics or add fuel.</p>
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
