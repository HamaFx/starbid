import { Container, Graphics, Text } from "pixi.js";
import { angularVelocity } from "@/lib/math/orbit";
import { orbitPoint, GALAXY_Y_SCALE, crowdScale, galaxyRadiusForStar, spiralAngleForStar } from "@/lib/math/galaxyLayout";
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
  private maxRadius: number;
  private population: Pick<Star, "totalBidCents">[];
  private onClick: (star: Star) => void;
  private onHover: (star: Star | null, x: number, y: number) => void;

  constructor(
    star: Star,
    rank: number,
    maxRadius: number,
    onClick: (star: Star) => void,
    onHover: (star: Star | null, x: number, y: number) => void,
    population: Pick<Star, "totalBidCents">[] = [star],
  ) {
    this.star = star;
    this.rank = rank;
    this.onClick = onClick;
    this.onHover = onHover;
    this.maxRadius = maxRadius;
    this.population = population;
    this.container = new Container();
    this.container.eventMode = "static";
    this.container.cursor = "pointer";

    this.container.on("pointertap", () => this.onClick(this.star));
    this.container.on("pointerover", (e) => {
      this.isHovered = true;
      this.redraw();
      this.onHover(this.star, e.global.x, e.global.y);
    });
    this.container.on("pointerout", () => {
      this.isHovered = false;
      this.redraw();
      this.onHover(null, 0, 0);
    });

    this.targetRadius = galaxyRadiusForStar(star, rank, population.length, maxRadius);
    this.currentRadius = this.targetRadius;
    this.currentAngle = spiralAngleForStar(star, rank, this.currentRadius, maxRadius);
    this.starSize = this.calculateStarSize();

    this.graphic = new Graphics();
    this.container.addChild(this.graphic);

    // Dynamic Monospace Label
    this.label = new Text({
      text: this.getLabelText(),
      style: {
        fontFamily: "monospace",
        fontSize: this.rank === 0 ? 10 : 8.5,
        fontWeight: this.rank === 0 ? "bold" : "normal",
        fill: this.getStarColor(),
      },
    });
    this.label.anchor.set(0.5, 0);
    this.label.position.set(0, this.starSize + 4);
    this.container.addChild(this.label);

    this.redraw();
  }

  private getLabelText(): string {
    const name = this.star.name.length > 13 ? `${this.star.name.slice(0, 12)}…` : this.star.name;
    return this.star.isDemo ? `[DEMO] ${name}` : name;
  }

  private calculateStarSize(): number {
    const bidSize = Math.min(10, Math.max(4.5, 4.5 + Math.log1p(this.star.totalBidCents / 100) * 0.8));
    const rankBoost = this.rank === 0 ? 2 : this.rank < 3 ? 1 : 0;
    return (bidSize + rankBoost) * crowdScale(this.population.length);
  }

  private getStarColor(): number {
    if (this.rank === 0) return 0xffffff; // Diamond White
    if (this.rank < 3) return 0x38bdf8;  // Celestial Cyan
    if (this.rank < 7) return 0xfbbf24;  // Solar Gold
    if (this.rank < 12) return 0xf97316; // Plasma Amber
    return 0x67e8f9;                     // Electric Ice Blue
  }

  public updateData(star: Star, rank: number, maxRadius: number, population: Pick<Star, "totalBidCents">[] = [star]) {
    this.star = star;
    this.rank = rank;
    this.maxRadius = maxRadius;
    this.population = population;
    this.targetRadius = galaxyRadiusForStar(star, rank, population.length, maxRadius);
    this.starSize = this.calculateStarSize();
    this.label.text = this.getLabelText();
    this.label.style.fill = this.getStarColor();
    this.redraw();
  }

  public updatePopulation(population: Pick<Star, "totalBidCents">[]) {
    this.population = population;
    this.targetRadius = galaxyRadiusForStar(this.star, this.rank, population.length, this.maxRadius);
  }

  public updateLayout(maxRadius: number) {
    this.maxRadius = maxRadius;
    this.targetRadius = galaxyRadiusForStar(this.star, this.rank, this.population.length, maxRadius);
  }

  public getWorldPosition() {
    return this.container.position;
  }

  public getBearingDegrees(): number {
    return ((this.currentAngle * 180) / Math.PI + 360) % 360;
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
      this.graphic.circle(0, 0, baseSize + 11).stroke({ color: 0x38bdf8, alpha: 0.85, width: 1.4 });
      this.graphic.circle(0, 0, baseSize + 6).stroke({ color: 0xffffff, alpha: 0.6, width: 1.0 });
    }

    // Diffraction Spikes for top stars
    if ((isTop || isPhoton || this.isHovered) && !this.isDimmed) {
      const spikeLen = baseSize * (isTop ? 2.5 : 1.8);
      this.graphic
        .moveTo(-spikeLen, 0)
        .lineTo(spikeLen, 0)
        .stroke({ color: isTop ? 0xffffff : color, alpha: 0.45 * alphaMultiplier, width: 1 });
      this.graphic
        .moveTo(0, -spikeLen)
        .lineTo(0, spikeLen)
        .stroke({ color: isTop ? 0xffffff : color, alpha: 0.45 * alphaMultiplier, width: 1 });
    }

    // Luminous Corona Glow & Multi-layer Halos
    if (!this.isDimmed) {
      if (isTop) {
        this.graphic.circle(0, 0, baseSize + 6).stroke({ color: 0x38bdf8, alpha: 0.55, width: 1.5 });
        this.graphic.circle(0, 0, baseSize + 3).stroke({ color: 0xfbbf24, alpha: 0.7, width: 1.2 });
      } else if (isPhoton || isInner) {
        this.graphic.circle(0, 0, baseSize + 4).stroke({ color, alpha: 0.5, width: 1.1 });
      } else {
        this.graphic.circle(0, 0, baseSize + 2.5).stroke({ color, alpha: 0.38, width: 0.8 });
      }

      // Founding Star Golden Halo Ring
      if (this.star.isFounding) {
        this.graphic.circle(0, 0, baseSize + 5).stroke({ color: 0xfbbf24, alpha: 0.6, width: 1.0 });
      }
    }

    // Demo stars use a muted ring so they cannot be mistaken for paid stars.
    if (this.star.isDemo && !this.isDimmed) {
      this.graphic.circle(0, 0, baseSize + 7).stroke({ color: 0xa855f7, alpha: 0.75, width: 1.2 });
    }

    // Solid Core Star Body
    this.graphic.circle(0, 0, baseSize).fill({
      color: isTop ? 0xffffff : color,
      alpha: 1.0 * alphaMultiplier,
    });

    // Clean label visibility: show top 3 by default, and show any on hover/focus
    const showLabel = this.rank < 3 || this.isHovered || this.isFocused;
    this.label.visible = (showLabel || this.star.isDemo) && !this.isDimmed;
    this.label.alpha = (this.isHovered ? 1.0 : this.rank === 0 ? 0.95 : 0.75) * alphaMultiplier;
    this.label.position.set(0, baseSize + 4);
  }

  public tick(delta: number, cx: number, cy: number): { x: number; y: number } {
    const ease = 0.045 * Math.min(delta, 2);
    this.currentRadius += (this.targetRadius - this.currentRadius) * ease;

    const speed = angularVelocity(Math.max(10, this.currentRadius), 28);
    this.currentAngle += speed * 0.00012 * delta;
    const point = orbitPoint(cx, cy, this.currentRadius, this.currentAngle, GALAXY_Y_SCALE);
    const x = point.x;
    const y = point.y;
    this.container.position.set(x, y);

    return { x, y };
  }

  public deactivate() {
    this.container.visible = false;
    this.isHovered = false;
    this.isFocused = false;
    this.isDimmed = false;
    this.onHover(null, 0, 0);
  }

  public reactivate(
    star: Star,
    rank: number,
    maxRadius: number,
    population: Pick<Star, "totalBidCents">[],
    callbacks: { onClick: (star: Star) => void; onHover: (star: Star | null, x: number, y: number) => void },
  ) {
    this.container.visible = true;
    this.onClick = callbacks.onClick;
    this.onHover = callbacks.onHover;
    this.updateData(star, rank, maxRadius, population);
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
