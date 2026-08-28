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

  public updateWorldRadius(radius: number) {
    this.worldRadius = Math.max(0, radius);
    const viewportRadius = Math.min(this.cx, this.cy);
    const fitScale = this.worldRadius > 0 ? Math.min(1, viewportRadius / this.worldRadius) : 1;
    if (this.targetScale > fitScale) {
      this.targetScale = fitScale;
      this.targetX = 0;
      this.targetY = 0;
    }
  }

  // Multi-touch pinch tracking
  private activePointers = new Map<number, { x: number; y: number }>();
  private initialPinchDist = 0;
  private initialPinchScale = 1.0;
  private initialPinchMidpoint = { x: 0, y: 0 };

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
    this.world.pivot.set(cx, cy);
  }

  /**
   * Cursor-anchored smooth wheel & trackpad pinch zooming
   */
  public onWheel(deltaY: number, mouseX: number, mouseY: number, isPinch = false) {
    const zoomStep = isPinch ? Math.exp(-deltaY * 0.015) : deltaY < 0 ? 1.15 : 0.87;
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
  public onPointerDown(e: PointerEvent) {
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.activePointers.size === 1) {
      this.isDragging = true;
      this.lastDragX = e.clientX;
      this.lastDragY = e.clientY;
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
    }
  }

  /**
   * Pointer move handling with momentum drag and multi-touch pinch
   */
  public onPointerMove(e: PointerEvent, canvasRect: DOMRect) {
    if (!this.activePointers.has(e.pointerId)) return;
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

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

        const initialMidX = this.initialPinchMidpoint.x - canvasRect.left;
        const initialMidY = this.initialPinchMidpoint.y - canvasRect.top;
        const wx = (initialMidX - this.cx - this.targetX) / this.targetScale;
        const wy = (initialMidY - this.cy - this.targetY) / this.targetScale;

        this.targetScale = newTarget;
        this.targetX = midX - this.cx - wx * newTarget;
        this.targetY = midY - this.cy - wy * newTarget;
      }
      return;
    }

    if (this.isDragging && this.activePointers.size === 1) {
      const dx = e.clientX - this.lastDragX;
      const dy = e.clientY - this.lastDragY;
      this.lastDragX = e.clientX;
      this.lastDragY = e.clientY;

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
    }
  }

  /**
   * Double-click/double-tap to toggle between zoomed sector view and full screen overview
   */
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

    const ease = 0.16 * Math.min(delta, 2);
    this.scale += (this.targetScale - this.scale) * ease;
    this.x += (this.targetX - this.x) * ease;
    this.y += (this.targetY - this.y) * ease;

    this.world.scale.set(this.scale);
    this.world.position.set(this.cx + this.x, this.cy + this.y);
  }
}
