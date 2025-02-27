class Container extends Block {
  /** @type {Inventory} */
  inventory = null;
  inventorySize = 30;
  title = "Container";
  /**@type {Block | null} */
  static selectedBlock = null;
  init() {
    super.init();
    this.inventory = new Inventory(this.inventorySize);
    // this.inventory = this.inventory.map((x) => construct(x, "itemstack"));
  }
  drawTooltip(x, y, outlineColour, backgroundColour) {
    this.inventory.draw(
      x + 17,
      y - 17,
      null,
      6,
      30,
      outlineColour,
      backgroundColour,
      true
    );
  }
  break(type) {
    if (super.break(type))
      this.inventory.iterate((stack) => {
        if (stack && !stack.isEmpty()) {
          let created = new DroppedItemStack(stack);
          created.x = this.x + Block.size / 2;
          created.y = this.y + Block.size / 2;
          created.addToWorld(this.world);
        }
      });
    return true;
  }
}
