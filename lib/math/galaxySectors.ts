import type { GalaxyPoint } from "@/lib/math/galaxyLayout";

export const GALAXY_SECTOR_SIZE = 500;

export type GalaxySector = { x: number; y: number; key: string };

export function galaxySectorForPoint(point: GalaxyPoint, sectorSize = GALAXY_SECTOR_SIZE): GalaxySector {
  const x = Math.floor(point.x / sectorSize);
  const y = Math.floor(point.y / sectorSize);
  return { x, y, key: `${x}:${y}` };
}

export function galaxySectorKey(x: number, y: number): string {
  return `${x}:${y}`;
}

export function buildSectorIndex<T extends { x: number; y: number }>(items: T[], sectorSize = GALAXY_SECTOR_SIZE): Map<string, T[]> {
  const index = new Map<string, T[]>();
  for (const item of items) {
    const sector = galaxySectorForPoint(item, sectorSize);
    const bucket = index.get(sector.key);
    if (bucket) bucket.push(item);
    else index.set(sector.key, [item]);
  }
  return index;
}

export function nearbySectorKeys(center: GalaxySector, range = 1): string[] {
  const keys: string[] = [];
  for (let y = center.y - range; y <= center.y + range; y += 1) {
    for (let x = center.x - range; x <= center.x + range; x += 1) keys.push(galaxySectorKey(x, y));
  }
  return keys;
}
