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
    this.container.on("pointerover", (event) => {
      this.isHovered = true;
      this.redraw();
      onHover(this.star, event.global.x, event.global.y);
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

    const color = isTop ? 0xfff4e0 : isPhoton ? 0xffb627 : isInner ? 0xff6b35 : 0x7a2e1d;
    const baseSize = this.isHovered ? this.starSize * 1.35 : this.starSize;

    // Outer Aura / Corona for Milestone Tiers
    if (isTop) {
      this.graphic.circle(0, 0, baseSize + 8).stroke({ color: 0xfff4e0, alpha: 0.35, width: 2 });
      this.graphic.circle(0, 0, baseSize + 4).stroke({ color: 0xffb627, alpha: 0.5, width: 1.5 });
    } else if (isPhoton || this.isHovered) {
      this.graphic.circle(0, 0, baseSize + 5).stroke({ color: isPhoton ? 0xffb627 : 0x4cc9f0, alpha: 0.4, width: 1.5 });
    } else if (isInner) {
      this.graphic.circle(0, 0, baseSize + 3).stroke({ color: 0xff6b35, alpha: 0.25, width: 1 });
    }

    // Core Star Sphere
    this.graphic.circle(0, 0, baseSize).fill({
      color: this.star.verified ? 0xfff4e0 : color,
      alpha: this.star.isDemo ? 0.6 : 1,
    });

    if (isTop || isPhoton || this.isHovered) {
      this.graphic.blendMode = "add";
    }
  }

  public tick(delta: number, cx: number, cy: number) {
    const ease = 0.04 * Math.min(delta, 2);
    this.currentRadius += (this.targetRadius - this.currentRadius) * ease;

    const speed = angularVelocity(Math.max(10, this.currentRadius), 25);
    this.currentAngle += speed * 0.0006 * delta;
    this.pulsePhase += 0.03 * delta;

    const x = cx + Math.cos(this.currentAngle) * this.currentRadius;
    const y = cy + Math.sin(this.currentAngle) * this.currentRadius * 0.62;
    this.container.position.set(x, y);
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
