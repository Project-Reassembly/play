import { rotatedShape } from "../../core/ui.js";
import { Particle } from "./particle.js";
// A basic particle - a coloured shape.
class ShapeParticle extends Particle {
  constructor(
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
    light = 0
  ) {
    super(x, y, direction, lifetime, speed, decel, colours, rotateSpeed, light);
    this.shape = shape;
    this.sizeXFrom = sizeXFrom;
    this.sizeXTo = sizeXTo;
    this.sizeX = sizeXFrom;
    this.sizeYFrom = sizeYFrom;
    this.sizeYTo = sizeYTo;
    this.sizeY = sizeYFrom;
  }
  calcSizes(lf) {
    this.sizeX = this.sizeXFrom * lf + this.sizeXTo * (1 - lf);
    this.sizeY = this.sizeYFrom * lf + this.sizeYTo * (1 - lf);
  }
  actualDraw() {
    rotatedShape(
      this.shape,
      this.x,
      this.y,
      this.sizeX,
      this.sizeY,
      this.direction + this._rotOffset + HALF_PI
    );
  }
}
export { ShapeParticle };
