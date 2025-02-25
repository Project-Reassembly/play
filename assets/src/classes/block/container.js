class Container extends Block {
  /** @type {Inventory} */
  inventory = null;
  inventorySize = 30;
  /**@type {Block | null} */
  static selectedBlock = null;
  init() {
    super.init();
    this.inventory = new Inventory(this.inventorySize);
    // this.inventory = this.inventory.map((x) => construct(x, "itemstack"));
  }
}
