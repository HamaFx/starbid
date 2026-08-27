import { Container, Graphics } from "pixi.js";

type StarNode = {
  id: string;
  x: number;
  y: number;
  rank: number;
  isHovered: boolean;
};

export class ConstellationWeb {
  public container: Container;
  private gfx: Graphics;
  private maxLinkDistance = 160;

  constructor() {
    this.container = new Container();
    this.gfx = new Graphics();
    this.container.addChild(this.gfx);
  }

  public renderLinks(nodes: StarNode[], hoveredStarId: string | null) {
    this.gfx.clear();
    if (nodes.length < 2) return;

    const n = Math.min(nodes.length, 30); // Top 30 stars for high-performance webbing

    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy;
        const maxDistSq = this.maxLinkDistance * this.maxLinkDistance;

        if (distSq > maxDistSq) continue;

        const dist = Math.sqrt(distSq);
        const distFactor = 1 - dist / this.maxLinkDistance;

        const isLinkedToHover =
          hoveredStarId !== null && (a.id === hoveredStarId || b.id === hoveredStarId);

        let color = 0x52525b;
        let alpha = 0.04 * distFactor;
        let width = 0.5;

        // Top 3 Core Stars have special golden/cyan energetic filaments
        if (a.rank < 3 && b.rank < 3) {
          color = 0x38bdf8;
          alpha = 0.16 * distFactor;
          width = 1.0;
        } else if (a.rank < 8 && b.rank < 8) {
          color = 0xfbbf24;
          alpha = 0.10 * distFactor;
          width = 0.8;
        }

        if (isLinkedToHover) {
          color = 0x38bdf8;
          alpha = 0.45 * distFactor;
          width = 1.6;
        }

        this.gfx
          .moveTo(a.x, a.y)
          .lineTo(b.x, b.y)
          .stroke({
            color,
            alpha,
            width,
          });
      }
    }
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
