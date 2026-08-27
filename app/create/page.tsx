import { NewStarForm } from "@/components/create/NewStarForm";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-[#05050a] px-6 py-16 text-[#fff4e0]">
      <div className="mx-auto max-w-xl">
        <a href="/" className="font-mono text-sm text-[#4cc9f0]">← Back to galaxy</a>
        <h1 className="mt-10 text-4xl font-semibold tracking-tight">Create a star</h1>
        <p className="mt-4 leading-7 text-[#8f8c96]">Put your project in orbit. Opening bid: $3 minimum.</p>
        <div className="mt-8"><NewStarForm /></div>
      </div>
    </main>
  );
}
