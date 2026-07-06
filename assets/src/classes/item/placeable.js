import { construct } from "../../core/constructor.js";
import { Registries } from "../../core/registry.js";
import { ImageContainer } from "../../core/ui.js";
import { world } from "../../play/game.js";
import { blockSize } from "../../scaling.js";
import { Item } from "./item.js";
class PlaceableItem extends Item {
  layer = "blocks";
  block = "none";
  itemsPerBlock = 1;
  place(player, stack, bx, by, direction) {
    if (stack.count < this.itemsPerBlock) return false;
    if (this.block === "none") return false;
    if (world.isPositionFree(bx, by, this.layer)) {
      let placed = world.placeAt(this.block, bx, by, this.layer);
      if (placed.rotatable) placed.direction = +direction;
      //Look, only the player can use this anyway
      placed.team = player.team;
      stack.count -= this.itemsPerBlock;
      if (stack.count === 0) {
        stack.item = "nothing";
      }
      return true;
    }
    return false;
  }
  drawPreviewImage(x, y, d=0) {
    push();
    translate(x, y);
    scale(0.8);
    opacity(0.5);
    const regi = Registries.blocks.tryGet(this.block);
    const rot =
      regi?.type && (regi.type === "conveyor" || regi.type === "plasma-pipe") ?
        (regi?.rotatable ?? true)
      : false;
    ImageContainer.draw(regi?.image, 0, 0, blockSize, blockSize, rot ? d : 0);
    opacity(1);
    if (rot)
      ImageContainer.draw(
        "icon.arrow",
        Math.cos(d) * blockSize * 0.5,
        Math.sin(d) * blockSize * 0.5,
        blockSize * 0.5,
        blockSize * 0.5,
        d,
      );
    pop();
  }
  createExtendedDetails() {
    /**@type {import("../block/block.js").Block} */
    let block = construct(Registries.blocks.tryGet(this.block) ?? {}, "block");
    let blocktooltip = block.createExtendedDetails ? block.createExtendedDetails() : "";
    return blocktooltip;
  }
}
export { PlaceableItem };

