import { col } from "../../core/color.js";
import { rotatedShape, rotatedShapeExt } from "../../core/ui.js";
import { Particle } from "./particle.js";

/**
 * @typedef {{
 *   lifetime: number,
 *   direction: number,
 *   speed: number,
 *   decel: number,
 *   rotateSpeed: number,
 *   light: number,
 *   shape: "circle"|"rect"|"square"|"ellipse"|"triangle"|"rhombus"|"moved-triangle"|"inverted-triangle",
 *   widthFrom: number,
 *   widthTo: number,
 *   heightFrom: number,
 *   heightTo: number,
 *   colours: import("../../core/color.js").color[],
 *   space: boolean,
 * }} ShapeParticleModel
 */

/** A basic particle - a coloured shape. @extends {Particle<ShapeParticleModel>}*/
export class ShapeParticle extends Particle {
  /**
   *
   * @param {ShapeParticleModel} vfx
   * @param {number} x
   * @param {number} y
   * @param {number} direction
   */
  constructor(vfx, x, y, direction) {
    super(vfx, x, y, direction);
    this.color = vfx.colours[0];
    this.width = vfx.widthFrom;
    this.height = vfx.heightFrom;
  }
  istep(dt) {
    const lf = this.lifetime / this.vfx.lifetime;
    this.width = this.vfx.widthFrom * lf + this.vfx.widthTo * (1 - lf);
    this.height = this.vfx.heightFrom * lf + this.vfx.heightTo * (1 - lf);

    this.color = col.interp(this.vfx.colours, 1 - lf);
  }
  draw(g) {
    if (g) {
      g.push();
      col.fillOn(g, this.color);
      g.noStroke();
      rotatedShapeExt(g, this.vfx.shape, this.x, this.y, this.width, this.height, this.direction + this.rotoff + HALF_PI);
      g.pop();
    }
    push();
    col.fill(this.color);
    noStroke();
    rotatedShape(this.vfx.shape, this.x, this.y, this.width, this.height, this.direction + this.rotoff + HALF_PI);
    pop();
  }
}
/** Creates a shape particle with a one-off visual effect. Shouldn't be used. @deprecated. */
export function legacyShapeParticle(
  x,
  y,
  direction,
  lifetime,
  speed,
  decel,
  shape,
  colours,
  sizeXFrom,
  sizeXTo,
  sizeYFrom,
  sizeYTo,
  rotateSpeed,
  light = 0,
  space = false,
) {
  return new ShapeParticle(
    {
      lifetime,
      speed,
      decel,
      shape,
      colours,
      rotateSpeed,
      space,
      light,
      widthFrom: sizeXFrom,
      widthTo: sizeXTo,
      heightFrom: sizeYFrom,
      heightTo: sizeYTo,
    },
    x,
    y,
    direction,
  );
}
