import { col } from "../../core/color.js";
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
 *   strokeFrom: number,
 *   strokeTo: number,
 *   radiusFrom: number,
 *   radiusTo: number,
 *   colours: import("../../core/color.js").color[],
 *   space: boolean,
 * }} WaveParticleModel
 */

/** A hollow circle particle. @extends {Particle<WaveParticleModel>}*/
export class WaveParticle extends Particle {
  /**
   *
   * @param {WaveParticleModel} vfx
   * @param {number} x
   * @param {number} y
   */
  constructor(vfx, x, y) {
    super(vfx, x, y);
    this.color = vfx.colours[0];
    this.width = vfx.widthFrom;
    this.radius = vfx.radiusFrom;
    this.stroke = vfx.strokeFrom;
  }
  istep(dt) {
    const lf = this.lifetime / this.vfx.lifetime;
    this.radius = this.vfx.radiusFrom * lf + this.vfx.radiusTo * (1 - lf);
    this.stroke = this.vfx.strokeFrom * lf + this.vfx.strokeTo * (1 - lf);

    this.color = col.interp(this.vfx.colours, 1 - lf);
  }
  draw() {
    push();
    col.stroke(this.color);
    strokeWeight(this.stroke);
    noFill();
    circle(this.x, this.y, this.radius*2);
    pop();
  }
}

/** Creates a wave particle with a one-off visual effect. Shouldn't be used. @deprecated. */
export function legacyWaveParticle(x, y, lifetime, fromRadius, toRadius, colours, strokeFrom, strokeTo, light = 0, space = false) {
  return new WaveParticle({ lifetime, radiusFrom: fromRadius, radiusTo: toRadius, colours, strokeFrom, strokeTo, light, space }, x, y);
}
