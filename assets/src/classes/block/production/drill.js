import { ShootableObject } from "../../physical.js";
import { TileProducer } from "./tile-producer.js";
import { Registries } from "../../../core/registry.js";
import { drawImg, rotatedImg } from "../../../core/ui.js";
import { blockSize } from "../../../scaling.js";
class Drill extends TileProducer {
  topImg = "error";
  baseImg = "error";
  spinnerImg = "error";
  spinSpeed = 2;
  tick() {
    if (this._blockOn !== "null")
      this._speed = Registries.blocks.get(this._blockOn).drillSpeed ?? 1;
    else this._speed = 1;
    super.tick();
  }
  draw() {
    drawImg(
      this.baseImg,
      this.x,
      this.y,
      this.tileSize * blockSize,
      this.tileSize * blockSize
    );
    rotatedImg(
      this.spinnerImg,
      this.x,
      this.y,
      this.tileSize * blockSize,
      this.tileSize * blockSize,
      (this._progress / this.duration) * this.spinSpeed * TWO_PI
    );
    drawImg(
      this.topImg,
      this.x,
      this.y,
      this.tileSize * blockSize,
      this.tileSize * blockSize
    );
    ShootableObject.prototype.draw.call(this);
  }
}
export { Drill };
