import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/badge/[starId]/route";

describe("Dynamic SVG Badge API", () => {
  it("renders SVG badge for demo star with SVG content type", async () => {
    const req = new Request("http://localhost:3000/api/badge/demo-1");
    const res = await GET(req, { params: Promise.resolve({ starId: "demo-1" }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    const svgText = await res.text();
    expect(svgText).toContain("<svg");
    expect(svgText).toContain("StarBid");
  });

  it("handles unknown star gracefully with fallback badge", async () => {
    const req = new Request("http://localhost:3000/api/badge/unknown-star-999");
    const res = await GET(req, { params: Promise.resolve({ starId: "unknown-star-999" }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    const svgText = await res.text();
    expect(svgText).toContain("<svg");
    expect(svgText).toContain("StarBid");
  });
});
