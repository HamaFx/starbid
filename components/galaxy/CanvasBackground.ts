import { Container, Graphics, Text } from "pixi.js";

export function drawAccretionGuides(cx: number, cy: number, maxRadius: number): Container {
  const container = new Container();
  const guides = new Graphics();

  // Subtle coordinate grid crosshairs with major and minor axes
  guides
    .moveTo(cx - maxRadius * 1.15, cy)
    .lineTo(cx + maxRadius * 1.15, cy)
    .stroke({ color: 0x38bdf8, alpha: 0.08, width: 1 });

  guides
    .moveTo(cx, cy - maxRadius * 0.78)
    .lineTo(cx, cy + maxRadius * 0.78)
    .stroke({ color: 0x38bdf8, alpha: 0.08, width: 1 });

  // Diagonal sector bearings (45°, 135°, 225°, 315°)
  const diagX = maxRadius * 0.85;
  const diagY = maxRadius * 0.85 * 0.62;
  guides.moveTo(cx - diagX, cy - diagY).lineTo(cx + diagX, cy + diagY).stroke({ color: 0xffffff, alpha: 0.03, width: 0.8 });
  guides.moveTo(cx - diagX, cy + diagY).lineTo(cx + diagX, cy - diagY).stroke({ color: 0xffffff, alpha: 0.03, width: 0.8 });

  // Caliper precision tick marks along horizontal axis
  const divisions = 10;
  const step = maxRadius / divisions;
  for (let i = 1; i <= divisions; i++) {
    const d = step * i;
    const isMajor = i % 2 === 0;
    const tickH = isMajor ? 5 : 2.5;

    // Horizontal axis ticks
    guides.moveTo(cx + d, cy - tickH).lineTo(cx + d, cy + tickH).stroke({ color: 0x38bdf8, alpha: isMajor ? 0.35 : 0.15, width: 1 });
    guides.moveTo(cx - d, cy - tickH).lineTo(cx - d, cy + tickH).stroke({ color: 0x38bdf8, alpha: isMajor ? 0.35 : 0.15, width: 1 });

    // Vertical axis ticks
    const vy = d * 0.62;
    guides.moveTo(cx - (isMajor ? 4 : 2), cy - vy).lineTo(cx + (isMajor ? 4 : 2), cy - vy).stroke({ color: 0x38bdf8, alpha: isMajor ? 0.3 : 0.12, width: 1 });
    guides.moveTo(cx - (isMajor ? 4 : 2), cy + vy).lineTo(cx + (isMajor ? 4 : 2), cy + vy).stroke({ color: 0x38bdf8, alpha: isMajor ? 0.3 : 0.12, width: 1 });
  }

  // Concentric Astronomical Range Boundary Rings (0.1 AU to 5.0 AU)
  const rings = [
    { r: maxRadius * 1.0, au: "5.0 AU", color: 0xffffff, alpha: 0.06, width: 1 },
    { r: maxRadius * 0.75, au: "3.0 AU", color: 0xffffff, alpha: 0.07, width: 1 },
    { r: maxRadius * 0.50, au: "1.5 AU", color: 0xfbbf24, alpha: 0.12, width: 1.1 },
    { r: maxRadius * 0.28, au: "0.5 AU", color: 0x38bdf8, alpha: 0.20, width: 1.2 },
    { r: maxRadius * 0.12, au: "0.1 AU", color: 0x22d3ee, alpha: 0.30, width: 1.4 },
  ];

  rings.forEach((ring) => {
    // Elliptical inclined orbit ring
    guides.ellipse(cx, cy, ring.r, ring.r * 0.62).stroke({
      color: ring.color,
      alpha: ring.alpha,
      width: ring.width,
    });

    // Astronomical distance measurement label on East edge
    const label = new Text({
      text: ring.au,
      style: {
        fontFamily: "monospace",
        fontSize: 8,
        fill: ring.color,
      },
    });
    label.alpha = Math.min(1.0, ring.alpha * 3.5);
    label.anchor.set(0, 0.5);
    label.position.set(cx + ring.r + 6, cy);
    container.addChild(label);
  });

  // Cardinal Bearing Markers (N, E, S, W, and Sector Degrees)
  const bearings = [
    { text: "000° [N]", x: cx, y: cy - maxRadius * 0.78 - 10, anchorX: 0.5, anchorY: 1 },
    { text: "090° [E]", x: cx + maxRadius * 1.15 + 8, y: cy, anchorX: 0, anchorY: 0.5 },
    { text: "180° [S]", x: cx, y: cy + maxRadius * 0.78 + 10, anchorX: 0.5, anchorY: 0 },
    { text: "270° [W]", x: cx - maxRadius * 1.15 - 8, y: cy, anchorX: 1, anchorY: 0.5 },
  ];

  bearings.forEach((b) => {
    const t = new Text({
      text: b.text,
      style: {
        fontFamily: "monospace",
        fontSize: 7.5,
        fill: 0x52525b,
      },
    });
    t.anchor.set(b.anchorX, b.anchorY);
    t.position.set(b.x, b.y);
    container.addChild(t);
  });

  container.addChild(guides);
  return container;
}

export function drawSingularityCore(cx: number, cy: number): Container {
  const container = new Container();
  const core = new Graphics();

  // Relativistic Ergosphere & Accretion Lens Glow Halo
  core.circle(cx, cy, 46).fill({ color: 0x38bdf8, alpha: 0.03 });
  core.circle(cx, cy, 34).stroke({ color: 0xfbbf24, alpha: 0.22, width: 1 });
  core.circle(cx, cy, 26).stroke({ color: 0xffffff, alpha: 0.38, width: 1 });

  // Photon Sphere / Einstein Ring (Intense blue relativistic photon boundary)
  core.circle(cx, cy, 21).stroke({ color: 0x38bdf8, alpha: 0.95, width: 2.0 });
  core.circle(cx, cy, 21).fill({ color: 0x38bdf8, alpha: 0.08 });

  // Black Hole Event Horizon Shadow Core
  core.circle(cx, cy, 18).fill({ color: 0x050508, alpha: 1 });
  core.circle(cx, cy, 18).stroke({ color: 0x000000, alpha: 0.95, width: 2 });

  // Singularity Center Gravitational Point
  core.circle(cx, cy, 2.5).fill({ color: 0xffffff, alpha: 0.95 });

  // Core Metric Tag
  const coreTag = new Text({
    text: "CORE // SINGULARITY",
    style: {
      fontFamily: "monospace",
      fontSize: 7.5,
      fontWeight: "bold",
      fill: 0x38bdf8,
    },
  });
  coreTag.anchor.set(0.5, 0);
  coreTag.position.set(cx, cy + 24);
  coreTag.alpha = 0.75;
  container.addChild(coreTag);

  container.addChild(core);
  return container;
}
