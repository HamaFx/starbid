import type { Star } from "@/lib/types";
import { StarSprite } from "@/components/galaxy/StarSprite";

export type StarSpriteCallbacks = {
  onClick: (star: Star) => void;
  onHover: (star: Star | null, x: number, y: number) => void;
};

export class StarSpritePool {
  private readonly available: StarSprite[] = [];

  public acquire(
    star: Star,
    rank: number,
    maxRadius: number,
    callbacks: StarSpriteCallbacks,
    population: Pick<Star, "totalBidCents">[],
  ): StarSprite {
    const sprite = this.available.pop();
    if (!sprite) {
      return new StarSprite(star, rank, maxRadius, callbacks.onClick, callbacks.onHover, population);
    }
    sprite.reactivate(star, rank, maxRadius, population, callbacks);
    return sprite;
  }

  public release(sprite: StarSprite) {
    sprite.deactivate();
    this.available.push(sprite);
  }

  public clear() {
    this.available.forEach((sprite) => sprite.destroy());
    this.available.length = 0;
  }
}
