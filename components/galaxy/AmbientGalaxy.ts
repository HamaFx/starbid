import { Container, Graphics } from "pixi.js";
import { GALAXY_SPIRAL_ARMS, GALAXY_SPIRAL_TWIST, GALAXY_Y_SCALE } from "@/lib/math/galaxyLayout";

type AmbientGalaxyOptions = { count?: number; seed?: string };

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0) / 4294967295;
}

export class AmbientGalaxy {
  public readonly container = new Container();
  private readonly graphics = new Graphics();
  private readonly count: number;
  private readonly seed: string;

  constructor(maxRadius: number, options: AmbientGalaxyOptions = {}) {
    this.count = options.count ?? 900;
    this.seed = options.seed ?? "starboard-galaxy";
    this.container.addChild(this.graphics);
    this.draw(maxRadius);
  }

  private draw(maxRadius: number) {
    const radius = maxRadius * 0.98;
    const center = maxRadius;
    this.graphics.ellipse(center, center, radius, radius * GALAXY_Y_SCALE).fill({ color: 0x172554, alpha: 0.08 });

    for (let index = 0; index < this.count; index += 1) {
      const radial = Math.pow(hash(`${this.seed}:${index}:r`), 0.62);
      const arm = Math.floor(hash(`${this.seed}:${index}:arm`) * GALAXY_SPIRAL_ARMS);
      const angle = arm * (Math.PI * 2 / GALAXY_SPIRAL_ARMS) + radial * GALAXY_SPIRAL_TWIST + (hash(`${this.seed}:${index}:a`) - 0.5) * 0.65;
      const x = center + Math.cos(angle) * radius * radial;
      const y = center + Math.sin(angle) * radius * radial * GALAXY_Y_SCALE;
      const inner = radial < 0.24;
      this.graphics.circle(x, y, inner ? 1.2 : 0.55 + hash(`${this.seed}:${index}:s`) * 0.8).fill({
        color: inner ? 0xfbbf24 : index % 5 === 0 ? 0x38bdf8 : 0xffffff,
        alpha: inner ? 0.25 : 0.12 + hash(`${this.seed}:${index}:alpha`) * 0.25,
      });
    }

    for (let arm = 0; arm < GALAXY_SPIRAL_ARMS; arm += 1) {
      for (let segment = 0; segment < 28; segment += 1) {
        const radial = 0.18 + (segment / 27) * 0.74;
        const angle = arm * (Math.PI * 2 / GALAXY_SPIRAL_ARMS) + radial * GALAXY_SPIRAL_TWIST;
        const x = center + Math.cos(angle) * radius * radial;
        const y = center + Math.sin(angle) * radius * radial * GALAXY_Y_SCALE;
        this.graphics.ellipse(x, y, maxRadius * 0.16 * (1 - radial * 0.45), maxRadius * 0.025).fill({
          color: arm % 2 === 0 ? 0x38bdf8 : 0xfbbf24,
          alpha: 0.012,
        });
      }
    }
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
