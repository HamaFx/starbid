"use client";

import { useCallback, useEffect, useState } from "react";
import type { PendingStatus } from "@/lib/types";

type Poller = () => Promise<PendingStatus>;

export function useConfirmPolling(pendingBidId: string | null, poller: Poller | null, intervalMs = 1500, timeoutMs = 30000) {
  const [status, setStatus] = useState<PendingStatus | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => {
    setTimedOut(false);
    setRefreshTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    if (!pendingBidId || !poller) return;
    let cancelled = false;
    let timer: number | undefined;
    const startedAt = Date.now();
    const poll = async () => {
      try {
        const next = await poller();
        if (cancelled) return;
        setStatus(next);
        if (next.status === "confirmed" || next.status === "expired" || next.status === "failed") return;
      } catch {
        if (!cancelled) setStatus(null);
      }
      if (!cancelled && Date.now() - startedAt >= timeoutMs) setTimedOut(true);
      if (!cancelled && Date.now() - startedAt < timeoutMs) timer = window.setTimeout(() => void poll(), intervalMs);
    };
    void poll();
    return () => { cancelled = true; if (timer) window.clearTimeout(timer); };
  }, [pendingBidId, poller, intervalMs, timeoutMs, refreshTick]);

  return { status, timedOut, refresh };
}
