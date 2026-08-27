"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "galaxy", prompt: "~/" },
    { href: "/leaderboard", label: "matrix", prompt: "$ " },
    { href: "/create", label: "spawn", prompt: "+ ", highlight: true },
    { href: "/dashboard", label: "keyring", prompt: "~/" },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/[0.08] bg-[#0c0c12]/95 px-3 py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] font-mono backdrop-blur-lg sm:hidden shadow-2xl"
    >
      {links.map(({ href, label, prompt, highlight }) => {
        const isActive = pathname === href;
        if (highlight) {
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1 rounded-lg border border-[#38bdf8]/60 bg-[#38bdf8]/15 px-3.5 py-1 text-xs font-bold text-[#38bdf8] shadow-sm shadow-[#38bdf8]/20 transition active:scale-95"
            >
              <span>{prompt}</span>
              <span>{label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition active:scale-95 ${
              isActive
                ? "bg-white/10 font-bold text-[#38bdf8]"
                : "text-[#71717a] hover:text-[#f3f4f6]"
            }`}
          >
            <span className="text-[10px] text-[#52525b]">{prompt}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
