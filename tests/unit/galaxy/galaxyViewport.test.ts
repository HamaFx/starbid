import { describe, expect, it, vi } from "vitest";
import { GalaxyViewport } from "@/components/galaxy/GalaxyViewport";
import { buildSectorIndex, galaxySectorForPoint, nearbySectorKeys } from "@/lib/math/galaxySectors";
import { clampTelemetryPosition } from "@/components/galaxy/GalaxyTelemetryOverlay";

function viewport() {
  const world = {
    pivot: { set: vi.fn() },
    position: { set: vi.fn() },
    scale: { set: vi.fn() },
  } as never;
  return new GalaxyViewport(world, 200, 100);
}

describe("GalaxyViewport", () => {
  it("clamps telemetry cards to the viewport edges", () => {
    expect(clampTelemetryPosition(0, 0, 800, 600).left).toBeGreaterThan(0);
    expect(clampTelemetryPosition(800, 600, 800, 600).left).toBeLessThan(800);
    expect(clampTelemetryPosition(400, 300, 800, 600).top).toBeLessThanOrEqual(600);
  });

  it("assigns deterministic sectors and nearby sector windows", () => {
    expect(galaxySectorForPoint({ x: 999, y: 501 }, 500).key).toBe("1:1");
    expect(nearbySectorKeys({ x: 0, y: 0, key: "0:0" }, 1)).toHaveLength(9);
    expect(buildSectorIndex([{ x: 1, y: 1 }, { x: 501, y: 1 }], 500).size).toBe(2);
  });
  it("focuses a world point at the viewport center", () => {
    const camera = viewport();
    camera.focusOn(100, 50, 2);
    expect(camera.targetScale).toBe(2);
    expect(camera.targetX).toBe(200);
    expect(camera.targetY).toBe(100);
  });

  it("automatically zooms out when the world grows beyond the viewport", () => {
    const camera = viewport();
    camera.updateWorldRadius(1000, 4000, 2200);
    expect(camera.minZoom).toBeLessThan(1);
    expect(camera.targetScale).toBe(1);
  });

  it("clamps exploration panning to the persistent world bounds", () => {
    const camera = viewport();
    camera.updateWorldRadius(1000, 4000, 2200);
    camera.targetX = 999999;
    camera.targetY = -999999;
    camera.tick(1);
    expect(camera.targetX).toBeLessThan(999999);
    expect(camera.targetY).toBeGreaterThan(-999999);
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
