import { Container, Graphics } from "pixi.js";

export function drawAccretionGuides(cx: number, cy: number, maxRadius: number): Container {
  const container = new Container();
  const guides = new Graphics();

  // Subtle coordinate grid crosshairs with terminal tic marks
  guides
    .moveTo(cx - maxRadius * 1.08, cy)
    .lineTo(cx + maxRadius * 1.08, cy)
    .stroke({ color: 0xffffff, alpha: 0.04, width: 1 });

  guides
    .moveTo(cx, cy - maxRadius * 0.72)
    .lineTo(cx, cy + maxRadius * 0.72)
    .stroke({ color: 0xffffff, alpha: 0.04, width: 1 });

  // Range marker ticks along primary axis
  const step = maxRadius / 5;
  for (let i = 1; i <= 5; i++) {
    const d = step * i;
    // Horizontal markers
    guides.moveTo(cx + d, cy - 3).lineTo(cx + d, cy + 3).stroke({ color: 0x38bdf8, alpha: 0.15, width: 1 });
    guides.moveTo(cx - d, cy - 3).lineTo(cx - d, cy + 3).stroke({ color: 0x38bdf8, alpha: 0.15, width: 1 });
  }

  // Concentric Orbit Boundary Rings with tilted elliptical projection (0.62)
  guides.ellipse(cx, cy, maxRadius, maxRadius * 0.62).stroke({ color: 0xffffff, alpha: 0.05, width: 1 });
  guides.ellipse(cx, cy, maxRadius * 0.72, maxRadius * 0.72 * 0.62).stroke({ color: 0xffffff, alpha: 0.06, width: 1 });
  guides.ellipse(cx, cy, maxRadius * 0.44, maxRadius * 0.44 * 0.62).stroke({ color: 0xfbbf24, alpha: 0.10, width: 1 });
  guides.ellipse(cx, cy, maxRadius * 0.22, maxRadius * 0.22 * 0.62).stroke({ color: 0x38bdf8, alpha: 0.18, width: 1.2 });
  guides.ellipse(cx, cy, maxRadius * 0.09, maxRadius * 0.09 * 0.62).stroke({ color: 0x22d3ee, alpha: 0.25, width: 1.2 });

  container.addChild(guides);
  return container;
}

export function drawSingularityCore(cx: number, cy: number): Container {
  const container = new Container();
  const core = new Graphics();

  // Relativistic Ergosphere & Accretion Glow Halo
  core.circle(cx, cy, 38).fill({ color: 0x38bdf8, alpha: 0.04 });
  core.circle(cx, cy, 30).stroke({ color: 0xfbbf24, alpha: 0.20, width: 1 });
  core.circle(cx, cy, 24).stroke({ color: 0xffffff, alpha: 0.35, width: 1 });

  // Photon Sphere / Einstein Ring
  core.circle(cx, cy, 20).stroke({ color: 0x38bdf8, alpha: 0.85, width: 1.8 });

  // Black Hole Event Horizon Shadow Core
  core.circle(cx, cy, 18).fill({ color: 0x050508, alpha: 1 });
  core.circle(cx, cy, 18).stroke({ color: 0x000000, alpha: 0.9, width: 2 });

  // Singularity Gravitational Core Center Point
  core.circle(cx, cy, 2).fill({ color: 0xffffff, alpha: 0.9 });

  container.addChild(core);
  return container;
}
