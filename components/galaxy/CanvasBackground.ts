import { Container, Graphics } from "pixi.js";

export function drawAccretionGuides(cx: number, cy: number, maxRadius: number): Container {
  const container = new Container();
  const guides = new Graphics();

  // Subtle coordinate grid crosshairs
  guides
    .moveTo(cx - maxRadius * 1.05, cy)
    .lineTo(cx + maxRadius * 1.05, cy)
    .stroke({ color: 0x38bdf8, alpha: 0.05, width: 1 });

  guides
    .moveTo(cx, cy - maxRadius * 0.7)
    .lineTo(cx, cy + maxRadius * 0.7)
    .stroke({ color: 0x38bdf8, alpha: 0.05, width: 1 });

  // Concentric Orbit Boundary Rings with tilted elliptical projection (0.62)
  const rings = [
    { r: maxRadius * 0.92, color: 0xffffff, alpha: 0.04, width: 0.8 },
    { r: maxRadius * 0.72, color: 0xffffff, alpha: 0.05, width: 0.8 },
    { r: maxRadius * 0.52, color: 0xfbbf24, alpha: 0.07, width: 0.9 },
    { r: maxRadius * 0.32, color: 0x38bdf8, alpha: 0.12, width: 1.0 },
    { r: maxRadius * 0.16, color: 0x22d3ee, alpha: 0.20, width: 1.2 },
  ];

  rings.forEach((ring) => {
    guides.ellipse(cx, cy, ring.r, ring.r * 0.62).stroke({
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

  // Relativistic Ergosphere & Accretion Lens Glow Halo
  core.circle(cx, cy, 32).fill({ color: 0x38bdf8, alpha: 0.04 });
  core.circle(cx, cy, 24).stroke({ color: 0xfbbf24, alpha: 0.25, width: 1 });

  // Photon Sphere / Einstein Ring (Intense blue relativistic photon boundary)
  core.circle(cx, cy, 18).stroke({ color: 0x38bdf8, alpha: 0.95, width: 2.0 });
  core.circle(cx, cy, 18).fill({ color: 0x38bdf8, alpha: 0.08 });

  // Black Hole Event Horizon Shadow Core
  core.circle(cx, cy, 15).fill({ color: 0x050508, alpha: 1 });
  core.circle(cx, cy, 15).stroke({ color: 0x000000, alpha: 0.95, width: 2 });

  // Singularity Center Gravitational Point
  core.circle(cx, cy, 2.5).fill({ color: 0xffffff, alpha: 0.95 });

  container.addChild(core);
  return container;
}
