import { col } from "../../core/color.js";
import { Vector } from "../../core/number.js";
import { rotatedShape, rotatedShapeExt } from "../../core/ui.js";
class Particle {
  _rotOffset = 0;
  isSpace = false;
  constructor(
    x,
    y,
    direction = 0,
    lifetime = 30,
    speed = 4,
    decel = 0,
    colours = [col.red],
    rotateSpeed = 0,
    light = 0,
    space = false
  ) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.lifetime = lifetime;
    this.decel = decel;
    this.remove = false;
    this.colours = colours.map(col.convert);
    this.colour = this.colours[0] ?? 0;
    this.maxLifetime = lifetime;
    this.rotateSpeed = rotateSpeed;
    this.light = light;
    this.isSpace = space;
  }
  calcSizes(lf) {}
  calcLifeFract() {
    return this.lifetime / this.maxLifetime;
  }
  actualDraw(g) {
    if (g) rotatedShapeExt(g, "circle", this.x, this.y, 5, 5, 0);
    else rotatedShape("circle", this.x, this.y, 5, 5, 0);
  }

  calcDecels(dt) {
    //Decelerate
    if (this.speed >= this.decel) {
      this.speed -= this.decel * dt;
    } else {
      this.speed = 0;
    }

    //rotations
    if (this.rotateSpeed > 0) {
      if (this.rotateSpeed >= this.decel) {
        this.rotateSpeed -= this.decel * dt;
      } else {
        this.rotateSpeed = 0;
      }
    } else if (this.rotateSpeed < 0) {
      if (this.rotateSpeed <= -this.decel) {
        this.rotateSpeed += this.decel * dt;
      } else {
        this.rotateSpeed = 0;
      }
    }
  }
  movement(dt) {
    //Move
    this.moveToVct(
      new Vector(this.x, this.y).add(
        Vector.fromAngleRad(this.direction).scale(this.speed * dt)
      )
    );
    if (this.rotateSpeed) {
      this._rotOffset += this.rotateSpeed * dt;
    }
  }
  step(dt) {
    if (this.lifetime >= dt) {
      //Interpolate size
      const lf = this.calcLifeFract();
      this.calcSizes(lf);
      this.calcDecels(dt);

      this.movement(dt);

      //Colours
      this.colour = col.interp(this.colours, 1 - lf);
      //Lifetime
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
  }
  moveToVct(vct) {
    this.moveTo(vct.x, vct.y);
  }
  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
  draw(g) {
    if (g) {
      g.push();
      g.noStroke();
      //Interpolate colour
      col.fillOn(g, this.colour);
      //Draw the particle
      this.actualDraw(g);
      g.pop();
      return;
    }
    push();
    noStroke();
    //Interpolate colour
    col.fill(this.colour);
    //Draw the particle
    this.actualDraw();
    pop();
  }
  get uiX() {
    return (this.x - ui.camera.x) * ui.camera.zoom;
  }
  get uiY() {
    return (this.y - ui.camera.y) * ui.camera.zoom;
  }
}
export { Particle };

