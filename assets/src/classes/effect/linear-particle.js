import { Vector } from "../../core/number.js";
import { Particle } from "./particle.js";
// An extended particle class which connects 2 points
class LinearParticle extends Particle {
  pos1 = Vector.ZERO;
  pos2 = Vector.ZERO;
  size = 0;
  constructor(x1, y1, x2, y2, lifetime, colours, light, strokeFrom, strokeTo) {
    let pos1 = new Vector(x1, y1);
    let pos2 = new Vector(x2, y2);
    let center = pos1.add(pos2).scale(0.5);
    super(center.x, center.y, 0, lifetime, 0, 0, colours, 0, light);
    this.pos1 = pos1;
    this.pos2 = pos2;
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
    push();
    noFill();
    //Interpolate colour
    stroke(this.colour);
    strokeWeight(this.stroke);
    //Draw the particle
    this.actualDraw();
    pop();
  }
  actualDraw() {
    line(this.pos1.x, this.pos1.y, this.pos2.x, this.pos2.y);
  }
}
export { LinearParticle };
