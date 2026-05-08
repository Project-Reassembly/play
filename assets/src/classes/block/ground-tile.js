import { RegisteredItem } from "../../core/registered-item.js";
import { Registries } from "../../core/registry.js";
import { drawImg } from "../../core/ui.js";
import { blockSize } from "../../scaling.js";

export class GroundTile extends RegisteredItem {
  speedMultiplier = 1;
  appliedStatus = "none";
  appliedStatusDuration = 0;
  buildable = true;
  drillSpeed = 1;

  image = "error";
  static draw(type, x, y) {
    const i = Registries.blocks.get(type).image ?? "error";
    // console.log("drawing " + i + " at " + x * blockSize + ", " + y * blockSize);
    drawImg(i, x, y, blockSize, blockSize);
  }
  static entityWalksOn(entity, type) {
    let tile = Registries.blocks.get(type);
    if (tile.appliedStatus != null)
      entity.applyStatus(
        Registries.statuses.get(tile.appliedStatus ?? "none"),
        tile.appliedStatusDuration ?? 240,
      );
  }
  static randomTick(tile, x, y) {}
}

globalThis.GT = GroundTile;
