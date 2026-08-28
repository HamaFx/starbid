import { Container, Graphics } from "pixi.js";
import { GALAXY_Y_SCALE } from "@/lib/math/galaxyLayout";

type Shockwave = {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  color: number;
  alpha: number;
  width: number;
};

export class ShockwaveSystem {
  public container: Container;
  private gfx: Graphics;
  private shockwaves: Shockwave[] = [];

  constructor() {
    this.container = new Container();
    this.gfx = new Graphics();
    this.container.addChild(this.gfx);
  }

  public trigger(x: number, y: number, type: "spawn" | "fuel" | "singularity_takeover" | "click") {
    let maxRadius = 180;
    let speed = 4.5;
    let color = 0x38bdf8;
    let width = 2;

    if (type === "singularity_takeover") {
      maxRadius = 380;
      speed = 6.0;
      color = 0xfbbf24;
      width = 3.5;
    } else if (type === "fuel") {
      maxRadius = 140;
      speed = 3.8;
      color = 0x22d3ee;
      width = 2.0;
    } else if (type === "spawn") {
      maxRadius = 220;
      speed = 4.2;
      color = 0xa855f7;
      width = 2.5;
    }

    this.shockwaves.push({
      x,
      y,
      radius: 4,
      maxRadius,
      speed,
      color,
      alpha: 0.9,
      width,
    });
  }

  public tick(delta: number) {
    this.gfx.clear();
    if (this.shockwaves.length === 0) return;

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * delta;
      const progress = sw.radius / sw.maxRadius;
      sw.alpha = Math.max(0, (1 - progress) * 0.85);

      if (progress >= 1 || sw.alpha <= 0.01) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      // Draw expanding elliptical gravitational wavefront matching accretion tilt.
      this.gfx
        .ellipse(sw.x, sw.y, sw.radius, sw.radius * GALAXY_Y_SCALE)
        .stroke({
          color: sw.color,
          alpha: sw.alpha,
          width: sw.width * (1 - progress * 0.5),
        });

      // Secondary subtle inner echo ring
      if (sw.radius > 25) {
        const innerR = sw.radius * 0.75;
        this.gfx
          .ellipse(sw.x, sw.y, innerR, innerR * GALAXY_Y_SCALE)
          .stroke({
            color: sw.color,
            alpha: sw.alpha * 0.4,
            width: Math.max(0.5, sw.width * 0.5),
          });
      }
    }
  }

  public destroy() {
    this.shockwaves = [];
    this.container.destroy({ children: true });
  }
}
