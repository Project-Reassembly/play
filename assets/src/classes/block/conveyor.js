import { ImageContainer } from "../../core/image.js";
import { clamp, roundNum } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { drawImg, rotatedImg, ui } from "../../core/ui.js";
import { Log } from "../../play/messaging.js";
import { blockSize, Direction } from "../../scaling.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
import { ShootableObject } from "../physical.js";
import { Block } from "./block.js";
import { Container } from "./container.js";
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
      if (target instanceof Container /* && target.inventory.canAddItem(i.item, i.count) */) {
        // target.inventory.addItem(i.item, 1);
        if (target.push(this.istack.item)) {
          this._progress = 0;
          this.istack.clear();
        }
      } else if (target instanceof Conveyor && target.istack.isEmpty()) {
        this._progress = 0;
        target.istack = this.istack;
        this.istack = ItemStack.EMPTY;
        if (this.direction !== target.direction) target._progress = target.moveTime / 2;
        else target._progress = 0;
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
        blockSize * 0.5,
        blockSize * 0.5,
      );
    }
    super.postDraw();
  }
  /**
   * @param {DroppedItemStack} item
   */
  itemOnTopOf(item) {
    if (this.istack.isEmpty()) {
      this.istack = item.item.copy();
      this.istack.count = 1;

      item.item.count--;
      if (item.item.isEmpty()) item.remove = true;
    }
  }
  /**
   * @param {Entity} entity
   */
  steppedOnBy(entity) {
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
  read() {
    return this.istack.isEmpty() ? "" : this.istack?.item;
  }
}

class Unloader extends Conveyor {
  filter = "";
  tick() {
    this.extract();
    super.tick();
  }
  extract() {
    let vct = Direction.vectorOf(this.direction);
    let extractFrom = this.world.getBlock(this.gridX - vct.x, this.gridY - vct.y);
    if (extractFrom instanceof Container && this.istack.isEmpty()) {
      const toPull = this.filter ? this.filter : extractFrom.getNextPullable();
      if (toPull) {
        const grabbed = extractFrom.pull(toPull);
        if (grabbed) {
          this.istack = new ItemStack(grabbed);
          this._progress = 0;
        }
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
    if (stack.isEmpty()) {
      if (this.filter) {
        this.filter = "";
        Log.send("Cleared filter.");
      }
    } else {
      Log.send("Set filter to " + stack.getItem()?.name);
      this.filter = stack.item;
    }
    ui.waitingForMouseUp = true;
    return true;
  }
  highlight(emphasised) {
    super.highlight(emphasised);
    if (this.filter) {
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
class LevelUnloader extends Unloader {
  level = 100;
  indicatorImg = "error";
  #lcache = 0;
  extract() {
    let vct = Direction.vectorOf(this.direction);
    let extractFrom = this.world.getBlock(this.gridX - vct.x, this.gridY - vct.y);
    if (extractFrom instanceof Container && this.istack.isEmpty()) {
      const toPull = this.filter ? this.filter : extractFrom.getNextPullable();
      if (toPull) {
        this.#lcache = extractFrom.getOutputLevel(toPull);

        if (this.#lcache > this.level) {
          const grabbed = extractFrom.pull(toPull);
          if (grabbed) {
            this.istack = new ItemStack(grabbed);
            this._progress = 0;
          }
        }
      }
    }
  }
  serialise() {
    let b = super.serialise();
    b.level = this.level;
    return b;
  }
  /**
   * @param {LevelLoader} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    super.applyExtraProps(deserialised, creator);
    deserialised.level = creator.level;
  }
  postDraw2() {
    ImageContainer.draw(this.indicatorImg, this.x, this.y, blockSize, blockSize);
    textAlign(CENTER, CENTER);
    textSize(8);
    const c = 255 - clamp((this.#lcache - this.level) / this.level * 255, 0, 255);
    fill(255, c, c);
    text(`${this.#lcache}`, this.x, this.y - 3);
    fill(255);
    text(`${this.level}`, this.x, this.y + 3);
  }
  leftArrow() {
    if (keyIsDown(CONTROL)) {
      if (this.level > 100) this.level -= 100;
      else this.level = 0;
    } else if (keyIsDown(SHIFT)) {
      if (this.level > 10) this.level -= 10;
      else this.level = 0;
    } else if (this.level > 0) this.level--;
  }
  rightArrow() {
    if (keyIsDown(CONTROL)) {
      if (this.level < 909) this.level += 100;
      else this.level = 999;
    } else if (keyIsDown(SHIFT)) {
      if (this.level < 990) this.level += 10;
      else this.level = 999;
    } else if (this.level < 999) this.level++;
  }
  read() {
    return `${this.level}`;
  }
  write(_) {
    this.level = clamp(+_ || 0, 0, 999);
  }
}
/** Conveyor end point - won't drop items, and tries to maintain a certain number of items in the output. */
class LevelLoader extends Conveyor {
  level = 100;
  indicatorImg = "error";
  #lcache = 0;
  convey(target, posX, posY) {
    if (this._progress < this.moveTime) this._progress++;
    if (this._progress >= this.moveTime) {
      if (target instanceof Container) {
        this.#lcache = target.getFillLevel(this.istack.item);
        if (this.#lcache < this.level && target.push(this.istack.item)) {
          this._progress = 0;
          this.istack.clear();
          this.#lcache++;
        }
      }
    }
  }
  serialise() {
    let b = super.serialise();
    b.level = this.level;
    return b;
  }
  /**
   * @param {LevelLoader} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    super.applyExtraProps(deserialised, creator);
    deserialised.level = creator.level;
  }
  postDraw2() {
    ImageContainer.draw(this.indicatorImg, this.x, this.y, blockSize, blockSize);
    textAlign(CENTER, CENTER);
    textSize(8);
    const c = (1 - this.#lcache / this.level) * 255;
    fill(255, c, c);
    text(`${this.#lcache}`, this.x, this.y - 3);
    fill(255);
    text(`${this.level}`, this.x, this.y + 3);
  }
  leftArrow() {
    if (keyIsDown(CONTROL)) {
      if (this.level > 100) this.level -= 100;
      else this.level = 0;
    } else if (keyIsDown(SHIFT)) {
      if (this.level > 10) this.level -= 10;
      else this.level = 0;
    } else if (this.level > 0) this.level--;
  }
  rightArrow() {
    if (keyIsDown(CONTROL)) {
      if (this.level < 909) this.level += 100;
      else this.level = 999;
    } else if (keyIsDown(SHIFT)) {
      if (this.level < 990) this.level += 10;
      else this.level = 999;
    } else if (this.level < 999) this.level++;
  }
  read() {
    return `${this.level}`;
  }
  write(_) {
    this.level = clamp(+_ || 0, 0, 999);
  }
}

export { Conveyor, LevelLoader, LevelUnloader, Unloader };

