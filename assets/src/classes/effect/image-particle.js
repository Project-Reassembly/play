import { col } from "../../core/color.js";
import { rotatedImg } from "../../core/ui.js";
import { Particle } from "./particle.js";

/**
 * @typedef {{
 *   lifetime: number,
 *   direction: number,
 *   speed: number,
 *   decel: number,
 *   rotateSpeed: number,
 *   light: number,
 *   image: string,
 *   opacityFrom: number,
 *   opacityTo: number,
 *   widthFrom: number,
 *   widthTo: number,
 *   heightFrom: number,
 *   heightTo: number,
 *   space: boolean,
 * }} ImageParticleModel
 */

// A particle which shows an image.
/** @extends {Particle<ImageParticleModel>} */
export class ImageParticle extends Particle {
  /**
   * @param {ImageParticleModel} vfx
   * @param {number} x
   * @param {number} y
   * @param {number} direction
   */
  constructor(vfx, x, y, direction) {
    super(vfx, x, y, direction);
    this.width = vfx.widthFrom;
    this.height = vfx.heightFrom;
    this.opacity = vfx.opacityFrom;
  }
  istep(dt) {
    const lf = this.lifetime / this.vfx.lifetime;
    this.width = this.vfx.widthFrom * lf + this.vfx.widthTo * (1 - lf);
    this.height = this.vfx.heightFrom * lf + this.vfx.heightTo * (1 - lf);
    this.opacity = this.vfx.opacityFrom * lf + this.vfx.opacityTo * (1 - lf);
  }
  draw() {
    push();
    opacity(this.opacity);
    rotatedImg(
      this.vfx.image,
      this.x,
      this.y,
      this.width,
      this.height,
      this.direction + this.rotoff + HALF_PI,
    );
    pop();
  }
}

/** Creates an image particle with a one-off visual effect. Shouldn't be used. @deprecated. */
export function legacyImageParticle(
  x,
  y,
  direction,
  lifetime,
  speed,
  decel,
  image,
  opacityFrom,
  opacityTo,
  sizeXFrom,
  sizeXTo,
  sizeYFrom,
  sizeYTo,
  rotateSpeed,
  space = false,
) {
  return new ImageParticle(
    {
      lifetime,
      speed,
      decel,
      image,
      opacityFrom,
      opacityTo,
      widthFrom: sizeXFrom,
      widthTo: sizeXTo,
      heightFrom: sizeYFrom,
      heightTo: sizeYTo,
      rotateSpeed,
      space,
    },
    x,
    y,
    direction,
  );
}

