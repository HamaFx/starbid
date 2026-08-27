import { RecoveryForm } from "@/components/recover/RecoveryForm";
import { LegalLinks } from "@/app/legal-links";
import Link from "next/link";

export const metadata = {
  title: "Recover Claim Link — StarBid",
  description: "Recover private claim tokens for your stars.",
};

export default function RecoverPage() {
  return (
    <main className="min-h-screen bg-[#05050a] px-4 py-8 text-[#fff4e0] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="font-mono text-sm text-[#4cc9f0] hover:underline">
          ← Back to galaxy
        </Link>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-[#4cc9f0]">
          Key Recovery
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Recover Claim Link
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#8f8c96]">
          Enter the email address provided during checkout. If a star exists for that email, a fresh manage link will be sent.
        </p>
        <div className="mt-8">
          <RecoveryForm />
        </div>
        <footer className="mt-14 border-t border-white/10 pt-5">
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
