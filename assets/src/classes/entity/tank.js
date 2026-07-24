import { constructFromType } from "../../core/constructor.js";
import { Vector } from "../../core/number.js";
import { InventoryEntity } from "./inventory-entity.js";
import { TankComponent } from "./tank-component.js";

export class Tank extends InventoryEntity {
  inventorySize = 1;
  registryName = "tank";
  aiType = "hostile";
  /** @type {TankComponent[]} */
  parts = [];
  init() {
    this.parts.forEach((v, i, a) => (a[i] = constructFromType(v, TankComponent)));
  }
  tick() {
    super.tick();
    let dead = true;
    for (const p of this.parts) {
      if (!p.dead) dead = false;
      else continue;
      p.pos = new Vector(p.relX, p.relY).rotate(p.direction, true).add(this.pos, true);
    }
    if (dead) this.dead = true;
  }
  ondestroyed() {
    this.parts.forEach((t) => (t.dead = true));
  }
}


