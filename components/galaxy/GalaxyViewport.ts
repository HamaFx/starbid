import { Container } from "pixi.js";

export class GalaxyViewport {
  public world: Container;
  public scale = 1;
  public targetScale = 1;
  public x = 0;
  public y = 0;
  public targetX = 0;
  public targetY = 0;
  private isDragging = false;
  private lastDragX = 0;
  private lastDragY = 0;
  private minZoom = 0.5;
  private maxZoom = 3.0;

  constructor(world: Container) {
    this.world = world;
  }

  public onWheel(deltaY: number, mouseX: number, mouseY: number, cx: number, cy: number) {
    const factor = deltaY < 0 ? 1.12 : 0.89;
    const newTarget = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetScale * factor));
    const ratio = newTarget / this.targetScale;

    // Zoom towards cursor
    this.targetX = mouseX - (mouseX - this.targetX) * ratio;
    this.targetY = mouseY - (mouseY - this.targetY) * ratio;
    this.targetScale = newTarget;
  }

  public startDrag(x: number, y: number) {
    this.isDragging = true;
    this.lastDragX = x;
    this.lastDragY = y;
  }

  public onDrag(x: number, y: number) {
    if (!this.isDragging) return;
    const dx = x - this.lastDragX;
    const dy = y - this.lastDragY;
    this.lastDragX = x;
    this.lastDragY = y;
    this.targetX += dx;
    this.targetY += dy;
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
    this.targetX = cx - targetWorldX * this.targetScale;
    this.targetY = cy - targetWorldY * this.targetScale;
  }

  public reset(cx = 0, cy = 0) {
    this.targetScale = 1;
    this.targetX = 0;
    this.targetY = 0;
  }

  public tick(delta: number) {
    const ease = 0.12 * Math.min(delta, 2);
    this.scale += (this.targetScale - this.scale) * ease;
    this.x += (this.targetX - this.x) * ease;
    this.y += (this.targetY - this.y) * ease;

    this.world.scale.set(this.scale);
    this.world.position.set(this.x, this.y);
  }
}
