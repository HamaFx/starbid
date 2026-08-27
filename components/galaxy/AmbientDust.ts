import { Container, Graphics } from "pixi.js";
import { angularVelocity } from "@/lib/math/orbit";

type DustParticle = {
  radius: number;
  angle: number;
  speedMultiplier: number;
  size: number;
  color: number;
  alpha: number;
};

export class AmbientDust {
  public container: Container;
  private graphics: Graphics;
  private particles: DustParticle[] = [];

  constructor(count: number, maxRadius: number) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    const colors = [0xfff4e0, 0xffb627, 0xff6b35, 0x38bdf8];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        radius: 30 + Math.random() * (maxRadius - 30),
        angle: Math.random() * Math.PI * 2,
        speedMultiplier: 0.6 + Math.random() * 0.8,
        size: 0.8 + Math.random() * 1.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.08 + Math.random() * 0.25,
      });
    }
  }

  public tick(delta: number, cx: number, cy: number, maxRadius: number) {
    this.graphics.clear();

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const speed = angularVelocity(p.radius, 22) * p.speedMultiplier;
      p.angle += speed * 0.0004 * delta;
      p.radius -= 0.015 * delta; // slow inward drift

      if (p.radius < 26) {
        p.radius = maxRadius * (0.85 + Math.random() * 0.15);
        p.angle = Math.random() * Math.PI * 2;
      }

      const x = cx + Math.cos(p.angle) * p.radius;
      const y = cy + Math.sin(p.angle) * p.radius * 0.62;

      this.graphics.circle(x, y, p.size);
      this.graphics.fill({ color: p.color, alpha: p.alpha });
    }
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
