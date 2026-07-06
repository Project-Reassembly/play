import { roundNum } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { drawImg, rotatedImg, ui } from "../../core/ui.js";
import { Log } from "../../play/messaging.js";
import { blockSize, Direction } from "../../scaling.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
import { ShootableObject } from "../physical.js";
import { Block } from "./block.js";
import { Container } from "./container.js";
import { Crafter } from "./production/crafter.js";
class Conveyor extends Block {
  moveTime = 10;
  _progress = 0;
  rotatable = true;
  selectable = false;
  // shape = "straight";
  baseImg = "error";
  beltImg = "error";
  walkable = true;
  istack = ItemStack.EMPTY;
  tick() {
    super.tick();
    if (!this.istack || this.istack.isEmpty()) return;
    let vct = Direction.vectorOf(this.direction);
    let target = this.world.getBlock(this.gridX + vct.x, this.gridY + vct.y); // ??
    // this.world.getBlock(this.gridX + vct.x * 2 ** 0.5, this.gridY + vct.y * 2 ** 0.5);
    this.convey(target, this.gridX + vct.x, this.gridY + vct.y);
  }
  convey(target, posX, posY) {
    if (this._progress < this.moveTime) this._progress++;
    if (this._progress >= this.moveTime) {
      if (!target) {
        DroppedItemStack.create(
          this.istack,
          this.world,
          posX * blockSize,
          posY * blockSize,
          100 / this.moveTime,
          degrees(this.direction),
        );
        this.istack = ItemStack.EMPTY;
        this._progress = 0;
      }
      let i = this.istack;
      if (target instanceof Container && target.inventory.canAddItem(i.item, i.count)) {
        this._progress = 0;
        target.inventory.addItem(i.item, 1);
        this.istack.clear();
      } else if (target instanceof Conveyor && target.istack.isEmpty()) {
        this._progress = 0;
        target.istack = this.istack;
        this.istack = ItemStack.EMPTY;
        if (this.direction !== target.direction) target._progress = target.moveTime / 2;
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
    if (this.istack && !this.istack.isEmpty()) {
      // if (this.shape === "straight")
      drawImg(
        this.istack.getItem().image,
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
    if (entity instanceof DroppedItemStack && this.istack.isEmpty()) {
      this.istack = entity.item;
      entity.dead = true;
    }
    let vct = Direction.vectorOf(this.direction);
    let speed = blockSize / this.moveTime;
    entity.move(vct.x * speed, vct.y * speed);
  }
  read() {
    return this.istack.item;
  }
  createExtendedDetails() {
    return `#=-Throughput:\n  #h-${roundNum(60 / this.moveTime, 2)}#-- items/s`;
  }
  serialise() {
    let b = super.serialise();
    b.item = this.istack.serialise();
    return b;
  }
  /**
   * @param {Unloader} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    super.applyExtraProps(deserialised, creator);
    deserialised.istack = ItemStack.deserialise(creator.item);
  }
  value() {
    return this.istack.getItem()?.marketValue / 100 || 0;
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
        if (extractFrom.results.hasItem(this.filter) && this.istack.isEmpty()) {
          extractFrom.results.removeItem(this.filter, 1);
          this.istack = new ItemStack(this.filter);
          return;
        }
      }
      if (extractFrom.inventory.hasItem(this.filter) && this.istack.isEmpty()) {
        extractFrom.inventory.removeItem(this.filter, 1);
        this.istack = new ItemStack(this.filter);
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
      drawImg(
        img,
        this.uiX - 9 * ui.camera.zoom,
        this.uiY - 9 * ui.camera.zoom,
        15 * ui.camera.zoom,
        15 * ui.camera.zoom,
      );
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

