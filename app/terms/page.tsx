import Link from "next/link";

export const metadata = {
  title: "Terms of Service — StarBid",
  description: "Terms and conditions for StarBid advertising placement.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#05050a] px-6 py-16 text-[#fff4e0]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-mono text-sm text-[#4cc9f0]">← Back to galaxy</Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="mt-2 font-mono text-xs text-[#8f8c96]">Last updated: August 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#8f8c96]">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#fff4e0]">1. Service Description</h2>
            <p>
              StarBid (&quot;Supermassive Gravity Well&quot;) is a real-time digital advertising auction and visual link placement service.
              Purchasing a placement (&quot;creating a star&quot; or &quot;adding fuel&quot;) gives your project visual representation in an interactive orbital galaxy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#fff4e0]">2. Direct Payment &amp; No Refunds Policy</h2>
            <p>
              All transactions are direct fiat purchases processed securely through Lemon Squeezy (Merchant of Record).
              Every payment is <strong>final, non-refundable, and non-creditable</strong>.
              StarBid does not maintain user wallets, stored credit balances, or prepaid balances.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#fff4e0]">3. Dynamic Ranking &amp; Singularity Boss Rule</h2>
            <p>
              Orbital rank is computed live based on lifetime cumulative spend (<code className="font-mono text-[#ffb627]">total_bid_cents</code>).
              Your exact rank is calculated at payment confirmation time and is not guaranteed if competing bids confirm simultaneously.
            </p>
            <p>
              To claim the #1 Singularity position, a challenger&apos;s resulting total must be at least <strong>15% higher</strong> than the current leader&apos;s total.
              Upon conquering the Singularity, a 60-second anti-snipe immunity window is granted.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#fff4e0]">4. Ownership &amp; Bearer Claim Tokens</h2>
            <p>
              StarBid operates without user passwords or OAuth logins. Star management is authorized exclusively via unique cryptographic bearer claim tokens provided upon checkout completion.
              You are solely responsible for saving and maintaining the secrecy of your manage URL.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#fff4e0]">5. Content Guidelines &amp; Moderation</h2>
            <p>
              We reserve the right to remove, ban, or delist any star linking to illegal material, malware, hate speech, phishing, or fraudulent schemes.
              Removed stars are not eligible for refunds.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
