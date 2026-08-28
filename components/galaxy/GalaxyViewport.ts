import { Container } from "pixi.js";

export class GalaxyViewport {
  public world: Container;
  public scale = 1.0;
  public targetScale = 1.0;
  public defaultScale = 1.0;
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
  public minZoom = 0.4;
  public maxZoom = 4.0;
  private worldRadius = 0;
  private worldWidth = 0;
  private worldHeight = 0;

  public updateWorldRadius(radius: number, worldWidth = radius * 2, worldHeight = radius * 2) {
    this.worldRadius = Math.max(0, radius);
    this.worldWidth = Math.max(0, worldWidth);
    this.worldHeight = Math.max(0, worldHeight);
    // Keep a deliberate overview scale. Never fit the camera to current stars.
    const viewportWidth = Math.max(1, this.cx * 2);
    const overviewScale = this.worldWidth > 0 ? Math.min(1, (viewportWidth * 0.34) / this.worldWidth) : 1;
    this.minZoom = Math.min(this.minZoom, Math.max(0.08, overviewScale * 0.7));
    if (this.targetScale < this.minZoom) this.targetScale = this.minZoom;
  }

  // Multi-touch pinch tracking
  private activePointers = new Map<number, { x: number; y: number }>();
  private initialPinchDist = 0;
  private initialPinchScale = 1.0;
  private initialPinchMidpoint = { x: 0, y: 0 };
  private pinchWorldPoint = { x: 0, y: 0 };

  constructor(world: Container, cx: number, cy: number, defaultScale = 1.0) {
    this.world = world;
    this.cx = cx;
    this.cy = cy;
    this.defaultScale = defaultScale;
    this.scale = defaultScale;
    this.targetScale = defaultScale;

    // Set pivot to the Singularity Core
    this.world.pivot.set(cx, cy);
    this.world.position.set(cx, cy);
    this.world.scale.set(defaultScale);
  }

  public updateCenter(cx: number, cy: number, defaultScale = 1.0) {
    this.cx = cx;
    this.cy = cy;
    this.defaultScale = defaultScale;
    this.world.position.set(cx, cy);
  }

