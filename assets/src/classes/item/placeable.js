import { construct } from "../../core/constructor.js";
import { Registries } from "../../core/registry.js";
import { ImageContainer } from "../../core/ui.js";
import { world } from "../../play/game.js";
import { blockSize } from "../../scaling.js";
import { Block } from "../block/block.js";
import { Item } from "./item.js";
/** @type {Map<string, Block>} */
const _blocks = new Map();
class PlaceableItem extends Item {
  layer = "blocks";
  block = "none";
  itemsPerBlock = 1;
  #blockCache = null;
  /** Gets a static instance of the block that this item places. This block does not exist anywhere in the world, it's only used for placement previews and database stuff. */
  getBlock() {
    const b = _blocks.get(this.registryName);
    if (b) return b;
    const c = construct(Registries.blocks.get(this.block), "block");
    _blocks.set(this.registryName, c);
    return c;
  }
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
  drawPreviewImage(x, y, d = 0) {
    push();
    translate(x, y);
    scale(0.8);
    opacity(0.5);
    const block = this.getBlock();
    ImageContainer.draw(block.image, 0, 0, blockSize, blockSize, block.rotatable ? d : 0);
    opacity(1);
    if (block.rotatable)
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
    const block = this.getBlock();
    let blocktooltip = block.createExtendedDetails ? block.createExtendedDetails() : "";
    return blocktooltip;
  }
}
export { PlaceableItem };

