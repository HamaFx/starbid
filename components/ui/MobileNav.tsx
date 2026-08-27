"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "galaxy", prompt: "~/" },
    { href: "/leaderboard", label: "top", prompt: "$ " },
    { href: "/create", label: "spawn", prompt: "+ ", highlight: true },
    { href: "/dashboard", label: "stars", prompt: "~/" },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/[0.08] bg-[#0c0c12]/95 px-2 py-2 font-mono backdrop-blur-md sm:hidden"
    >
      {links.map(({ href, label, prompt, highlight }) => {
        const isActive = pathname === href;
        if (highlight) {
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1 rounded border border-[#38bdf8]/50 bg-[#38bdf8]/10 px-3 py-1 text-[11px] font-bold text-[#38bdf8]"
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
            className={`flex items-center gap-0.5 py-1 text-[11px] transition ${
              isActive ? "text-[#38bdf8] font-semibold" : "text-[#71717a] hover:text-[#f3f4f6]"
            }`}
          >
            <span className="text-[#52525b] text-[9px]">{prompt}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
