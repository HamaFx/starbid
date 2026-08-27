"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/db/browserClient";

type Summary = {
  total_clicks: number;
  total_bid_events: number;
  total_bid_cents: number;
  last_bid_at: string | null;
};
type Day = { day: string; clicks: number; bid_events: number; bid_cents: number };

export function OwnerAnalytics({ starId, claimToken }: { starId: string; claimToken: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<Day[]>([]);
  const [days, setDays] = useState(30);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const badgeMarkdown = `[![StarBid Orbit](${origin}/api/badge/${starId}.svg)](${origin}/star/${starId})`;

  async function load(targetDays = days) {
    setError(false);
    setLoading(true);
    try {
      const client = createSupabaseBrowserClient();
      const [current, timeline] = await Promise.all([
        client.rpc("get_star_analytics", { p_star_id: starId, p_claim_token: claimToken }),
        client.rpc("get_star_analytics_history", { p_star_id: starId, p_claim_token: claimToken, p_days: targetDays }),
      ]);
      if (current.error || timeline.error || !current.data?.[0]) setError(true);
      else {
        setSummary(current.data[0]);
        setHistory(timeline.data ?? []);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const cpc = summary && summary.total_clicks > 0
    ? `$${((summary.total_bid_cents / summary.total_clicks) / 100).toFixed(2)}`
    : "—";

  const maxDailyClicks = Math.max(1, ...history.map((h) => h.clicks));

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-[#0a0a14] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#fff4e0]">Private Creator Analytics</h2>
          <p className="text-xs text-[#8f8c96]">Audited telemetry verified by your claim key.</p>
        </div>
        {summary && (
          <select
            value={days}
            disabled={loading}
            onChange={(e) => { const next = Number(e.target.value); setDays(next); void load(next); }}
            className="rounded-lg border border-white/10 bg-[#05050a] px-2.5 py-1 text-xs text-[#fff4e0]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        )}
      </div>

      {!summary ? (
        <div className="py-4 text-center">
          <p className="text-xs text-[#8f8c96]">Click-through metrics and fuel history are private.</p>
          <button type="button" disabled={loading} onClick={() => void load(days)} className="mt-3 rounded-full bg-[#4cc9f0] px-5 py-2 text-xs font-semibold text-[#05050a] hover:bg-[#3db8df] disabled:opacity-50">
            {loading ? "Decrypting telemetry…" : "Load Private Analytics →"}
          </button>
          {error && <p role="alert" className="mt-2 text-xs text-[#f43f5e]">Unable to load private telemetry.</p>}
        </div>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div className="rounded-xl border border-white/5 bg-[#05050a] p-3">
              <dt className="text-[#8f8c96]">Outbound Clicks</dt>
              <dd className="mt-1 font-mono text-base font-bold text-[#4cc9f0]">{summary.total_clicks}</dd>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#05050a] p-3">
              <dt className="text-[#8f8c96]">Effective CPC</dt>
              <dd className="mt-1 font-mono text-base font-bold text-[#ffb627]">{cpc}</dd>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#05050a] p-3">
              <dt className="text-[#8f8c96]">Total Gravity</dt>
              <dd className="mt-1 font-mono text-base font-bold text-[#fff4e0]">${(summary.total_bid_cents / 100).toFixed(2)}</dd>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#05050a] p-3">
              <dt className="text-[#8f8c96]">Fuel Events</dt>
              <dd className="mt-1 font-mono text-base font-bold text-[#4ade80]">{summary.total_bid_events}</dd>
            </div>
          </dl>

          {/* Activity Bar Sparklines */}
          {history.length > 0 && (
            <div className="mt-4 rounded-xl border border-white/5 bg-[#05050a] p-3">
              <span className="font-mono text-[10px] text-[#8f8c96]">Daily Outbound Traffic</span>
              <div className="mt-2 flex h-14 items-end gap-1">
                {history.slice(-14).map((d) => (
                  <div key={d.day} className="group relative flex-1">
                    <div className="w-full rounded-t bg-[#4cc9f0]/60 transition group-hover:bg-[#4cc9f0]" style={{ height: `${Math.max(4, (d.clicks / maxDailyClicks) * 100)}%` }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Embed Badge Snippet */}
          <div className="mt-4 rounded-xl border border-white/10 bg-[#05050a] p-3 text-xs">
            <span className="font-mono text-[10px] uppercase text-[#ffb627]">README / Website Embed Badge</span>
            <div className="mt-2 flex items-center justify-between gap-2">
              <code className="truncate font-mono text-[11px] text-[#8f8c96]">{badgeMarkdown}</code>
              <button type="button" onClick={() => { void navigator.clipboard?.writeText(badgeMarkdown).then(() => setCopiedBadge(true)); setTimeout(() => setCopiedBadge(false), 2000); }} className="shrink-0 rounded-lg border border-white/10 px-2 py-1 font-mono text-[11px] text-[#4cc9f0] hover:bg-white/5">
                {copiedBadge ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
