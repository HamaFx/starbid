"use client";

import { useState } from "react";
import { banProject, resolveModerationFlag, revokeProjectToken } from "@/app/admin/moderation/actions";

export function ModerationActions({ flagId, projectId }: { flagId: string; projectId: string }) {
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<void>) { setBusy(true); try { await action(); window.location.reload(); } finally { setBusy(false); } }
  return <div className="mt-4 flex flex-wrap gap-2"><button disabled={busy} onClick={() => run(() => resolveModerationFlag({ id: flagId, status: "cleared" }))} className="rounded-full border border-[#4ade80]/50 px-3 py-1 text-xs text-[#4ade80]">Clear</button><button disabled={busy} onClick={() => run(() => banProject(projectId, flagId))} className="rounded-full border border-[#f43f5e]/50 px-3 py-1 text-xs text-[#f43f5e]">Ban star</button><button disabled={busy} onClick={() => run(() => revokeProjectToken(projectId, flagId))} className="rounded-full border border-[#ffb627]/50 px-3 py-1 text-xs text-[#ffb627]">Revoke key</button></div>;
}
