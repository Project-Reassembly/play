import { Vector } from "../../core/number.js";
import { Particle } from "./particle.js";
// An extended particle class which connects 2 points
class LinearParticle extends Particle {
  /**@type {Vector[]} */
  positions = [];
  size = 0;
  /**
   * @param {Vector[]} positions
   */
  constructor(
    positions,
    lifetime,
    colours,
    light,
    strokeFrom,
    strokeTo,
    space = false
  ) {
    let pos1 = positions[0] ?? Vector.ZERO;
    let pos2 = positions.at(-1) ?? Vector.ZERO;
    let center = pos1.add(pos2).scale(0.5);
    super(center.x, center.y, 0, lifetime, 0, 0, colours, 0, light, space);
    this.pos1 = pos1;
    this.pos2 = pos2;
    this.positions = positions;
    this.strokeFrom = strokeFrom;
    this.stroke = strokeFrom;
    this.strokeTo = strokeTo;
    this.size = this.pos2.sub(this.pos1).magnitude;
  }
  calcSizes(lf) {
    this.stroke = this.strokeFrom * lf + this.strokeTo * (1 - lf);
  }
  calcDecels(dt) {}
  movement(dt) {}
  draw() {
    if (this.positions.length >= 2) {
      push();
      noFill();
      //Interpolate colour
      stroke(this.colour);
      strokeWeight(this.stroke);
      //Draw the particle
      this.actualDraw();
      pop();
    }
  }
  actualDraw() {
    let prev = this.positions[0];
    for (let p = 1; p < this.positions.length; p++) {
      let curr = this.positions[p];
      line(prev.x, prev.y, curr.x, curr.y);
      prev = curr;
    }
  }
}
export { LinearParticle };
