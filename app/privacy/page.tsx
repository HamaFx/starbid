import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — StarBid",
  description: "Privacy and data protection policy for StarBid.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#05050a] px-6 py-16 text-[#fff4e0]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-mono text-sm text-[#4cc9f0]">← Back to galaxy</Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 font-mono text-xs text-[#8f8c96]">Last updated: August 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#8f8c96]">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#fff4e0]">1. Minimal Data Collection</h2>
            <p>
              StarBid is built on a privacy-first, zero-session architecture. We do not require account registration, passwords, or social OAuth profiles.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#fff4e0]">2. What We Collect</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Public Star Information</strong>: Project name, destination URL, logo URL, and optional X/Twitter handle.</li>
              <li><strong>Contact Email</strong>: Used solely for Lemon Squeezy payment receipts and user-initiated claim key recovery emails via Resend.</li>
              <li><strong>Outbound Clicks &amp; Analytics</strong>: Daily visitor counts use salted, one-way cryptographic SHA-256 IP hashes. No raw IP addresses or personal tracking profiles are stored.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#fff4e0]">3. Security of Claim Tokens</h2>
            <p>
              Secret claim keys are never stored in plaintext on our servers. We store only one-way cryptographic hashes (<code className="font-mono text-[#4cc9f0]">SHA-256</code>) in our database.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#fff4e0]">4. Third-Party Processors</h2>
            <p>
              Payments are handled by Lemon Squeezy (Merchant of Record). Bot verification is powered by Cloudflare Turnstile.
              We do not sell, rent, or monetize your personal data to any advertisers or third-party brokers.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
