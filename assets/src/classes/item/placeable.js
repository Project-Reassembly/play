import { Item } from "./item.js";
import { construct } from "../../core/constructor.js";
import { Registries } from "../../core/registry.js";
import { world, game } from "../../play/game.js";
import { selectedDirection } from "../../definitions/screens/in-game.js";
class PlaceableItem extends Item {
  layer = "blocks";
  block = "none";
  itemsPerBlock = 1;
  place(stack, bx, by) {
    if (stack.count < this.itemsPerBlock) return false;
    if (this.block === "none") return false;
    if (world.isPositionFree(bx, by, this.layer)) {
      let placed = world.placeAt(this.block, bx, by, this.layer);
      if (placed.rotatable) placed.direction = +selectedDirection;
      //Look, only the player can use this anyway
      placed.team = game.player.team;
      stack.count -= this.itemsPerBlock;
      if (stack.count === 0) {
        stack.item = "nothing";
      }
      return true;
    }
    return false;
  }
  createExtendedTooltip() {
    /**@type {Block} */
    let block = construct(Registries.blocks.get(this.block), "block");
    let blocktooltip = block.createExtendedTooltip
      ? block.createExtendedTooltip()
      : [];
    return blocktooltip;
  }
}
export { PlaceableItem };
