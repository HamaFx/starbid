import { Container, Graphics } from "pixi.js";
import { GALAXY_SPIRAL_ARMS, GALAXY_SPIRAL_TWIST, GALAXY_Y_SCALE, spiralArmPoint } from "@/lib/math/galaxyLayout";

export function drawAccretionGuides(cx: number, cy: number, maxRadius: number): Container {
  const container = new Container();
  const galaxy = new Graphics();

  galaxy.ellipse(cx, cy, maxRadius, maxRadius * GALAXY_Y_SCALE).fill({ color: 0x172554, alpha: 0.16 });
  galaxy.ellipse(cx, cy, maxRadius * 0.78, maxRadius * GALAXY_Y_SCALE * 0.78).fill({ color: 0x312e81, alpha: 0.1 });
  galaxy.ellipse(cx, cy, maxRadius * 0.34, maxRadius * GALAXY_Y_SCALE * 0.34).fill({ color: 0xfbbf24, alpha: 0.08 });

  for (let arm = 0; arm < GALAXY_SPIRAL_ARMS; arm += 1) {
    const points = 36;
    for (let index = 1; index < points; index += 1) {
      const radial = index / (points - 1);
      const point = spiralArmPoint(arm, radial, maxRadius, cx, cy);
      const previous = spiralArmPoint(arm, radial - 1 / (points - 1), maxRadius, cx, cy);
      const alpha = 0.035 + (1 - radial) * 0.03;
      galaxy.moveTo(previous.x, previous.y).lineTo(point.x, point.y).stroke({
        color: arm % 2 === 0 ? 0x38bdf8 : 0xfbbf24,
        alpha,
        width: Math.max(5, maxRadius * 0.025 * (1 - radial * 0.45)),
      });
      galaxy.moveTo(previous.x, previous.y).lineTo(point.x, point.y).stroke({
        color: 0xffffff,
        alpha: alpha * 0.28,
        width: Math.max(1, maxRadius * 0.006),
      });
    }
  }

  container.addChild(galaxy);
  return container;
}

export function drawSingularityCore(cx: number, cy: number): Container {
  const container = new Container();
  const core = new Graphics();

  core.circle(cx, cy, 64).fill({ color: 0x38bdf8, alpha: 0.04 });
  core.circle(cx, cy, 48).stroke({ color: 0xfbbf24, alpha: 0.25, width: 1.5 });
  core.circle(cx, cy, 36).stroke({ color: 0x38bdf8, alpha: 0.95, width: 3 });
  core.circle(cx, cy, 36).fill({ color: 0x38bdf8, alpha: 0.08 });
  core.circle(cx, cy, 30).fill({ color: 0x050508, alpha: 1 });
  core.circle(cx, cy, 30).stroke({ color: 0x000000, alpha: 0.95, width: 3 });
  core.circle(cx, cy, 4.5).fill({ color: 0xffffff, alpha: 0.95 });

  container.addChild(core);
  return container;
}
