"use client";

import { useState } from "react";

type Lod = "full" | "reduced" | "list";

export function useLOD(): Lod {
  const [lod] = useState<Lod>(() => {
    if (typeof window === "undefined") return "reduced";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowEnd = (navigator.hardwareConcurrency || 4) <= 2;
    return reduce ? "list" : lowEnd ? "reduced" : "full";
  });
  return lod;
}
