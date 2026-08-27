import { Container, Graphics } from "pixi.js";
import { angularVelocity } from "@/lib/math/orbit";

type Particle = { r: number; a: number; s: number; sz: number; col: number; alp: number };

export class AmbientDust {
  public container: Container;
  private gfx: Graphics;
  private pool: Particle[] = [];

  constructor(count: number, maxRadius: number) {
    this.container = new Container();
    this.gfx = new Graphics();
    this.container.addChild(this.gfx);

    const colors = [0xfff4e0, 0xffb627, 0xff6b35, 0x38bdf8];
    for (let i = 0; i < count; i++) {
      this.pool.push({
        r: 30 + Math.random() * (maxRadius - 30),
        a: Math.random() * Math.PI * 2,
        s: 0.6 + Math.random() * 0.8,
        sz: 0.8 + Math.random() * 1.3,
        col: colors[i % colors.length],
        alp: 0.08 + Math.random() * 0.22,
      });
    }
  }

  public tick(delta: number, cx: number, cy: number, maxRadius: number) {
    this.gfx.clear();
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      const spd = angularVelocity(p.r, 22) * p.s;
      p.a += spd * 0.0004 * delta;
      p.r -= 0.015 * delta;

      if (p.r < 25) {
        p.r = maxRadius * (0.85 + Math.random() * 0.15);
        p.a = Math.random() * Math.PI * 2;
      }

      const x = cx + Math.cos(p.a) * p.r;
      const y = cy + Math.sin(p.a) * p.r * 0.62;
      this.gfx.circle(x, y, p.sz).fill({ color: p.col, alpha: p.alp });
    }
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
