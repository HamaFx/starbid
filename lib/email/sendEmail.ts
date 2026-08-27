import type { PurchaseReceipt, RecoveryEmail } from "@/lib/email/types";

export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { if (process.env.NODE_ENV === "production") throw new Error("Email configuration is missing"); return; }
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "Gravity Well <onboarding@resend.dev>", to, subject, html }) });
  if (!response.ok) throw new Error(`Email delivery failed (${response.status})`);
}

export async function sendPurchaseReceipt(receipt: PurchaseReceipt) {
  await sendEmail(receipt.to, "Your Gravity Well star is live", `<p>${escapeHtml(receipt.projectName)} is now live in the Gravity Well.</p><p>Amount: $${(receipt.amountCents / 100).toFixed(2)}</p><p>Public star: ${escapeHtml(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/star/${receipt.starId}`)}</p><p>Your manage link was shown after checkout. Use recovery if you lose it.</p>`);
}

export async function sendRecoveryEmail(email: RecoveryEmail) {
  await sendEmail(email.to, "Your Gravity Well recovery link", `<p>Your fresh manage link is ready:</p><p><a href="${escapeHtml(email.manageUrl)}">Open your manage page</a></p>`);
}

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character); }
