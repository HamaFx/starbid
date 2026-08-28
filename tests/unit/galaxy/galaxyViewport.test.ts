import { describe, expect, it, vi } from "vitest";
import { GalaxyViewport } from "@/components/galaxy/GalaxyViewport";

function viewport() {
  const world = {
    pivot: { set: vi.fn() },
    position: { set: vi.fn() },
    scale: { set: vi.fn() },
  } as never;
  return new GalaxyViewport(world, 200, 100);
}

describe("GalaxyViewport", () => {
  it("focuses a world point at the viewport center", () => {
    const camera = viewport();
    camera.focusOn(100, 50, 2);
    expect(camera.targetScale).toBe(2);
    expect(camera.targetX).toBe(200);
    expect(camera.targetY).toBe(100);
  });

  it("resets scale and pan", () => {
    const camera = viewport();
    camera.focusOn(100, 50, 2);
    camera.reset();
    expect(camera.targetScale).toBe(1);
    expect(camera.targetX).toBe(0);
    expect(camera.targetY).toBe(0);
  });

  it("keeps the cursor world point anchored during wheel zoom", () => {
    const camera = viewport();
    camera.onWheel(-1, 250, 120);
    const scale = camera.targetScale;
    const worldX = (250 - 200) / 1;
    const worldY = (120 - 100) / 1;
    expect(camera.targetX + worldX * scale).toBeCloseTo(50);
    expect(camera.targetY + worldY * scale).toBeCloseTo(20);
  });
});
