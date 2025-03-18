class Container extends Block {
  /** @type {Inventory} */
  inventory = null;
  inventorySize = 30;
  selectable = true;
  title = "Container";
  /**@type {Block | null} */
  static selectedBlock = null;
  init() {
    super.init();
    this.inventory = new Inventory(this.inventorySize);
    // this.inventory = this.inventory.map((x) => construct(x, "itemstack"));
  }
  drawTooltip(x, y, outlineColour, backgroundColour, forceVReverse = false) {
    this.inventory.draw(
      x + 17,
      y - 17,
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
          this.x + Block.size / 2,
          this.y + Block.size / 2
        );
      }, true);
    return true;
  }
  serialise() {
    return {
      x: this.blockX,
      y: this.blockY,
      block: this.registryName,
      direction: Block.dir.toEnum(this.direction),
      health: this.health,
      team: this.team,
      inventory: this.inventory.serialise(),
    };
  }
}
