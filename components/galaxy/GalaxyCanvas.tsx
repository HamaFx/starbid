"use client";

import { useEffect, useRef } from "react";
import { Application, Container, Graphics } from "pixi.js";
import { radius, size } from "@/lib/math/orbit";
import type { Star } from "@/lib/types";

const WIDTH = 900;
const HEIGHT = 620;
const MAX_FULL_EFFECT_STARS = 30;

function drawStar(star: Star, index: number, reduced: boolean): Graphics {
  const graphic = new Graphics();
  const totalDollars = star.totalBidCents / 100;
  const orbitRadius = radius(totalDollars, Math.min(WIDTH, HEIGHT) * 0.42);
  const angle = star.angleSeed * (Math.PI / 180) + index * 0.16;
  const x = WIDTH / 2 + Math.cos(angle) * orbitRadius;
  const y = HEIGHT / 2 + Math.sin(angle) * orbitRadius * 0.62;
  const starSize = size(totalDollars) / 3;

  graphic.circle(x, y, starSize);
  graphic.fill(star.verified ? 0xfff4e0 : 0xffb627);
  graphic.alpha = star.isDemo ? 0.45 : 1;
  if (!reduced && index < MAX_FULL_EFFECT_STARS) graphic.blendMode = "add";
  return graphic;
}

function drawCore(): Graphics {
  const core = new Graphics();
  core.circle(WIDTH / 2, HEIGHT / 2, 24);
  core.fill(0x020205);
  core.circle(WIDTH / 2, HEIGHT / 2, 31);
  core.stroke({ color: 0xfff4e0, alpha: 0.45, width: 3 });
  return core;
}

export function GalaxyCanvas({ stars }: { stars: Star[] }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const app = new Application();
    let mounted = true;

    void app.init({
      width: WIDTH,
      height: HEIGHT,
      background: 0x05050a,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio, 2),
      autoDensity: true,
    }).then(() => {
      if (!mounted) {
        app.destroy(true, { children: true });
        return;
      }

      host.appendChild(app.canvas);
      const scene = new Container();
      scene.addChild(drawCore());
      stars.forEach((star, index) => scene.addChild(drawStar(star, index, stars.length > 200)));
      app.stage.addChild(scene);
    });

    return () => {
      mounted = false;
      app.destroy(true, { children: true });
    };
  }, [stars]);

  return (
    <div ref={hostRef} aria-label="Interactive galaxy preview" role="img" />
  );
}
