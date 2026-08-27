import { Container, Graphics } from "pixi.js";

export function drawAccretionGuides(cx: number, cy: number, maxRadius: number): Container {
  const container = new Container();
  const guides = new Graphics();

  // Subtle coordinate grid crosshair
  guides.moveTo(cx - maxRadius * 1.05, cy).lineTo(cx + maxRadius * 1.05, cy).stroke({ color: 0xffffff, alpha: 0.05, width: 1 });
  guides.moveTo(cx, cy - maxRadius * 0.68).lineTo(cx, cy + maxRadius * 0.68).stroke({ color: 0xffffff, alpha: 0.05, width: 1 });

  // Concentric Orbit Boundary Rings
  guides.circle(cx, cy, maxRadius).stroke({ color: 0xffffff, alpha: 0.06, width: 1 });
  guides.circle(cx, cy, maxRadius * 0.65).stroke({ color: 0xffffff, alpha: 0.08, width: 1 });
  guides.circle(cx, cy, maxRadius * 0.38).stroke({ color: 0xfbbf24, alpha: 0.12, width: 1 });
  guides.circle(cx, cy, maxRadius * 0.18).stroke({ color: 0x38bdf8, alpha: 0.2, width: 1.2 });

  container.addChild(guides);
  return container;
}

export function drawSingularityCore(cx: number, cy: number): Container {
  const container = new Container();
  const core = new Graphics();

  // Outer accretion threshold ring
  core.circle(cx, cy, 32).stroke({ color: 0xfbbf24, alpha: 0.25, width: 1 });
  core.circle(cx, cy, 24).stroke({ color: 0xffffff, alpha: 0.4, width: 1 });

  // Black hole event horizon core
  core.circle(cx, cy, 18).fill(0x000000);
  core.circle(cx, cy, 19).stroke({ color: 0x38bdf8, alpha: 0.7, width: 1.5 });

  container.addChild(core);
  return container;
}
