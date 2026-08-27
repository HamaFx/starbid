"use client";

import { useEffect, useState } from "react";

type Lod = "full" | "reduced" | "list";

export function useLOD(): Lod {
  const [lod, setLod] = useState<Lod>("reduced");
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowEnd = (navigator.hardwareConcurrency || 4) <= 2;
    setLod(reduce ? "list" : lowEnd ? "reduced" : "full");
  }, []);
  return lod;
}
