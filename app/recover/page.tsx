import { RecoveryForm } from "@/components/recover/RecoveryForm";

export default function RecoverPage() {
  return (
    <main className="min-h-screen bg-[#05050a] px-6 py-16 text-[#fff4e0]">
      <div className="mx-auto max-w-xl">
        <a href="/" className="font-mono text-sm text-[#4cc9f0]">← Back to galaxy</a>
        <h1 className="mt-10 text-4xl font-semibold">Recover a claim link</h1>
        <p className="mt-4 leading-7 text-[#8f8c96]">Enter the email used for a star. If that address has a star, a fresh manage link will be sent.</p>
        <div className="mt-8"><RecoveryForm /></div>
      </div>
    </main>
  );
}
