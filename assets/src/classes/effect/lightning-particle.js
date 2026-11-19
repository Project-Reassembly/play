import { col } from "../../core/color.js";
import { rnd, Vector } from "../../core/number.js";
import { LinearParticle } from "./linear-particle.js";
import { Particle } from "./particle.js";

/**
 * @typedef {{
 *   lifetime: number,
 *   light: number,
 *   strokeFrom: number,
 *   strokeTo: number,
 *   colours: import("../../core/color.js").color[],
 *   deviation: number,
 *   lineLength: number
 * }} LightningParticleModel
 */

/** Special case of linear particle which mutates positions randomly. @extends {Particle<LightningParticleModel>} */
export class LightningParticle extends LinearParticle {
  /**
   * @param {LightningParticleModel} vfx
   * @param {Vector[]} positions
   */
  constructor(vfx, positions = []) {
    if (positions.length >= 2) {
      const pos1 = positions[0],
        pos2 = positions.at(-1);
      let prev = pos1;
      const points = [pos1];
      const pl = positions.length - 1;
      for (let p = 1; p < pl; p++) {
        if (p % vfx.lineLength !== 0) continue;
        let curr = positions[p];
        let direction = curr.sub(prev);
        let pvec = Vector.fromAngle(direction.angle + 90);
        points.push(curr.add(pvec.scale(vfx.deviation * rnd.float(1, -1))));
        prev = curr;
      }
      points.push(pos2);
      super(vfx, points);
    } else super(vfx, positions);
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
/**@param {} glowEffect @deprecated */
export function legacyLightningParticle(positions = [], lifetime, colours, light, strokeFrom, strokeTo, deviation, lineLength, glowEffect, space = false) {
  const l = new LightningParticle({ strokeTo, strokeFrom, lineLength, space, deviation, light, colours, lifetime }, positions);
  return l;
}
