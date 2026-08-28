import { Container, Graphics, Text } from "pixi.js";
import { radius, angularVelocity } from "@/lib/math/orbit";
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
  private label: Text;
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
    this.starSize = this.calculateStarSize();

    this.graphic = new Graphics();
    this.container.addChild(this.graphic);

    // Dynamic Monospace Label
    this.label = new Text({
      text: this.star.name.length > 12 ? `${this.star.name.slice(0, 11)}…` : this.star.name,
      style: {
        fontFamily: "monospace",
        fontSize: this.rank === 0 ? 9.5 : 8,
        fontWeight: this.rank === 0 ? "bold" : "normal",
        fill: this.getStarColor(),
      },
    });
    this.label.anchor.set(0.5, 0);
    this.label.position.set(0, this.starSize + 3.5);
    this.container.addChild(this.label);

    this.redraw();
  }

  private calculateStarSize(): number {
    if (this.rank === 0) return 8.0;   // #1 Core Star (crisp & prominent)
    if (this.rank < 3) return 6.8;    // Ranks 2-3 (Photon Orbit)
    if (this.rank < 7) return 5.5;    // Ranks 4-7 (Inner Orbit)
    if (this.rank < 12) return 4.5;   // Ranks 8-12 (Mid Orbit)
    return 3.8;                       // Outer Drift Stars
  }

  private getStarColor(): number {
    if (this.rank === 0) return 0xffffff; // Diamond White
    if (this.rank < 3) return 0x38bdf8;  // Celestial Cyan
    if (this.rank < 7) return 0xfbbf24;  // Solar Gold
    if (this.rank < 12) return 0xf97316; // Plasma Amber
    return 0x67e8f9;                     // Ice Blue
  }

  public updateData(star: Star, rank: number, maxRadius: number) {
    this.star = star;
    this.rank = rank;
    const totalDollars = star.totalBidCents / 100;
    this.targetRadius = radius(totalDollars, maxRadius);
    this.starSize = this.calculateStarSize();
    this.label.text = this.star.name.length > 12 ? `${this.star.name.slice(0, 11)}…` : this.star.name;
    this.label.style.fill = this.getStarColor();
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
    const isInner = this.rank >= 3 && this.rank < 7;
    const color = this.getStarColor();
    const baseSize = this.isHovered || this.isFocused ? this.starSize * 1.4 : this.starSize;
    const alphaMultiplier = this.isDimmed ? 0.15 : 1.0;

    // Focused / Hovered Target Reticle
    if (this.isFocused || this.isHovered) {
      this.graphic.circle(0, 0, baseSize + 9).stroke({ color: 0x38bdf8, alpha: 0.85, width: 1.2 });
      this.graphic.circle(0, 0, baseSize + 5).stroke({ color: 0xffffff, alpha: 0.6, width: 0.8 });
    }

    // Diffraction Spikes for top stars
    if ((isTop || isPhoton || this.isHovered) && !this.isDimmed) {
      const spikeLen = baseSize * (isTop ? 2.4 : 1.7);
      this.graphic
        .moveTo(-spikeLen, 0)
        .lineTo(spikeLen, 0)
        .stroke({ color: isTop ? 0xffffff : color, alpha: 0.4 * alphaMultiplier, width: 0.8 });
      this.graphic
        .moveTo(0, -spikeLen)
        .lineTo(0, spikeLen)
        .stroke({ color: isTop ? 0xffffff : color, alpha: 0.4 * alphaMultiplier, width: 0.8 });
    }

    // Luminous Corona Glow
    if (!this.isDimmed) {
      if (isTop) {
        this.graphic.circle(0, 0, baseSize + 5).stroke({ color: 0x38bdf8, alpha: 0.5, width: 1.2 });
        this.graphic.circle(0, 0, baseSize + 2.5).stroke({ color: 0xfbbf24, alpha: 0.6, width: 1 });
      } else if (isPhoton || isInner) {
        this.graphic.circle(0, 0, baseSize + 3).stroke({ color, alpha: 0.45, width: 0.9 });
      } else {
        this.graphic.circle(0, 0, baseSize + 2).stroke({ color, alpha: 0.3, width: 0.6 });
      }

      // Founding Star Golden Ring
      if (this.star.isFounding) {
        this.graphic.circle(0, 0, baseSize + 3.5).stroke({ color: 0xfbbf24, alpha: 0.55, width: 0.8 });
      }
    }

    // Solid Core Star Body
    this.graphic.circle(0, 0, baseSize).fill({
      color: isTop ? 0xffffff : color,
      alpha: 1.0 * alphaMultiplier,
    });

    // Clean label visibility: ONLY show top 3 by default; show others on hover/focus to prevent clutter
    const showLabel = this.rank < 3 || this.isHovered || this.isFocused;
    this.label.visible = showLabel && !this.isDimmed;
    this.label.alpha = (this.isHovered ? 1.0 : this.rank === 0 ? 0.95 : 0.75) * alphaMultiplier;
    this.label.position.set(0, baseSize + 3.5);
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
