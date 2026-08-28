import { useEffect, useRef, type RefObject } from "react";
import { sound } from "@/components/galaxy/AudioFeedback";
import type { GalaxyEvent } from "@/lib/types";
import type { StarSprite } from "@/components/galaxy/StarSprite";

export function useGalaxyEvents(
  events: GalaxyEvent[],
  spritesRef: RefObject<Map<string, StarSprite>>,
  hostRef: RefObject<HTMLDivElement | null>,
  triggerShockwave: (x: number, y: number, type: "spawn" | "fuel" | "singularity_takeover" | "click") => void,
) {
  const lastEventRef = useRef<string | null>(null);
  useEffect(() => {
    const latest = events[0];
    if (!latest) return;
    const key = latest.eventId ?? `${latest.sequence ?? "time"}-${latest.starId}-${latest.eventType}-${latest.totalBidCents}-${latest.timestamp ?? ""}`;
    if (lastEventRef.current === key) return;
    lastEventRef.current = key;
    const sprite = spritesRef.current.get(latest.starId);
    const x = sprite?.container.position.x ?? (hostRef.current?.clientWidth ?? 1200) / 2;
    const y = sprite?.container.position.y ?? (hostRef.current?.clientHeight ?? 760) / 2;
    if (latest.eventType === "singularity_takeover") {
      sound.playTakeoverSupernova();
      triggerShockwave(x, y, latest.eventType);
    } else {
      sound.playSelect(0, latest.eventType === "spawn" ? 1 : 3);
      triggerShockwave(x, y, latest.eventType);
    }
  }, [events, hostRef, spritesRef, triggerShockwave]);
}
