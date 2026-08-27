import { Container, Graphics } from "pixi.js";
import { angularVelocity } from "@/lib/math/orbit";

type Particle = {
  r: number;
  a: number;
  speedMultiplier: number;
  baseSize: number;
  color: number;
  baseAlpha: number;
  verticalJitter: number;
};

export class AmbientDust {
  public container: Container;
  private gfx: Graphics;
  private pool: Particle[] = [];

  constructor(count = 140, maxRadius: number) {
    this.container = new Container();
    this.gfx = new Graphics();
    this.container.addChild(this.gfx);

    // Dynamic temperature spectrum: blue-white hot inner, golden mid, deep amber/cyan outer
    const colors = [0xffffff, 0x38bdf8, 0xfbbf24, 0xf97316, 0x818cf8, 0x22d3ee];

    for (let i = 0; i < count; i++) {
      // Distribute more particles toward inner gravitational wells
      const rNormalized = Math.pow(Math.random(), 1.4);
      const r = 26 + rNormalized * (maxRadius - 26);

      this.pool.push({
        r,
        a: Math.random() * Math.PI * 2,
        speedMultiplier: 0.7 + Math.random() * 0.6,
        baseSize: 0.6 + Math.random() * 1.6,
        color: colors[i % colors.length],
        baseAlpha: 0.06 + Math.random() * 0.28,
        verticalJitter: 0.58 + Math.random() * 0.08,
      });
    }
  }

  public tick(delta: number, cx: number, cy: number, maxRadius: number) {
    this.gfx.clear();

    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];

      // Keplerian angular velocity with speed multiplier
      const spd = angularVelocity(Math.max(15, p.r), 26) * p.speedMultiplier;
      p.a += spd * 0.00045 * delta;

      // Inward gravitational accretion drift
      p.r -= (0.012 + (35 / Math.max(20, p.r)) * 0.008) * delta;

      // Respawn if accreted past the event horizon
      if (p.r < 24) {
        p.r = maxRadius * (0.82 + Math.random() * 0.18);
        p.a = Math.random() * Math.PI * 2;
      }

      // Calculate position with accretion disk tilt projection
      const x = cx + Math.cos(p.a) * p.r;
      const y = cy + Math.sin(p.a) * p.r * p.verticalJitter;

      // Relativistic Doppler beaming effect: particles moving toward viewer (cos(a) < 0 in downward ellipse) are brighter
      const dopplerBoost = 1.0 + Math.sin(p.a) * 0.35;
      const finalAlpha = Math.min(1.0, p.baseAlpha * dopplerBoost);
      const sizeBoost = p.r < 80 ? p.baseSize * 1.3 : p.baseSize;

      this.gfx.circle(x, y, sizeBoost).fill({ color: p.color, alpha: finalAlpha });
    }
  }

  public destroy() {
    this.pool = [];
    this.container.destroy({ children: true });
  }
}
