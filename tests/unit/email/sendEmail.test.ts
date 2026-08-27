import { afterEach, describe, expect, it, vi } from "vitest";
import { sendPurchaseReceipt, sendRecoveryEmail } from "@/lib/email/sendEmail";

describe("transactional email", () => {
  afterEach(() => { vi.unstubAllGlobals(); delete process.env.RESEND_API_KEY; });
  it("escapes receipt content and sends through Resend", async () => {
    process.env.RESEND_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await sendPurchaseReceipt({ to: "a@test", projectName: "<unsafe>", starId: "star", amountCents: 300 });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.to).toBe("a@test");
    expect(body.html).toContain("&lt;unsafe&gt;");
  });
  it("sends recovery links", async () => {
    process.env.RESEND_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await sendRecoveryEmail({ to: "a@test", manageUrl: "https://example.com/manage?key=x" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
