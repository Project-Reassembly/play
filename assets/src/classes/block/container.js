import { Block } from "./block.js";
import { Inventory } from "../inventory.js";
import { blockSize } from "../../scaling.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
class Container extends Block {
  /** @type {Inventory} */
  inventory = null;
  inventorySize = 30;
  selectable = true;
  title = "";
  /**@type {Block | null} */
  static selectedBlock = null;
  init() {
    super.init();
    this.inventory = new Inventory(this.inventorySize);
    if (this.title.length === 0) this.title = this.name;
    // this.inventory = this.inventory.map((x) => construct(x, "itemstack"));
  }
  drawTooltip(x, y, outlineColour, backgroundColour, forceVReverse = false) {
    this.inventory.draw(
      x + 17,
      y - 17 * (forceVReverse ? 1 : -1),
      null,
      6,
      30,
      outlineColour,
      backgroundColour,
      forceVReverse
    );
  }
  break(type) {
    if (super.break(type))
      this.inventory.iterate((stack) => {
        DroppedItemStack.create(
          stack,
          this.world,
          this.x + blockSize / 2,
          this.y + blockSize / 2
        );
      }, true);
    return true;
  }
  serialise() {
    let b = super.serialise();
    b.inventory = this.inventory.serialise();
    return b;
  }
  /**
   * @param {Container} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {
    super.applyExtraProps(deserialised, creator);
    deserialised.inventory = Inventory.deserialise(creator.inventory);
  }
  read() {
    let item = "";
    this.inventory.iterate((stack, slot, sotp) => {
      sotp();
      item = stack.item;
    }, true);
    return item;
  }
  createExtendedTooltip() {
    return [
      "🟨 -------------------- ⬜",
      this.inventorySize + " slots",
      "🟨 -------------------- ⬜",
    ];
  }
}
export { Container };
