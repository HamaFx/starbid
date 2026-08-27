import { Container, Graphics } from "pixi.js";

type Point = { x: number; y: number };

export class OrbitTrails {
  public container: Container;
  private graphics: Graphics;
  private histories: Map<string, Point[]> = new Map();

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  public recordPoint(id: string, x: number, y: number, maxPoints = 16) {
    let list = this.histories.get(id);
    if (!list) {
      list = [];
      this.histories.set(id, list);
    }
    list.unshift({ x, y });
    if (list.length > maxPoints) list.pop();
  }

  public removeStar(id: string) {
    this.histories.delete(id);
  }

  public renderTrails(tierColors: Map<string, { color: number; alpha: number }>) {
    this.graphics.clear();

    this.histories.forEach((points, id) => {
      if (points.length < 2) return;
      const meta = tierColors.get(id) ?? { color: 0x71717a, alpha: 0.15 };

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const progress = 1 - i / points.length;
        const segmentAlpha = meta.alpha * Math.pow(progress, 1.8);

        this.graphics.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y).stroke({
          color: meta.color,
          alpha: segmentAlpha,
          width: Math.max(0.6, progress * 2),
        });
      }
    });
  }

  public destroy() {
    this.histories.clear();
    this.container.destroy({ children: true });
  }
}
