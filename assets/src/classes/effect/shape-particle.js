import { Vector, colinterp } from "../../core/number.js";
import { rotatedShape } from "../../core/ui.js";
class ShapeParticle {
  #rotOffset;
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
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.lifetime = lifetime;
    this.decel = decel;
    this.shape = shape;
    this.remove = false;
    this.colours = colours;
    this.colour = this.colours[0];
    this.maxLifetime = lifetime;
    this.sizeXFrom = sizeXFrom;
    this.sizeXTo = sizeXTo;
    this.sizeX = sizeXFrom;
    this.sizeYFrom = sizeYFrom;
    this.sizeYTo = sizeYTo;
    this.sizeY = sizeYFrom;
    this.rotateSpeed = rotateSpeed;
    this.#rotOffset = 0;
    this.light = light;
  }
  step(dt) {
    if (this.lifetime >= dt) {
      //Interpolate size
      let lf = this.calcLifeFract();
      this.sizeX = this.sizeXFrom * lf + this.sizeXTo * (1 - lf);
      this.sizeY = this.sizeYFrom * lf + this.sizeYTo * (1 - lf);
      //Move
      this.moveToVct(
        new Vector(this.x, this.y).add(
          Vector.fromAngleRad(this.direction).scale(this.speed * dt)
        )
      );
      //Decelerate
      if (this.speed >= this.decel) {
        this.speed -= this.decel * dt;
      } else {
        this.speed = 0;
      }

      if (this.rotateSpeed >= this.decel) {
        this.rotateSpeed -= this.decel * dt;
      } else {
        this.rotateSpeed = 0;
      }

      if (this.rotateSpeed) {
        this.#rotOffset += this.rotateSpeed * dt;
      }
      //Colours
      this.colour = colinterp(this.colours, 1 - lf);
      //Lifetime
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
  }
  calcLifeFract() {
    return this.lifetime / this.maxLifetime;
  }
  moveToVct(vct) {
    this.moveTo(vct.x, vct.y);
  }
  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
  draw() {
    push();
    noStroke();
    fill(255);
    //Interpolate colour
    fill(this.colour);
    //Draw the particle
    rotatedShape(
      this.shape,
      this.x,
      this.y,
      this.sizeX,
      this.sizeY,
      this.direction + this.#rotOffset + HALF_PI
    );
    pop();
  }
  get uiX() {
    return (this.x - ui.camera.x) * ui.camera.zoom;
  }
  get uiY() {
    return (this.y - ui.camera.y) * ui.camera.zoom;
  }
}
export { ShapeParticle };
