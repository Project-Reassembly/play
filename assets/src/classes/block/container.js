import { Inventory } from "../inventory.js";
import { Block } from "./block.js";
class Container extends Block {
  /** @type {Inventory} */
  inventory = null;
  inventorySize = 5;
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
      forceVReverse,
    );
  }
  break(type) {
    if (super.break(type)) this.inventory.drop(this.world, this.x, this.y);
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
    return this.inventory.first()?.item ?? "";
  }
  createExtendedDetails() {
    return `#=-Inventory:\n  #d-${this.inventorySize}#-- slots`;
  }
  value() {
    return this.inventory.value() / 100 || 0;
  }
  /**
   * Tries to add an item to this block, as a conveyor would.
   * @param {string} item
   * @returns True if the item was successfully added.
   */
  push(item) {
    return this.inventory.addItem(item, 1) === 0;
  }
  /**
   * Get the current number of items of the set filter in the block's output inventory.
   * @param {string} item
   * @returns The number of items present.
   */
  getOutputLevel(item) {
    return this.inventory.count(item);
  }
  /**
   * Get the current number of items of the set filter in the block's input inventory.
   * @param {string} item
   * @returns The number of items present.
   */
  getFillLevel(item) {
    return this.inventory.count(item);
  }
  /**
   * Gets the next item type available to pull.
   * @returns {string?} The item to pull, or null if there are no items.
   */
  getNextPullable() {
    return this.inventory.first()?.item;
  }
  /**
   * Tries to pull an item from this block, as an unloader would.
   * @param {string} filter
   * @returns {string?} The item returned, or null if there are no items.
   */
  pull(filter) {
    return this.inventory.removeItem(filter, 1) ? null : filter;
  }
}
export { Container };

Object.defineProperty(globalThis, "sel", { get: () => Container.selectedBlock });
