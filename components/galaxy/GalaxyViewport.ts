import { Container } from "pixi.js";

export class GalaxyViewport {
  public world: Container;
  public scale = 1;
  public targetScale = 1;
  public x = 0;
  public y = 0;
  public targetX = 0;
  public targetY = 0;

  public cx: number;
  public cy: number;

  // Inertia and Momentum Physics
  private isDragging = false;
  private lastDragX = 0;
  private lastDragY = 0;
  private vx = 0;
  private vy = 0;
  private minZoom = 0.4;
  private maxZoom = 3.0;

  constructor(world: Container, cx: number, cy: number) {
    this.world = world;
    this.cx = cx;
    this.cy = cy;
    // Set pivot directly to the celestial center (Singularity Core)
    this.world.pivot.set(cx, cy);
    this.world.position.set(cx, cy);
  }

  public onWheel(deltaY: number, mouseX: number, mouseY: number, cx: number, cy: number) {
    const factor = deltaY < 0 ? 1.12 : 0.89;
    const newTarget = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetScale * factor));
    
    // Zoom centered smoothly around center pivot
    this.targetScale = newTarget;
  }

  public startDrag(x: number, y: number) {
    this.isDragging = true;
    this.lastDragX = x;
    this.lastDragY = y;
    this.vx = 0;
    this.vy = 0;
  }

  public onDrag(x: number, y: number) {
    if (!this.isDragging) return;
    const dx = x - this.lastDragX;
    const dy = y - this.lastDragY;
    this.lastDragX = x;
    this.lastDragY = y;

    this.targetX += dx;
    this.targetY += dy;

    // Accumulate smooth momentum velocity
    this.vx = dx * 0.75;
    this.vy = dy * 0.75;
  }

  public endDrag() {
    this.isDragging = false;
  }

  public zoomIn() {
    this.targetScale = Math.min(this.maxZoom, this.targetScale * 1.25);
  }

  public zoomOut() {
    this.targetScale = Math.max(this.minZoom, this.targetScale * 0.8);
  }

  public focusOn(targetWorldX: number, targetWorldY: number, cx: number, cy: number, zoom = 1.6) {
    this.targetScale = Math.min(this.maxZoom, Math.max(this.minZoom, zoom));
    this.targetX = (cx - targetWorldX) * this.targetScale;
    this.targetY = (cy - targetWorldY) * this.targetScale;
    this.vx = 0;
    this.vy = 0;
  }

  public reset() {
    this.targetScale = 1;
    this.targetX = 0;
    this.targetY = 0;
    this.vx = 0;
    this.vy = 0;
  }

  public tick(delta: number) {
    // Apply inertial drift when not actively dragging
    if (!this.isDragging && (Math.abs(this.vx) > 0.05 || Math.abs(this.vy) > 0.05)) {
      this.targetX += this.vx * delta;
      this.targetY += this.vy * delta;
      const friction = Math.pow(0.88, delta);
      this.vx *= friction;
      this.vy *= friction;
    }

    // Spring damping ease to target position and scale
    const ease = 0.14 * Math.min(delta, 2);
    this.scale += (this.targetScale - this.scale) * ease;
    this.x += (this.targetX - this.x) * ease;
    this.y += (this.targetY - this.y) * ease;

    this.world.scale.set(this.scale);
    // Keep positioned around center pivot (cx, cy)
    this.world.position.set(this.cx + this.x, this.cy + this.y);
  }
}
