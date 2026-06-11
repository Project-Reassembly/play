import { col } from "../../../core/color.js";
import { Vector } from "../../../core/number.js";
import { ImageContainer } from "../../../core/ui.js";
import { patternedBulletExpulsion } from "../../projectile/yeeter.js";
import { World } from "../../world/world.js";
import { Entity } from "../entity.js";
import { Model } from "./model.js";
import { Orientation } from "./orientation.js";

export class ModelPart {
  x = 0;
  y = 0;
  direction = 0;
  width = 0;
  height = 0;
  slide = 0;
  image = null;
  shape = "rect";
  colour = col.mono(100);
  rotate = true;
  absRot = false;
  anchor = "";
  outl = false;
  hidden = false;
  init() {
    this.colour = col.convert(this.colour);
  }
  /**Returns the *relative* position of this part, and its rotation.
   * @param {Model} model The model to draw on.
   * @returns {Orientation} */
  pos(model) {
    /**@type {Orientation} */
    let origin = this.anchor === "" ? Orientation.ZERO : model.pos(this.anchor);

    let relpos = new Vector(this.x, this.y).add(Vector.fromAngle(this.direction).scale(this.slide));
    let rotpos = relpos.rotate(origin.rotation);
    let np = origin.addParts(rotpos.x, rotpos.y, this.direction);
    return np;
  }

  /**@param {Model} model  */
  draw(model, x, y, rotation) {
    if (this.hidden) return;
    let p = this.pos(model).rotate(rotation).addParts(x, y);
    if (this.image instanceof ImageContainer || typeof this.image === "string") {
      //If it's an image, draw it
      ImageContainer.draw(
        this.image,
        p.x,
        p.y,
        this.width,
        this.height,
        this.rotate ? radians(p.rotation) : 0,
      );
    } else {
      //If it isn't, draw a rectangle
      push();
      if (this.outl) {
        strokeWeight(5);
        col.stroke(this.colour);
        noFill();
      } else col.fill(this.colour);
      rotatedShape(
        this.shape,
        p.x,
        p.y,
        this.width,
        this.height,
        this.rotate ? radians(p.rotation) : 0,
      );
      pop();
    }
  }
  hitTest(model, x, y, rotation, hx, hy, hsize) {
    let finalPos = this.pos(model).rotate(rotation).addParts(x, y).pos;
    return finalPos.distanceToXY(hx, hy) <= hsize + (this.width + this.height) / 4;
  }
  /**
   * Fires bullets from this part.
   * @param {Model} model Model to fire from.
   * @param {number} ox X position of the center of the model.
   * @param {number} oy Y position of the center of the model.
   * @param {number} od Direction of the model. 0 is right.
   * @param {Integrate.Unconstructed<Bullet>} bullet Bullet definition to fire.
   * @param {number} spread Random spread.
   * @param {number} spacing Even spread.
   * @param {number} amount Number of bullets to fire.
   * @param {World} world World to fire them into.
   * @param {Entity?} entity Entity to associate the bullets with.
   * @returns 
   */
  eject(model, ox, oy, od, bullet, spread, spacing, amount, world, entity) {
    let p = this.pos(model).rotate(od).addParts(ox, oy);
    patternedBulletExpulsion(p.x, p.y, bullet, amount, p.rotation, spread, spacing, world, entity);
  }
}