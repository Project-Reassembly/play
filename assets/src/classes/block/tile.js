import { drawImg } from "../../core/ui.js";
import { PhysicalObject } from "../physical.js";
import { Block } from "./block.js";
class Tile extends Block {
  speedMultiplier = 1;
  appliedStatus = "none";
  appliedStatusDuration = 0;
  damage = 0;
  damageType = "normal";
  buildable = true;
  drillSpeed = 1;
  tick() {}
  init() {
    PhysicalObject.prototype.init.call(this);
    delete this.x;
    delete this.y;
  }
  draw() {
    drawImg(
      this.image,
      this.x,
      this.y,
      this.tileSize * Block.size,
      this.tileSize * Block.size
    );
  }
  /**
   * Called whenever an entity walks on this tile.
   * @param {Entity} entity Entity that walked on this block.
   */
  entityWalksOn(entity) {
    entity.applyStatus(
      Registry.statuses.get(this.appliedStatus),
      this.appliedStatusDuration
    );
    entity.damage(this.damageType, this.damage);
  }
  /**@returns {SerialisedBlock} */
  serialise() {
    return {
      block: this.registryName,
    };
  }
}

export { Tile };