  /**
   * Cursor-anchored smooth wheel & trackpad pinch zooming
   */
  public onWheel(deltaY: number, mouseX: number, mouseY: number, isPinch = false) {
    const zoomStep = isPinch ? Math.exp(-deltaY * 0.008) : Math.exp(-Math.sign(deltaY || 1) * 0.12);
    const newTarget = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetScale * zoomStep));
    if (newTarget === this.targetScale) return;

    // Anchor zoom around the cursor pointer
    const wx = (mouseX - this.cx - this.targetX) / this.targetScale;
    const wy = (mouseY - this.cy - this.targetY) / this.targetScale;

    this.targetScale = newTarget;
    this.targetX = mouseX - this.cx - wx * newTarget;
    this.targetY = mouseY - this.cy - wy * newTarget;
  }

  /**
   * Pointer down handling with multi-touch pinch support
   */
  public onPointerDown(e: PointerEvent, canvasRect?: DOMRect) {
    const point = this.localPoint(e.clientX, e.clientY, canvasRect);
    this.activePointers.set(e.pointerId, point);

    if (this.activePointers.size === 1) {
      this.isDragging = true;
      this.lastDragX = point.x;
      this.lastDragY = point.y;
      this.vx = 0;
      this.vy = 0;
    } else if (this.activePointers.size === 2) {
      this.isDragging = false;
      const pts = Array.from(this.activePointers.values());
      this.initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      this.initialPinchScale = this.targetScale;
      this.initialPinchMidpoint = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };
      this.pinchWorldPoint = {
        x: (this.initialPinchMidpoint.x - this.cx - this.targetX) / this.targetScale,
        y: (this.initialPinchMidpoint.y - this.cy - this.targetY) / this.targetScale,
      };
    }
  }

  /**
   * Pointer move handling with momentum drag and multi-touch pinch
   */
  public onPointerMove(e: PointerEvent, canvasRect: DOMRect) {
    if (!this.activePointers.has(e.pointerId)) return;
    const point = this.localPoint(e.clientX, e.clientY, canvasRect);
    this.activePointers.set(e.pointerId, point);

    if (this.activePointers.size === 2) {
      const pts = Array.from(this.activePointers.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (this.initialPinchDist > 0) {
        const pinchRatio = currentDist / this.initialPinchDist;
        const midX = (pts[0].x + pts[1].x) / 2 - canvasRect.left;
        const midY = (pts[0].y + pts[1].y) / 2 - canvasRect.top;
        const newTarget = Math.max(
          this.minZoom,
          Math.min(this.maxZoom, this.initialPinchScale * pinchRatio)
        );

        this.targetScale = newTarget;
        this.targetX = midX - this.cx - this.pinchWorldPoint.x * newTarget;
        this.targetY = midY - this.cy - this.pinchWorldPoint.y * newTarget;
      }
      return;
    }

    if (this.isDragging && this.activePointers.size === 1) {
      const dx = point.x - this.lastDragX;
      const dy = point.y - this.lastDragY;
      this.lastDragX = point.x;
      this.lastDragY = point.y;

      this.targetX += dx;
      this.targetY += dy;

      this.vx = dx * 0.7;
      this.vy = dy * 0.7;
    }
  }

  public onPointerUp(e: PointerEvent) {
    this.activePointers.delete(e.pointerId);
    if (this.activePointers.size === 1) {
      const remaining = Array.from(this.activePointers.values())[0];
      this.isDragging = true;
      this.lastDragX = remaining.x;
      this.lastDragY = remaining.y;
      this.vx = 0;
      this.vy = 0;
    } else if (this.activePointers.size === 0) {
      this.isDragging = false;
      this.initialPinchDist = 0;
      this.initialPinchMidpoint = { x: 0, y: 0 };
      this.pinchWorldPoint = { x: 0, y: 0 };
    }
  }

  /**
   * Double-click/double-tap to toggle between zoomed sector view and full screen overview
   */
  public cancelPointers() {
    this.activePointers.clear();
    this.isDragging = false;
    this.initialPinchDist = 0;
    this.pinchWorldPoint = { x: 0, y: 0 };
    this.vx = 0;
    this.vy = 0;
  }

  private localPoint(clientX: number, clientY: number, rect?: DOMRect) {
    return { x: rect ? clientX - rect.left : clientX, y: rect ? clientY - rect.top : clientY };
  }

  public onDoubleTap(mouseX: number, mouseY: number) {
    if (this.targetScale > 1.4) {
      this.reset();
    } else {
      const newTarget = 2.2;
      const wx = (mouseX - this.cx - this.targetX) / this.targetScale;
      const wy = (mouseY - this.cy - this.targetY) / this.targetScale;

      this.targetScale = newTarget;
      this.targetX = mouseX - this.cx - wx * newTarget;
      this.targetY = mouseY - this.cy - wy * newTarget;
    }
  }

  public zoomIn() {
    this.targetScale = Math.min(this.maxZoom, this.targetScale * 1.25);
  }

  public zoomOut() {
    this.targetScale = Math.max(this.minZoom, this.targetScale * 0.8);
  }

  public focusOn(targetWorldX: number, targetWorldY: number, zoom = 1.8) {
    this.targetScale = Math.min(this.maxZoom, Math.max(this.minZoom, zoom));
    this.targetX = (this.cx - targetWorldX) * this.targetScale;
    this.targetY = (this.cy - targetWorldY) * this.targetScale;
    this.vx = 0;
    this.vy = 0;
  }

  public clampPan() {
    if (!this.worldWidth || !this.worldHeight) return;
    const halfViewportWidth = this.cx / Math.max(this.targetScale, 0.01);
    const halfViewportHeight = this.cy / Math.max(this.targetScale, 0.01);
    const minX = this.cx - this.worldWidth - halfViewportWidth;
    const maxX = this.cx + halfViewportWidth;
    const minY = this.cy - this.worldHeight - halfViewportHeight;
    const maxY = this.cy + halfViewportHeight;
    this.targetX = Math.min(maxX, Math.max(minX, this.targetX));
    this.targetY = Math.min(maxY, Math.max(minY, this.targetY));
  }

  public reset() {
    this.targetScale = this.defaultScale;
    this.targetX = 0;
    this.targetY = 0;
    this.vx = 0;
    this.vy = 0;
  }

  public tick(delta: number) {
    if (!this.isDragging && this.activePointers.size === 0 && (Math.abs(this.vx) > 0.05 || Math.abs(this.vy) > 0.05)) {
      this.targetX += this.vx * delta;
      this.targetY += this.vy * delta;
      const friction = Math.pow(0.88, delta);
      this.vx *= friction;
      this.vy *= friction;
    }

    this.clampPan();
    const ease = 0.16 * Math.min(delta, 2);
    this.scale += (this.targetScale - this.scale) * ease;
    this.x += (this.targetX - this.x) * ease;
    this.y += (this.targetY - this.y) * ease;

    this.world.scale.set(this.scale);
    this.world.position.set(this.cx + this.x, this.cy + this.y);
  }
}
