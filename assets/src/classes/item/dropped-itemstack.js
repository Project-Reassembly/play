import { rnd } from "../../core/number.js";
import { drawImg } from "../../core/ui.js";
import { game } from "../../play/game.js";
import { Log } from "../../play/messaging.js";
import { Block } from "../block/block.js";
import { Entity } from "../entity/entity.js";
import { EquippedEntity, InventoryEntity } from "../entity/inventory-entity.js";
import { World } from "../world/world.js";
import { ItemStack } from "./item-stack.js";
class DroppedItemStack extends Entity {
  constructor() {
    super();
    delete this.team;
  }
  item = ItemStack.EMPTY;
  delay = 30;
  #delayLeft = 30;
  /**
   * 
   * @param {ItemStack} stack Item to drop.
   * @param {World} world world to drop it in.
   * @param {number} x 
   * @param {number} y 
   * @param {number} speed Initial speed of the item
   * @param {number} direction Direction to send the item in. Is random if not defined.
   */
  static create(stack, world, x = 0, y = 0, speed = 3, direction = NaN) {
    let item = new this();
    item.item = stack.copy();
    item.name = `Dropped ${stack.getItem()?.name}`
    item.init();
    item.addToWorld(world, x, y);
    item.speed = speed;
    if (!isNaN(+direction)) item.direction = +direction;
    else item.direction = rnd.float(0, 360);
  }
  init() {
    this.#delayLeft = this.delay;
    this.speed = rnd.float(2, 4);
    this.components = [];
    this.width = 10;
    this.height = 10;
  }
  damage() {
    return 0;
  }
  knock() {}
  tick() {
    if (this.dead) return;
    if (this.item.isEmpty()) {
      this.dead = true;
      return;
    }
    this.item.getItem().groundTick(this.x, this.y, this.world);
    this.#delayLeft--;
    if (this.#delayLeft <= 0)
      for (let ent of this.world.entities) {
        if (ent instanceof InventoryEntity && ent.collidesWith(this)) {
          let it = this.item.item;
          if (ent instanceof EquippedEntity) {
            let leftOver =
              ent.ammo.hasItem(it) ? ent.ammo.addItem(it, this.item.count) : this.item.count;
            if (!leftOver) {
              if (ent === game.player) {
                Log.send("Picked up " + this.item.toString(true));
              }
              this.item.count = 0;
            } else {
              let leftOver2 = ent.inventory.addItem(it, leftOver);
              if (!leftOver2) {
                if (ent === game.player) {
                  Log.send("Picked up " + this.item.toString(true));
                }
                this.item.count = 0;
              } else {
                if (ent === game.player) {
                  let newcount = this.item.count - leftOver2;
                  if (newcount > 0)
                    Log.send("Picked up " + this.item.getItem().name + "#-- x" + newcount);
                }
                this.item.count = leftOver2;
              }
            }
          } else {
            this.item.count = ent.inventory.addItem(it, this.item.count);
          }
          if (this.item.isEmpty()) {
            this.dead = true;
            return;
          }
        }
      }
    else {
      this.attributes.multiply("speed", 0.86);
      this.move(Math.cos(this.directionRad) * this.speed, Math.sin(this.directionRad) * this.speed);
    }
    this.tickGroundEffects();
  }
  tickGroundEffects() {
    let blockIn = this.world.getBlock(
      Math.floor(this.x / Block.size),
      Math.floor(this.y / Block.size),
      "blocks",
    );
    if (blockIn && blockIn.walkable) blockIn.steppedOnBy(this);
  }
  draw() {
    drawImg(this.item?.getItem()?.image ?? "error", this.x, this.y, 15, 15);
  }
  serialise() {
    return { "-": true, "stack": this.item.serialise(), "x": this.x, "y": this.y };
  }
}
export { DroppedItemStack };

