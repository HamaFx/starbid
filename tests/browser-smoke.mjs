import { execFileSync } from "node:child_process";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const routes = ["/", "/create", "/recover", "/leaderboard", "/terms", "/privacy", "/admin/moderation"];
for (const route of routes) {
  const result = execFileSync("curl", ["-sS", "-o", "/dev/null", "-w", "%{http_code}", `${baseUrl}${route}`], { encoding: "utf8" });
  if (result.trim() !== "200") throw new Error(`${route} returned ${result}`);
  console.log(`${route} ${result}`);
}
