import { Container, Graphics } from "pixi.js";

export function drawAccretionGuides(cx: number, cy: number, maxRadius: number): Container {
  const container = new Container();
  const rings = new Graphics();

  // Outer Rim Guide Ring
  rings.circle(cx, cy, maxRadius).stroke({ color: 0x7a2e1d, alpha: 0.15, width: 1 });

  // Mid Disk Guide Ring
  rings.circle(cx, cy, maxRadius * 0.65).stroke({ color: 0xff6b35, alpha: 0.12, width: 1 });

  // Inner Disk Guide Ring
  rings.circle(cx, cy, maxRadius * 0.38).stroke({ color: 0xffb627, alpha: 0.18, width: 1 });

  // Photon Ring (Critical Orbit)
  rings.circle(cx, cy, maxRadius * 0.18).stroke({ color: 0xfff4e0, alpha: 0.25, width: 1.2 });

  // Subtle radial crosshair axis
  rings.moveTo(cx - maxRadius, cy).lineTo(cx + maxRadius, cy).stroke({ color: 0xfff4e0, alpha: 0.04, width: 1 });
  rings.moveTo(cx, cy - maxRadius * 0.62).lineTo(cx, cy + maxRadius * 0.62).stroke({ color: 0xfff4e0, alpha: 0.04, width: 1 });

  container.addChild(rings);
  return container;
}

export function drawSingularityCore(cx: number, cy: number): Container {
  const container = new Container();

  // Outer thermal corona
  const corona = new Graphics();
  corona.circle(cx, cy, 52).fill({ color: 0xff6b35, alpha: 0.08 });
  corona.circle(cx, cy, 38).fill({ color: 0xffb627, alpha: 0.15 });
  corona.circle(cx, cy, 28).stroke({ color: 0xfff4e0, alpha: 0.5, width: 2 });
  container.addChild(corona);

  // Black Hole Event Horizon
  const core = new Graphics();
  core.circle(cx, cy, 20).fill(0x020205);
  core.circle(cx, cy, 22).stroke({ color: 0xfff4e0, alpha: 0.8, width: 2 });
  container.addChild(core);

  return container;
}
