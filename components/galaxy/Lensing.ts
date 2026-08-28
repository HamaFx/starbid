import { Container, Graphics } from "pixi.js";
import { GALAXY_Y_SCALE } from "@/lib/math/galaxyLayout";

export class Lensing {
  public readonly container = new Container();
  private readonly gfx = new Graphics();
  private phase = 0;

  constructor() {
    this.container.addChild(this.gfx);
  }

  public tick(delta: number, cx: number, cy: number, radius = 52) {
    this.phase += delta * 0.025;
    this.gfx.clear();
    for (let i = 0; i < 3; i += 1) {
      const pulse = (Math.sin(this.phase + i * 1.8) + 1) / 2;
      const ringRadius = radius + i * 6 + pulse * 3;
      this.gfx
        .ellipse(cx, cy, ringRadius, ringRadius * GALAXY_Y_SCALE)
        .stroke({
          color: i === 1 ? 0xfbbf24 : 0x38bdf8,
          alpha: 0.08 + pulse * 0.12,
          width: 0.8 + pulse * 0.7,
        });
    }
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
