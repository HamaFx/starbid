"use client";

import { useEffect, useState } from "react";

export type Lod = "full" | "reduced" | "list";

function initialLod(): Lod {
  if (typeof window === "undefined") return "reduced";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "list";
  if ((navigator.hardwareConcurrency || 4) <= 2) return "reduced";
  return "full";
}

export function useLOD(): Lod {
  const [lod, setLod] = useState<Lod>(initialLod);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      if (motionQuery.matches) setLod("list");
      else setLod((current) => (current === "list" ? "full" : current));
    };
    motionQuery.addEventListener("change", syncMotionPreference);

    if (lod === "list") {
      return () => motionQuery.removeEventListener("change", syncMotionPreference);
    }
    let frames = 0;
    const started = performance.now();
    let frameId = 0;

    const probe = (now: number) => {
      frames += 1;
      if (now - started >= 1000) {
        if (frames < 40) setLod("reduced");
        return;
      }
      frameId = requestAnimationFrame(probe);
    };

    frameId = requestAnimationFrame(probe);
    return () => {
      cancelAnimationFrame(frameId);
      motionQuery.removeEventListener("change", syncMotionPreference);
    };
  }, [lod]);

  return lod;
}
