import type { GalaxyViewport } from "@/components/galaxy/GalaxyViewport";
import type { StarSprite } from "@/components/galaxy/StarSprite";

export type GalaxySceneController = {
  resetCamera: () => void;
  focusCameraOn: (starId: string, zoom?: number) => void;
};

export function createGalaxySceneController(
  viewportRef: React.RefObject<GalaxyViewport | null>,
  spritesRef: React.RefObject<Map<string, StarSprite>>,
): GalaxySceneController {
  return {
    resetCamera: () => viewportRef.current?.reset(),
    focusCameraOn: (starId, zoom = 1.8) => {
      const position = spritesRef.current.get(starId)?.getWorldPosition();
      if (position) viewportRef.current?.focusOn(position.x, position.y, zoom);
    },
  };
}
