import { Container, Graphics } from "pixi.js";
import { GALAXY_Y_SCALE } from "@/lib/math/galaxyLayout";

export function drawAccretionGuides(cx: number, cy: number, maxRadius: number): Container {
  const container = new Container();
  const guides = new Graphics();

  // Subtle coordinate grid crosshairs spanning the full supermassive universe
  guides
    .moveTo(cx - maxRadius * 1.05, cy)
    .lineTo(cx + maxRadius * 1.05, cy)
    .stroke({ color: 0x38bdf8, alpha: 0.05, width: 1.5 });

  guides
    .moveTo(cx, cy - maxRadius * 0.7)
    .lineTo(cx, cy + maxRadius * 0.7)
    .stroke({ color: 0x38bdf8, alpha: 0.05, width: 1.5 });

  // Concentric orbit boundary rings with the shared tilted projection.
  const rings = [
    { r: maxRadius * 0.95, color: 0xffffff, alpha: 0.04, width: 1.0 },
    { r: maxRadius * 0.78, color: 0xffffff, alpha: 0.05, width: 1.0 },
    { r: maxRadius * 0.58, color: 0xfbbf24, alpha: 0.07, width: 1.2 },
    { r: maxRadius * 0.38, color: 0x38bdf8, alpha: 0.12, width: 1.4 },
    { r: maxRadius * 0.20, color: 0x22d3ee, alpha: 0.20, width: 1.6 },
    { r: maxRadius * 0.10, color: 0x38bdf8, alpha: 0.35, width: 2.0 },
  ];

  rings.forEach((ring) => {
    guides.ellipse(cx, cy, ring.r, ring.r * GALAXY_Y_SCALE).stroke({
      color: ring.color,
      alpha: ring.alpha,
      width: ring.width,
    });
  });

  container.addChild(guides);
  return container;
}

export function drawSingularityCore(cx: number, cy: number): Container {
  const container = new Container();
  const core = new Graphics();

  // Supermassive Relativistic Ergosphere & Accretion Lens Glow Halo
  core.circle(cx, cy, 64).fill({ color: 0x38bdf8, alpha: 0.04 });
  core.circle(cx, cy, 48).stroke({ color: 0xfbbf24, alpha: 0.25, width: 1.5 });

  // Photon Sphere / Einstein Ring (Intense blue relativistic photon boundary)
  core.circle(cx, cy, 36).stroke({ color: 0x38bdf8, alpha: 0.95, width: 3.0 });
  core.circle(cx, cy, 36).fill({ color: 0x38bdf8, alpha: 0.08 });

  // Black Hole Event Horizon Shadow Core
  core.circle(cx, cy, 30).fill({ color: 0x050508, alpha: 1 });
  core.circle(cx, cy, 30).stroke({ color: 0x000000, alpha: 0.95, width: 3 });

  // Singularity Center Gravitational Point
  core.circle(cx, cy, 4.5).fill({ color: 0xffffff, alpha: 0.95 });

  container.addChild(core);
  return container;
}
