import { Entity } from "./entity.js";

/** Stationary entity. */
export class TankComponent extends Entity {
  speed = 0;
  relX = 0;
  relY = 0;
  init() {
    this.relX = this.x;
    this.relY = this.y;
  }
  _approachTarget() {}
  serialise() {
    this.x = this.relX;
    this.y = this.relY;
    return super.serialise();
  }
  static applyExtraProps(ent, created) {
    super.applyExtraProps(ent, created);
    ent.relX = created.x;
    ent.relY = created.y;
  }
}
