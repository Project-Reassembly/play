import { constructFromType } from "../../../core/constructor.js";
import Integrate from "../../../lib/integrate.js";
import { Bullet } from "../../projectile/bullet.js";
import { Timer } from "../../timer.js";
import { World } from "../../world/world.js";
import { Entity } from "../entity.js";
import { ModelAnimation, ModelMovement } from "./model-animation.js";
import { ModelPart } from "./model-part.js";
import { Orientation } from "./orientation.js";

export class Model {
  /**@type {{[name: string]: ModelPart}} */
  parts = {};
  /**@type {{[name: string]: ModelAnimation}} */
  animations = {};
  /**@type {ModelMovement[]} */
  constant = [];
  /**@type {Timer} */
  timer = new Timer();
  init() {
    for (const name in this.parts) {
      const element = this.parts[name];
      this.parts[name] = constructFromType(element, ModelPart);
      // console.log(name, this.parts[name].pos(this, 0, 0, 0));
    }
    for (const name in this.animations) {
      const element = this.animations[name];
      this.animations[name] = constructFromType({ movements: element }, ModelAnimation);
    }
    this.constant.forEach((v, i, a) => (a[i] = constructFromType(v, ModelMovement)));
  }
  /** Tries to fire an animation. Returns `true` if the animation exists (and was fired), and `false` otherwise. */
  fire(name) {
    if (name in this.animations) return void this.animations[name].on(this) || true;
    return false;
  }
  /** Stops all animations instantly. */
  freeze() {
    this.timer.cancel("*");
  }
  /** Moves a part. @param {string} name  */
  move(name, x, y, rot, slide) {
    const p = this.parts[name];
    if (!p) {
      console.warn("Animation references part '" + name + "', which doesn't exist.");
      return;
    }
    p.x += x;
    p.y += y;
    p.direction += rot;
    p.slide += slide;
  }
  /** Gets a model part. @param {string} name  */
  get(name) {
    const p = this.parts[name];
    if (!p) {
      console.warn("Animation references part '" + name + "', which doesn't exist.");
      return null;
    }
    return p;
  }
  /** Gets the position of a part relative to this model's origin. */
  pos(name) {
    const p = this.parts[name];
    if (!p) {
      console.warn("Animation references part '" + name + "', which doesn't exist.");
      return new Orientation();
    }
    return p.pos(this);
  }
  tick() {
    this.timer.tick();
    this.constant.forEach((m) =>
      this.move(
        m.part,
        m.dx / m.duration,
        m.dy / m.duration,
        m.drot / m.duration,
        m.dslide / m.duration,
      ),
    );
  }
  /** Draws the model at a position. */
  draw(x, y, rotation) {
    for (const part in this.parts) {
      const element = this.parts[part];

      element.draw(this, x, y, rotation);
    }
  }
  /**
   * Returns the first part of this model found in a circular area.
   * @param {number} x x position of the center of the model.
   * @param {number} y Y position of the center of the model.
   * @param {number} rotation Rotation of the model.
   * @param {number} hx X position of the center of the area.
   * @param {number} hy Y position of the center of the area.
   * @param {number} hsize Radius of the circular area.
   * @returns 
   */
  hitTest(x, y, rotation, hx, hy, hsize) {
    for (const part in this.parts) {
      if (this.parts[part].hitTest(this, x, y, rotation, hx, hy, hsize)) return part;
    }
    return null;
  }
  /**
   * Fires bullets from a part of this model.
   * @param {string} name Part to fire from.
   * @param {number} ox X position of the center of the model.
   * @param {number} oy Y position of the center of the model.
   * @param {number} od Direction of the model. 0 is right.
   * @param {Integrate.Unconstructed<Bullet>} bullet Bullet definition to fire.
   * @param {number} spread Random spread.
   * @param {number} spacing Even spread.
   * @param {number} amount Number of bullets to fire.
   * @param {World} world World to fire them into.
   * @param {Entity?} entity Entity to associate the bullets with.
   */
  eject(name, ox, oy, od, bullet, spread, spacing, amount, world, entity) {
    const p = this.parts[name];
    if (!p) {
      console.warn("Animation references part '" + name + "', which doesn't exist.");
      return;
    }
    p.eject(this, ox, oy, od, bullet, spread, spacing, amount, world, entity);
  }
}
