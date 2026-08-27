import type { Metadata } from "next";
import "./globals.css";
import { SkipLink } from "@/components/ui/SkipLink";
import { MobileNav } from "@/components/ui/MobileNav";

export const metadata: Metadata = {
  title: "StarBid — The Living Project Galaxy",
  description: "A living galaxy where projects compete for orbital position by cumulative gravity.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="pb-16 sm:pb-0">
        <SkipLink />
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
