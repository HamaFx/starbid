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
    const color = isTop
      ? 0xfff4e0
      : this.rank < 5
      ? 0xffb627
      : this.rank < 20
      ? 0xff6b35
      : 0x7a2e1d;

    const baseSize = this.isHovered ? this.starSize * 1.3 : this.starSize;

    // Outer glow ring for Singularity / top stars or hover
    if (isTop || this.isHovered) {
      this.graphic.circle(0, 0, baseSize + (isTop ? 6 : 4));
      this.graphic.stroke({ color: 0xfff4e0, alpha: 0.45, width: 2 });
    }

    this.graphic.circle(0, 0, baseSize);
    this.graphic.fill({
      color: this.star.verified ? 0xfff4e0 : color,
      alpha: this.star.isDemo ? 0.5 : 1,
    });

    if (isTop || this.rank < 5 || this.isHovered) {
      this.graphic.blendMode = "add";
    }
  }

  public tick(delta: number, cx: number, cy: number) {
    const ease = 0.04 * Math.min(delta, 2);
    this.currentRadius += (this.targetRadius - this.currentRadius) * ease;

    const speed = angularVelocity(Math.max(10, this.currentRadius), 25);
    this.currentAngle += speed * 0.0006 * delta;

    const x = cx + Math.cos(this.currentAngle) * this.currentRadius;
    const y = cy + Math.sin(this.currentAngle) * this.currentRadius * 0.62;
    this.container.position.set(x, y);
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
