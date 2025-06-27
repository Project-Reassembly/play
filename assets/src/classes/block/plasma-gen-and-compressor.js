import { rotatedImg } from "../../core/ui.js";
import { effectTimer } from "../../play/effects.js";
import { blockSize } from "../../scaling.js";
import { Block } from "./block.js";
import { PlasmaBlock, PlasmaPipe, PlasmaTank } from "./plasma-pipe.js";

class PlasmaGenerator extends PlasmaTank {
  generatedAmount = 1;
  tick() {
    super.tick();
    if (this.level < this.capacity) this.level += this.generatedAmount;
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      this.capacity + " units capacity",
      this.generatedAmount * 60 + " units/s generation",
      "🟨 -------------------- ⬜",
    ];
  }
}
class PlasmaCompressor extends PlasmaPipe {
  spinnerImage = "error";
  spinSpeed = 2;
  compressionAmount = 1;
  movePlasmaTo(target, level) {
    if (target instanceof PlasmaBlock && target.level < target.capacity) {
      if (target.level === 0)
        target.compression = this.compression + this.compressionAmount;
      if (
        target.compression === this.compression + this.compressionAmount &&
        this.compression + this.compressionAmount <=
          PlasmaBlock.maxCompression &&
        this.compression + this.compressionAmount >= 0
      ) {
        let canPush = target.capacity - target.level;
        let toPush = Math.min(canPush, level / 2 ** this.compressionAmount);

        target.level += toPush;
        this.level -= toPush * 2 ** this.compressionAmount;
      }
    }
  }
  draw() {
    super.draw();
    rotatedImg(
      this.spinnerImage,
      this.x,
      this.y,
      this.tileSize * blockSize,
      this.tileSize * blockSize,
      radians((effectTimer.ticks * this.spinSpeed) % 360)
    );
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      this.capacity + " units capacity",
      this.compressionAmount + " levels compression",
      "🟨 -------------------- ⬜",
    ];
  }
}
class PlasmaDecompressor extends PlasmaTank {
  spinnerImage = "error";
  spinSpeed = 2;
  compressionAmount = -1;
  movePlasmaTo(target, level) {
    // It's a bit weird that this is the same as the compressor, but it is
    PlasmaCompressor.prototype.movePlasmaTo.call(this, target, level);
  }
  draw() {
    super.draw();
    rotatedImg(
      this.spinnerImage,
      this.x,
      this.y,
      this.tileSize * blockSize,
      this.tileSize * blockSize,
      radians((effectTimer.ticks * this.spinSpeed) % 360)
    );
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      this.capacity + " units capacity",
      -this.compressionAmount + " levels decompression",
      "🟨 -------------------- ⬜",
    ];
  }
}

export { PlasmaGenerator, PlasmaCompressor, PlasmaDecompressor };
