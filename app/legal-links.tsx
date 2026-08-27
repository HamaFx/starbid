import Link from "next/link";

export function LegalLinks() {
  return <nav aria-label="Legal" className="flex gap-4 font-mono text-xs text-[#8f8c96]"><Link href="/terms" className="hover:text-[#4cc9f0]">Terms</Link><Link href="/privacy" className="hover:text-[#4cc9f0]">Privacy</Link><Link href="/recover" className="hover:text-[#4cc9f0]">Recover link</Link></nav>;
}
