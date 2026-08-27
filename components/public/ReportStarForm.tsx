"use client";

import { useState } from "react";
import { reportStar } from "@/app/star/report/actions";

export function ReportStarForm({ projectId }: { projectId: string }) {
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState(false);
  if (done) return <p className="text-xs text-[#4ade80]">Report received. Thank you.</p>;
  return <form onSubmit={async (event) => { event.preventDefault(); setError(false); try { await reportStar({ projectId, reason }); setDone(true); } catch { setError(true); } }} className="mt-6 flex gap-2"><label htmlFor={`report-${projectId}`} className="sr-only">Report this star</label><input id={`report-${projectId}`} value={reason} onChange={(event) => setReason(event.target.value)} required maxLength={500} placeholder="Report this star" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0a0a14] px-3 py-2 text-xs" /><button type="submit" className="font-mono text-xs text-[#f43f5e]">Report</button>{error && <p role="alert" className="basis-full text-xs text-[#f43f5e]">Unable to submit report.</p>}</form>;
}
