"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/db/browserClient";

type Summary = { total_clicks: number; total_bid_events: number; total_bid_cents: number; last_bid_at: string | null };
type Day = { day: string; clicks: number; bid_events: number; bid_cents: number };

export function OwnerAnalytics({ starId, claimToken }: { starId: string; claimToken: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<Day[]>([]);
  const [days, setDays] = useState(30);
  const [error, setError] = useState(false);
  async function load() {
    setError(false);
    const client = createSupabaseBrowserClient();
    const [current, timeline] = await Promise.all([
      client.rpc("get_star_analytics", { p_star_id: starId, p_claim_token: claimToken }),
      client.rpc("get_star_analytics_history", { p_star_id: starId, p_claim_token: claimToken, p_days: days }),
    ]);
    if (current.error || timeline.error || !current.data?.[0]) setError(true); else { setSummary(current.data[0]); setHistory(timeline.data ?? []); }
  }
  if (!summary) return <section className="mt-6 rounded-2xl border border-white/10 bg-[#0a0a14] p-5"><h2 className="text-lg">Owner analytics</h2><p className="mt-2 text-sm text-[#8f8c96]">Private performance data stays behind your claim key.</p><button type="button" onClick={() => void load()} className="mt-4 rounded-full border border-[#4cc9f0]/60 px-4 py-2 text-sm text-[#4cc9f0]">Load analytics</button>{error && <p role="alert" className="mt-3 text-xs text-[#f43f5e]">Unable to load analytics.</p>}</section>;
  return <section className="mt-6 rounded-2xl border border-white/10 bg-[#0a0a14] p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg">Owner analytics</h2><select value={days} onChange={(event) => { setDays(Number(event.target.value)); setSummary(null); }} className="rounded-lg border border-white/10 bg-[#05050a] px-2 py-1 text-xs"><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option></select></div><dl className="mt-4 grid grid-cols-3 gap-3 text-sm"><div><dt className="text-[#8f8c96]">Clicks</dt><dd className="mt-1 font-mono text-[#4cc9f0]">{summary.total_clicks}</dd></div><div><dt className="text-[#8f8c96]">Bid events</dt><dd className="mt-1 font-mono text-[#4cc9f0]">{summary.total_bid_events}</dd></div><div><dt className="text-[#8f8c96]">Days shown</dt><dd className="mt-1 font-mono text-[#4cc9f0]">{history.length}</dd></div></dl><div className="mt-4 max-h-48 overflow-auto text-xs">{history.map((day) => <div key={day.day} className="flex justify-between border-t border-white/10 py-2"><span className="text-[#8f8c96]">{day.day}</span><span>{day.clicks} clicks · {day.bid_events} bids</span></div>)}</div></section>;
}
