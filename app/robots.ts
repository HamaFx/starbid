import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return { rules: { userAgent: "*", allow: ["/", "/leaderboard", "/star/"], disallow: ["/star/*/manage", "/dashboard", "/recover", "/admin", "/api/"] }, sitemap: `${base}/sitemap.xml` };
}
