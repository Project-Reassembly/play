import { Particle } from "./particle.js";
// A hollow circular particle.
class WaveParticle extends Particle {
  constructor(
    x,
    y,
    lifetime,
    fromRadius,
    toRadius,
    colours,
    strokeFrom,
    strokeTo,
    light
  ) {
    super(x, y, 0, lifetime, 0, 0, colours, 0, light);
    this.fromRadius = fromRadius;
    this.toRadius = toRadius;
    this.radius = fromRadius;
    this.strokeFrom = strokeFrom;
    this.stroke = strokeFrom;
    this.strokeTo = strokeTo;
  }
  calcSizes(lf) {
    this.radius = this.fromRadius * lf + this.toRadius * (1 - lf);
    this.stroke = this.strokeFrom * lf + this.strokeTo * (1 - lf);
  }
  movement(dt){}
  calcDecels(dt){}
  draw() {
    push();
    noFill();
    stroke(this.colour);
    strokeWeight(this.stroke);
    circle(this.x, this.y, this.radius * 2);
    pop();
  }
  get size() {
    return this.radius * 2;
  }
}
export { WaveParticle };
