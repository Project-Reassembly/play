import { rotatedImg } from "../../core/ui.js";
import { Particle } from "./particle.js";
// A particle which shows an image.
class ImageParticle extends Particle {
  constructor(
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
    rotateSpeed
  ) {
    super(x, y, direction, lifetime, speed, decel, [[0, 0, 0]], rotateSpeed, 0);
    this.image = image;
    this.opacityFrom = opacityFrom;
    this.opacityTo = opacityTo;
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
    opacity(
      this.opacityFrom * this.calcLifeFract() +
        this.opacityTo * (1 - this.calcLifeFract())
    );
    rotatedImg(
      this.image,
      this.x,
      this.y,
      this.sizeX,
      this.sizeY,
      this.direction + this._rotOffset + HALF_PI
    );
  }
}
export { ImageParticle };
