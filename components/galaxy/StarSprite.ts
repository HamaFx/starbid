import { Container, Graphics, Text } from "pixi.js";
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
  private label: Text | null = null;
  public isHovered = false;
  public isDimmed = false;
  public isFocused = false;
  private pulsePhase: number;

  constructor(
    star: Star,
    rank: number,
    maxRadius: number,
    onClick: (star: Star) => void,
    onHover: (star: Star | null, x: number, y: number) => void
  ) {
    this.star = star;
    this.rank = rank;
    this.pulsePhase = (star.angleSeed % 100) * 0.1;
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

    if (this.rank < 8) {
      this.label = new Text({
        text: this.star.name.length > 12 ? `${this.star.name.slice(0, 11)}…` : this.star.name,
        style: {
          fontFamily: "monospace",
          fontSize: 9,
          fill: this.rank === 0 ? 0x38bdf8 : this.rank < 3 ? 0xfbbf24 : 0x71717a,
        },
      });
      this.label.anchor.set(0.5, 0);
      this.label.position.set(0, this.starSize + 4);
      this.container.addChild(this.label);
    }

    this.redraw();
  }

  public updateData(star: Star, rank: number, maxRadius: number) {
    this.star = star;
    this.rank = rank;
    const totalDollars = star.totalBidCents / 100;
    this.targetRadius = radius(totalDollars, maxRadius);
    this.starSize = size(totalDollars) / 3;
    if (this.label) {
      this.label.text = this.star.name.length > 12 ? `${this.star.name.slice(0, 11)}…` : this.star.name;
      this.label.style.fill = this.rank === 0 ? 0x38bdf8 : this.rank < 3 ? 0xfbbf24 : 0x71717a;
    }
    this.redraw();
  }

  public setFilterState(isDimmed: boolean, isFocused: boolean) {
    this.isDimmed = isDimmed;
    this.isFocused = isFocused;
    this.redraw();
  }

  public redraw() {
    this.graphic.clear();
    const isTop = this.rank === 0;
    const isPhoton = this.rank > 0 && this.rank < 3;
    const isInner = this.rank >= 3 && this.rank < 8;

    // Stellar spectral classification color palette
    const color = isTop ? 0xffffff : isPhoton ? 0x38bdf8 : isInner ? 0xfbbf24 : 0x71717a;
    const baseSize = this.isHovered || this.isFocused ? this.starSize * 1.45 : this.starSize;
    const alphaMultiplier = this.isDimmed ? 0.2 : 1;

    // Focused Target Reticle
    if (this.isFocused) {
      this.graphic.circle(0, 0, baseSize + 12).stroke({ color: 0x38bdf8, alpha: 0.9, width: 1.5 });
      this.graphic.circle(0, 0, baseSize + 6).stroke({ color: 0xffffff, alpha: 0.7, width: 1 });
    }

    // Diffraction Spikes with Crosshairs
    if ((isTop || isPhoton || this.isHovered) && !this.isDimmed) {
      const spikeLen = baseSize * (isTop ? 2.8 : isPhoton ? 2.0 : 1.6);
      this.graphic
        .moveTo(-spikeLen, 0)
        .lineTo(spikeLen, 0)
        .stroke({ color: isTop ? 0xffffff : 0x38bdf8, alpha: 0.35 * alphaMultiplier, width: 1 });
      this.graphic
        .moveTo(0, -spikeLen)
        .lineTo(0, spikeLen)
        .stroke({ color: isTop ? 0xffffff : 0x38bdf8, alpha: 0.35 * alphaMultiplier, width: 1 });

      // Diamond glint on core
      if (isTop) {
        const d = spikeLen * 0.55;
        this.graphic.moveTo(-d, -d).lineTo(d, d).stroke({ color: 0x38bdf8, alpha: 0.2, width: 0.8 });
        this.graphic.moveTo(d, -d).lineTo(-d, d).stroke({ color: 0x38bdf8, alpha: 0.2, width: 0.8 });
      }
    }

    // Outer Corona Rings
    if (isTop && !this.isDimmed) {
      this.graphic.circle(0, 0, baseSize + 7).stroke({ color: 0x38bdf8, alpha: 0.45, width: 1.5 });
      this.graphic.circle(0, 0, baseSize + 3.5).stroke({ color: 0xfbbf24, alpha: 0.65, width: 1.2 });
    } else if ((isPhoton || this.isHovered) && !this.isDimmed) {
      this.graphic.circle(0, 0, baseSize + 4.5).stroke({ color: isPhoton ? 0x38bdf8 : 0xfbbf24, alpha: 0.5, width: 1 });
    }

    // Founding Star Specular Halo
    if (this.star.isFounding && !this.isDimmed) {
      this.graphic.circle(0, 0, baseSize + 2.5).stroke({ color: 0xfbbf24, alpha: 0.4, width: 0.8 });
    }

    // Core Star Body
    this.graphic.circle(0, 0, baseSize).fill({
      color: this.star.verified ? 0xffffff : color,
      alpha: (this.star.isDemo ? 0.75 : 1) * alphaMultiplier,
    });

    if (this.label) this.label.alpha = alphaMultiplier;
  }

  public tick(delta: number, cx: number, cy: number): { x: number; y: number } {
    const ease = 0.045 * Math.min(delta, 2);
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
