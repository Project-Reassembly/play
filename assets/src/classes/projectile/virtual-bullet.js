import { debug } from "../../play/debug.js";
import { PhysicalObject } from "../physical.js";
import { Bullet } from "./bullet.js";
/** Bullet with a round hitbox that only exists for one frame. */
class VirtualBullet extends Bullet {
  team = "neutral";
  _ent = null;
  constructor() {
    super();
    delete this.entity;
  }
  draw() {
    if (debug.hitboxes) {
      push();
      noFill();
      stroke(0, 255, 0);
      strokeWeight(2);
      circle(this.x, this.y, this.hitSize);
      pop();
    }
  }
  step(dt) {
    if (!this.remove) {
      this.intervalTick();
      this.checkCollisions();
      this.remove = true;
    }
  }
  get entity() {
    return this._ent ?? { team: this.team };
  }
  set entity(_) {
    this._ent = _;
  }
  /**@param {PhysicalObject} other  */
  collidesWith(other) {
    return other && this.pos.sub(other.pos).magnitude < this.hitSize * 0.5 + other.hitSize * 0.5;
  }
}
export { VirtualBullet };

