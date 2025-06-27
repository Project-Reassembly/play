import { colinterp } from "../../core/number.js";
import { drawImg, rotatedImg } from "../../core/ui.js";
import {
  autoScaledEffect,
  createEffect,
  Explosion,
} from "../../play/effects.js";
import { blockSize, Direction } from "../../scaling.js";
import { ShootableObject } from "../physical.js";
import { Block, BreakType } from "./block.js";

class PlasmaBlock extends Block {
  static maxCompression = 12;
  level = 0;
  capacity = 16;
  compression = 0;
  movePlasmaInDirection(dir, level = this.level) {
    let vct = Direction.vectorOf(dir);
    let target =
      this.world.getBlock(this.gridX + vct.x, this.gridY + vct.y) ??
      this.world.getBlock(
        this.gridX + vct.x,
        this.gridY + vct.y
      );
    if (
      target &&
      target instanceof PlasmaBlock &&
      target.acceptsPlasmaFrom(dir, level)
    )
      this.movePlasmaTo(target, level);
  }
  movePlasmaTo(target, level = this.level) {
    if (target instanceof PlasmaBlock && target.level < target.capacity) {
      if (target.level === 0) target.compression = this.compression;
      if (target.compression === this.compression) {
        let canPush = target.capacity - target.level;
        let toPush = Math.min(canPush, level);

        target.level += toPush;
        this.level -= toPush;
      }
    }
  }
  serialise() {
    let blk = super.serialise();
    blk.level = this.level;
    blk.compression = this.compression;
    return blk;
  }
  static applyExtraProps(deserialised, creator) {
    super.applyExtraProps(deserialised, creator);
    deserialised.level = creator.level ?? 0;
    deserialised.compression = creator.compression ?? 0;
  }
  break(type) {
    if (type !== BreakType.deconstruct) {
      let col = colinterp(
        [
          [255, 0, 0],
          [255, 128, 0],
          [255, 255, 255],
        ],
        this.compression / PlasmaBlock.maxCompression
      );

      let col2 = colinterp(
        [
          [255, 0, 0],
          [255, 128, 0],
          [255, 255, 255],
        ],
        this.compression / 2 / PlasmaBlock.maxCompression
      );
      col2[3] = 0;
      let dmg = (this.compression + 1) * (this.level + 10);
      let radius = dmg ** 0.75 + 20;
      createEffect(
        {
          type: "explosion",
          waveColours: [col, col2],
          sparkColours: [col, col2],
          smokeColours: [col, col2],
        },
        this.world,
        this.x + blockSize / 2,
        this.y + blockSize / 2,
        0,
        radius
      );
      let ex = new Explosion({
        radius: radius,
        amount: dmg,
      });
      ex.x = this.x + blockSize / 2;
      ex.y = this.y + blockSize / 2;
      ex.world = this.world;
      this.team = "plasma-pipe-detonating";
      ex.source = this;
      ex.dealDamage();
    }
    super.break(type);
  }
  acceptsPlasmaFrom(direction, amount) {
    return true; // Default plasma blocks always accept plasma
  }
  outputsPlasmaIn(direction) {
    // Default plasma blocks do not output plasma to any direction
    return false;
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      this.capacity + " units capacity",
      "🟨 -------------------- ⬜",
    ];
  }
}

class PlasmaPipe extends PlasmaBlock {
  //base, shown on the bottom
  baseImage = "error";
  basePlasma = "error";
  //input, shown as needed
  inputImage = "error";
  inputPlasma = "error";
  //output, shown rotated on top
  outputImage = "error";
  outputPlasma = "error";

  rotatable = true;
  walkable = true;
  explosiveness = 0;

  #ins = {};

  tick() {
    super.tick();
    this.checkVisualConnections();
    if (this.level === 0) return;
    this.movePlasmaInDirection(this.direction);
  }
  checkSingleConnection(dir) {
    let vct = Direction.vectorOf(dir);
    /** @type {Block} */
    let blk = this.world.getBlock(this.gridX + vct.x, this.gridY + vct.y);
    let d = Direction.oppositeOf(dir);
    if (
      blk instanceof PlasmaBlock &&
      blk.outputsPlasmaIn(d) && this.acceptsPlasmaFrom(d, blk.level)
    ) {
      this.#ins[d] = true;
    }
  }
  acceptsPlasmaFrom(direction, amount) {
    // Plasma pipes always accept plasma from any direction, except the output direction
    return Direction.oppositeOf(direction) !== this.direction;
  }
  outputsPlasmaIn(direction) {
    // Plasma pipes output plasma in the direction they are facing
    return direction === this.direction;
  }
  checkVisualConnections() {
    this.#ins = {};
    Direction.forEach((d) => this.checkSingleConnection(d));
  }
  draw() {
    //pipes
    // base
    rotatedImg(
      this.baseImage,
      this.x,
      this.y,
      this.tileSize * blockSize,
      this.tileSize * blockSize,
      this.direction
    );
    for (let dir in this.#ins) {
      // input
      rotatedImg(
        this.inputImage,
        this.x,
        this.y,
        this.tileSize * blockSize,
        this.tileSize * blockSize,
        dir
      );
    }
    // output
    rotatedImg(
      this.outputImage,
      this.x,
      this.y,
      this.tileSize * blockSize,
      this.tileSize * blockSize,
      this.direction
    );

    //plasmas
    push();
    opacity(this.level / this.capacity);
    tint(
      colinterp(
        [
          [255, 0, 0],
          [255, 128, 0],
          [255, 255, 255],
        ],
        this.compression / PlasmaBlock.maxCompression
      )
    );
    // base
    rotatedImg(
      this.basePlasma,
      this.x,
      this.y,
      this.tileSize * blockSize,
      this.tileSize * blockSize,
      this.direction
    );
    // inputs
    for (let dir in this.#ins) {
      rotatedImg(
        this.inputPlasma,
        this.x,
        this.y,
        this.tileSize * blockSize,
        this.tileSize * blockSize,
        dir
      );
    }
    // output
    rotatedImg(
      this.outputPlasma,
      this.x,
      this.y,
      this.tileSize * blockSize,
      this.tileSize * blockSize,
      this.direction
    );
    pop();

    ShootableObject.prototype.draw.call(this);
  }
}
class PlasmaTank extends PlasmaBlock {
  plasma = "error";
  walkable = false;
  tick() {
    super.tick();
    Direction.forEach((dir) => this.movePlasmaInDirection(dir, Math.ceil(this.level / 4)));
  }
  draw() {
    super.draw();
    push();
    opacity(this.level / this.capacity);
    tint(
      colinterp(
        [
          [255, 0, 0],
          [255, 128, 0],
          [255, 255, 255],
        ],
        this.compression / PlasmaBlock.maxCompression
      )
    );
    // output
    drawImg(
      this.plasma,
      this.x,
      this.y,
      this.tileSize * blockSize,
      this.tileSize * blockSize
    );
    pop();
  }
  acceptsPlasmaFrom(direction, amount) {
    // Plasma tanks always accept plasma from any direction
    return true;
  }
  outputsPlasmaIn(direction) {
    // Plasma tanks output plasma in all directions
    return true;
  }
}

export { PlasmaPipe, PlasmaTank, PlasmaBlock };
