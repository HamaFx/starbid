import type { Metadata } from "next";
import "./globals.css";
import { SkipLink } from "@/components/ui/SkipLink";
import { MobileNav } from "@/components/ui/MobileNav";

function getMetadataBase(): URL {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (!configured) return new URL("http://localhost:3000");
  try {
    const url = new URL(configured);
    return url.protocol === "http:" || url.protocol === "https:" ? url : new URL("http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  title: "StarBid — The Living Project Galaxy",
  description: "A living galaxy where projects compete for orbital position by cumulative gravity.",
  metadataBase: getMetadataBase(),
  openGraph: {
    title: "StarBid — The Living Project Galaxy",
    description: "A living galaxy where projects compete for orbital position by cumulative gravity.",
    url: "/",
    siteName: "StarBid",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StarBid — The Living Project Galaxy",
    description: "A living galaxy where projects compete for orbital position by cumulative gravity.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
