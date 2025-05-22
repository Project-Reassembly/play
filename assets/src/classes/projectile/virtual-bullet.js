import { Bullet } from "./bullet.js";
import { PhysicalObject } from "../physical.js";
import { Block } from "../block/block.js";
class VirtualBullet extends Bullet {
  team = "neutral";
  _ent = null;
  constructor() {
    super();
    delete this.entity;
  }
  draw() {
    PhysicalObject.prototype.draw.call(this);
  }
  step(dt) {
    if (!this.remove) this.intervalTick();
    this.checkCollisions();
    this.remove = true;
  }
  get entity() {
    return this._ent ?? { team: this.team };
  }
  set entity(_) {
    this._ent = _;
  }
}
export { VirtualBullet };
