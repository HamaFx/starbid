import { MyStarsList } from "@/components/dashboard/MyStarsList";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#05050a] px-6 py-16 text-[#fff4e0]">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-mono text-sm text-[#4cc9f0]">← Back to galaxy</Link>
        <div className="mt-10"><MyStarsList /></div>
      </div>
    </main>
  );
}
