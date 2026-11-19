import { col } from "../../core/color.js";
import { Vector } from "../../core/number.js";
import { Particle } from "./particle.js";
/**
 * @typedef {{
 *   lifetime: number,
 *   light: number,
 *   strokeFrom: number,
 *   strokeTo: number,
 *   colours: import("../../core/color.js").color[],
 * }} LinearParticleModel
 */

/** An extended shape particle class which connects 2 points. @extends {Particle<LinearParticleModel>} */
export class LinearParticle extends Particle {
  /**@type {Vector[]} */
  positions = [];
  /**
   * @param {LinearParticleModel} vfx
   * @param {Vector[]} positions
   */
  constructor(vfx, positions) {
    const p1 = positions[0];
    super(vfx, p1.x, p1.y, 0);
    this.positions = positions;
    this.stroke = vfx.strokeFrom;
    this.color = vfx.colours[0];
  }
  istep(dt) {
    const lf = this.lifetime / this.vfx.lifetime;
    this.stroke = this.vfx.strokeFrom * lf + this.vfx.strokeTo * (1 - lf);

    this.colour = col.interp(this.vfx.colours, 1 - lf);
  }
  draw() {
    push();
    noFill();
    col.stroke(this.colour);
    strokeWeight(this.stroke);

    beginShape();
    for (const p of this.positions) {
      vertex(p.x, p.y);
    }
    endShape();

    pop();
  }
}
