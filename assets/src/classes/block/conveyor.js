import { roundNum } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { drawImg, rotatedImg, ui } from "../../core/ui.js";
import { Log } from "../../play/messaging.js";
import { blockSize, Direction } from "../../scaling.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
import { ShootableObject } from "../physical.js";
import { Container } from "./container.js";
import { Crafter } from "./production/crafter.js";
class Conveyor extends Container {
  moveTime = 10;
  _progress = 0;
  rotatable = true;
  inventorySize = 1;
  selectable = false;
  shape = "straight";
  baseImg = "error";
  beltImg = "error";
  walkable = true;
  tick() {
    super.tick();
    if (!this.inventory.get(0) || this.inventory.get(0).isEmpty()) return;
    let vct = Direction.vectorOf(this.direction);
    let target =
      this.world.getBlock(this.gridX + vct.x, this.gridY + vct.y) ??
      this.world.getBlock(this.gridX + vct.x * 2 ** 0.5, this.gridY + vct.y * 2 ** 0.5);
    this.convey(target, this.gridX + vct.x, this.gridY + vct.y);
  }
  convey(target, posX, posY) {
    if (this._progress < this.moveTime) this._progress++;
    if (this._progress >= this.moveTime) {
      if (!target) {
        DroppedItemStack.create(
          this.inventory.get(0),
          this.world,
          posX * blockSize,
          posY * blockSize,
          100 / this.moveTime,
          degrees(this.direction),
        );
        this.inventory.clear();
        this._progress = 0;
      }
      let i = this.inventory.get(0);
      if (target instanceof Container && target.inventory.canAddItem(i.item, i.count)) {
        this._progress = 0;
        target.inventory.addItem(i.item, i.count);
        if (target instanceof Conveyor && this.direction !== target.direction) {
          target._progress = target.moveTime / 2;
        }
        this.inventory.clear();
      }
    }
  }
  draw() {
    drawImg(this.baseImg, this.x, this.y, this.tileSize * blockSize, this.tileSize * blockSize);
    rotatedImg(
      this.beltImg,
      this.x,
      this.y,
      this.tileSize * blockSize,
      this.tileSize * blockSize,
      this.direction,
    );
    ShootableObject.prototype.draw.call(this);
  }
  postDraw() {
    let vct = Direction.vectorOf(this.direction);
    let amt = this._progress / this.moveTime;
    if (this.inventory.get(0) && !this.inventory.get(0).isEmpty()) {
      if (this.shape === "straight")
        drawImg(
          this.inventory.get(0).getItem().image,
          this.x + vct.x * (amt - 0.5) * blockSize,
          this.y + vct.y * (amt - 0.5) * blockSize,
          20,
          20,
        );
    }
    super.postDraw();
  }
  /**
   * @param {Entity} entity
   */
  steppedOnBy(entity) {
    if (
      entity instanceof DroppedItemStack &&
      this.inventory.canAddItem(entity.item.item, entity.item.count)
    ) {
      this.inventory.addItem(entity.item.item, entity.item.count);
      entity.dead = true;
    }
    let vct = Direction.vectorOf(this.direction);
    let speed = blockSize / this.moveTime;
    entity.move(vct.x * speed, vct.y * speed);
  }
  read() {
    return this.inventory.get(0).item;
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      roundNum(60 / this.moveTime, 1) + " items/s",
      "🟨 -------------------- ⬜",
    ];
  }
}

class Unloader extends Conveyor {
  filter = "nothing";
  tick() {
    this.extract();
    super.tick();
  }
  extract() {
    let vct = Direction.vectorOf(this.direction);
    let extractFrom = this.world.getBlock(this.gridX - vct.x, this.gridY - vct.y);
    if (extractFrom instanceof Container) {
      if (extractFrom instanceof Crafter) {
        if (extractFrom.results.hasItem(this.filter) && this.inventory.canAddItem(this.filter)) {
          extractFrom.results.removeItem(this.filter);
          this.inventory.addItem(this.filter);
          return;
        }
      }
      if (extractFrom.inventory.hasItem(this.filter) && this.inventory.canAddItem(this.filter)) {
        extractFrom.inventory.removeItem(this.filter);
        this.inventory.addItem(this.filter);
      }
    }
  }
  /**
   *
   * @param {Entity} ent
   * @param {ItemStack} stack
   * @returns
   */
  interaction(ent, stack = ItemStack.EMPTY) {
    this.filter = stack.item;
    if (stack.getItem()) Log.send("Set filter to " + stack.getItem()?.name);
    else Log.send("Cleared filter.");
    ui.waitingForMouseUp = true;
    return true;
  }
  highlight(emphasised) {
    super.highlight(emphasised);
    if (this.filter && this.filter !== "nothing") {
      let img = Registries.items.get(this.filter).image;
      drawImg(img ?? "error", this.uiX - 9, this.uiY - 9, 15 * ui.camera.zoom, 15 * ui.camera.zoom);
    }
  }
  serialise() {
    let b = super.serialise();
    b.filter = this.filter;
    return b;
  }
  /**
   * @param {Unloader} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    super.applyExtraProps(deserialised, creator);
    deserialised.filter = creator.filter;
  }
  read() {
    return this.filter;
  }
}
export { Conveyor, Unloader };

