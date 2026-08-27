"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Galaxy", icon: "🌌" },
    { href: "/leaderboard", label: "Rankings", icon: "🏆" },
    { href: "/create", label: "Create", icon: "✦", highlight: true },
    { href: "/dashboard", label: "My Stars", icon: "⭐" },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-[#05050a]/90 px-2 py-2 backdrop-blur-md sm:hidden"
    >
      {links.map(({ href, label, icon, highlight }) => {
        const isActive = pathname === href;
        if (highlight) {
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 rounded-full bg-[#4cc9f0] px-3.5 py-1 text-[10px] font-bold text-[#05050a] shadow-lg shadow-[#4cc9f0]/20"
            >
              <span className="text-xs">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 py-1 font-mono text-[10px] transition ${
              isActive ? "text-[#4cc9f0] font-semibold" : "text-[#8f8c96] hover:text-[#fff4e0]"
            }`}
          >
            <span className="text-xs">{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
