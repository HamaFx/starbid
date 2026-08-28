import { Container, Graphics } from "pixi.js";

const MAX_PTS = 22;

export class OrbitTrails {
  public container: Container;
  private gfx: Graphics;
  private buffers: Map<string, { x: Float32Array; y: Float32Array; count: number; head: number }> = new Map();

  constructor() {
    this.container = new Container();
    this.gfx = new Graphics();
    this.container.addChild(this.gfx);
  }

  public recordPoint(id: string, px: number, py: number) {
    let buf = this.buffers.get(id);
    if (!buf) {
      buf = { x: new Float32Array(MAX_PTS), y: new Float32Array(MAX_PTS), count: 0, head: 0 };
      this.buffers.set(id, buf);
    }
    buf.x[buf.head] = px;
    buf.y[buf.head] = py;
    buf.head = (buf.head + 1) % MAX_PTS;
    if (buf.count < MAX_PTS) buf.count++;
  }

  public removeStar(id: string) {
    this.buffers.delete(id);
  }

  public clear() {
    this.buffers.clear();
    this.gfx.clear();
  }

  public renderTrails(tierColors: Map<string, { color: number; alpha: number }>) {
    this.gfx.clear();

    this.buffers.forEach((buf, id) => {
      if (buf.count < 2) return;
      const meta = tierColors.get(id) ?? { color: 0x71717a, alpha: 0.15 };

      for (let i = 0; i < buf.count - 1; i++) {
        const idx1 = (buf.head - 1 - i + MAX_PTS) % MAX_PTS;
        const idx2 = (buf.head - 2 - i + MAX_PTS) % MAX_PTS;
        const p1x = buf.x[idx1];
        const p1y = buf.y[idx1];
        const p2x = buf.x[idx2];
        const p2y = buf.y[idx2];

        const progress = 1 - i / buf.count;
        // Non-linear cubic power decay for hyper-smooth comet tail dissipation
        const alpha = meta.alpha * Math.pow(progress, 1.8);
        const strokeWidth = Math.max(0.4, progress * 2.2);

        this.gfx.moveTo(p1x, p1y).lineTo(p2x, p2y).stroke({
          color: meta.color,
          alpha,
          width: strokeWidth,
        });
      }
    });
  }

  public destroy() {
    this.buffers.clear();
    this.container.destroy({ children: true });
  }
}
