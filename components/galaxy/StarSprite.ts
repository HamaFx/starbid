import { Container, Graphics } from "pixi.js";
import { radius, size, angularVelocity } from "@/lib/math/orbit";
import type { Star } from "@/lib/types";

export class StarSprite {
  public container: Container;
  public star: Star;
  public currentRadius: number;
  public targetRadius: number;
  public currentAngle: number;
  public starSize: number;
  public rank: number;
  private graphic: Graphics;
  private isHovered = false;
  private pulsePhase = Math.random() * Math.PI * 2;

  constructor(
    star: Star,
    rank: number,
    maxRadius: number,
    onClick: (star: Star) => void,
    onHover: (star: Star | null, x: number, y: number) => void
  ) {
    this.star = star;
    this.rank = rank;
    this.container = new Container();
    this.container.eventMode = "static";
    this.container.cursor = "pointer";

    this.container.on("pointertap", () => onClick(this.star));
    this.container.on("pointerover", (e) => {
      this.isHovered = true;
      this.redraw();
      onHover(this.star, e.global.x, e.global.y);
    });
    this.container.on("pointerout", () => {
      this.isHovered = false;
      this.redraw();
      onHover(null, 0, 0);
    });

    const totalDollars = star.totalBidCents / 100;
    this.targetRadius = radius(totalDollars, maxRadius);
    this.currentRadius = this.targetRadius;
    this.currentAngle = (star.angleSeed * Math.PI) / 180;
    this.starSize = size(totalDollars) / 3;

    this.graphic = new Graphics();
    this.container.addChild(this.graphic);
    this.redraw();
  }

  public updateData(star: Star, rank: number, maxRadius: number) {
    this.star = star;
    this.rank = rank;
    const totalDollars = star.totalBidCents / 100;
    this.targetRadius = radius(totalDollars, maxRadius);
    this.starSize = size(totalDollars) / 3;
    this.redraw();
  }

  public redraw() {
    this.graphic.clear();
    const isTop = this.rank === 0;
    const isPhoton = this.rank > 0 && this.rank < 3;
    const isInner = this.rank >= 3 && this.rank < 8;

    const color = isTop ? 0xfff4e0 : isPhoton ? 0xfbbf24 : isInner ? 0xf97316 : 0x71717a;
    const baseSize = this.isHovered ? this.starSize * 1.4 : this.starSize;

    // Diffraction Spikes for Core and Photon Ring
    if (isTop || isPhoton) {
      const spikeLen = baseSize * (isTop ? 2.4 : 1.8);
      this.graphic.moveTo(-spikeLen, 0).lineTo(spikeLen, 0).stroke({ color: 0xffffff, alpha: 0.3, width: 1 });
      this.graphic.moveTo(0, -spikeLen).lineTo(0, spikeLen).stroke({ color: 0xffffff, alpha: 0.3, width: 1 });
    }

    // Outer Aura Corona
    if (isTop) {
      this.graphic.circle(0, 0, baseSize + 6).stroke({ color: 0x38bdf8, alpha: 0.4, width: 1.5 });
      this.graphic.circle(0, 0, baseSize + 3).stroke({ color: 0xfbbf24, alpha: 0.6, width: 1 });
    } else if (isPhoton || this.isHovered) {
      this.graphic.circle(0, 0, baseSize + 4).stroke({ color: isPhoton ? 0xfbbf24 : 0x38bdf8, alpha: 0.4, width: 1 });
    }

    // Core Star Body
    this.graphic.circle(0, 0, baseSize).fill({
      color: this.star.verified ? 0xffffff : color,
      alpha: this.star.isDemo ? 0.7 : 1,
    });

    if (isTop || isPhoton || this.isHovered) {
      this.graphic.blendMode = "add";
    }
  }

  public tick(delta: number, cx: number, cy: number): { x: number; y: number } {
    const ease = 0.04 * Math.min(delta, 2);
    this.currentRadius += (this.targetRadius - this.currentRadius) * ease;

    const speed = angularVelocity(Math.max(10, this.currentRadius), 25);
    this.currentAngle += speed * 0.0006 * delta;
    this.pulsePhase += 0.03 * delta;

    const x = cx + Math.cos(this.currentAngle) * this.currentRadius;
    const y = cy + Math.sin(this.currentAngle) * this.currentRadius * 0.62;
    this.container.position.set(x, y);

    return { x, y };
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
