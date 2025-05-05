import { Container } from "../container.js";
import { tru, roundNum } from "../../../core/number.js";
import { autoScaledEffect } from "../../../play/effects.js";
import { blockSize } from "../../../scaling.js";
import { construct } from "../../../core/constructor.js";
import { Registries } from "../../../core/registry.js";
class TileProducer extends Container {
  results = {};
  amount = 0;
  duration = 0;

  tickEffect = "crafter-smoke";
  tickEffectChance = 0.1;

  _speed = 1;
  _progress = 0;
  _blockOn = "null";

  tick() {
    super.tick();
    let floor = this.chunk.getBlock(
      this.blockX,
      this.blockY,
      "floor"
    )?.registryName;
    let tile = this.chunk.getBlock(
      this.blockX,
      this.blockY,
      "tiles"
    )?.registryName;
    this._blockOn = !floor || floor === "null" ? tile : floor;
    if (!this._blockOn) {
      Log.send("Drill is on air!");
      this.chunk.removeBlock(this.blockX, this.blockY, "blocks");
    }
    if (this._blockOn in this.results) {
      this.tickProduction(this.results[this._blockOn]);
    }
  }
  tickProduction(result) {
    //If a recipe exists, and will fit
    if (this.inventory.canAddItem(result, this.amount))
      if (this._progress > this.duration) {
        if (this.onFinish(result)) this._progress = 0;
      } else {
        this._progress += this._speed;
        this.createTickEffect();
      }
  }
  onFinish(result) {
    this.inventory.addItem(result, this.amount);
    return true;
  }
  createTickEffect() {
    if (tru(this.tickEffectChance))
      autoScaledEffect(
        this.tickEffect,
        this.world,
        this.x + blockSize / 2,
        this.y + blockSize / 2,
        this.direction
      );
  }
  stringifyRecipe() {
    return (
      (this.results[this._blockOn]
        ? "--> " +
          (Registries.items.has(this.results[this._blockOn])
            ? Registries.items.get(this.results[this._blockOn])
            : { name: "Unknown" }
          )?.name +
          " x" +
          this.amount
        : "No recipe") +
      "\n" +
      ""
        .padEnd((this._progress / this.duration) * 20, "■")
        .padEnd(20, "□")
        .substring(0, 20) +
      " \nSpeed: " +
      roundNum((60 / this.duration) * this._speed, 2) +
      "/s"
    );
  }
  drawTooltip(x, y, outlineColour, backgroundColour) {
    super.drawTooltip(x, y, outlineColour, backgroundColour, true);
    drawMultilineText(
      x,
      y,
      this.stringifyRecipe(),
      this.title,
      Item.getColourFromRarity(0, "light"),
      outlineColour,
      backgroundColour
    );
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      "Allowed Floors:",
      ...Object.keys(this.results)
        .map((key) => ({ in: key, out: this.results[key] }))
        .flatMap((res) => {
          /**@type {Tile} */
          let blk = construct(Registries.blocks.get(res.in), "tile");
          return [
            "  " +
              blk.name +
              " ≈> " +
              Registries.items.get(res.out).name +
              (blk.drillSpeed !== 1 ? " (" + blk.drillSpeed + "× speed)" : ""),
          ];
        }),
      "Base Production: " +
        roundNum(this.amount * (60 / this.duration), 1) +
        "/s",
      "🟨 -------------------- ⬜",
    ];
  }
}
export { TileProducer };
