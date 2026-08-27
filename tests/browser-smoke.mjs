import { spawn, execFileSync } from "node:child_process";

const baseUrl = process.env.BASE_URL;
const port = process.env.PORT ?? "3100";
const routes = ["/", "/create", "/recover", "/leaderboard", "/terms", "/privacy", "/admin/moderation"];
let server;

if (!baseUrl) {
  server = spawn("pnpm", ["start", "-p", port], { stdio: "ignore", detached: false });
  await waitForServer(`http://127.0.0.1:${port}`);
}

const target = baseUrl ?? `http://127.0.0.1:${port}`;
try {
  for (const route of routes) {
    const result = execFileSync("curl", ["-fsS", "-o", "/dev/null", "-w", "%{http_code}", `${target}${route}`], { encoding: "utf8" });
    if (result.trim() !== "200") throw new Error(`${route} returned ${result}`);
    console.log(`${route} ${result}`);
  }
} finally {
  if (server) server.kill("SIGTERM");
}

async function waitForServer(url) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not start at ${url}`);
}
