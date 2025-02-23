class Block {
  static size = 30;
  image = "error";
  blockX = 0;
  blockY = 0;
  /**@type {Chunk} */
  chunk = null;
  size = 1;
  init() {}
  tick() {}
  draw() {
    drawImg(
      this.image,
      this.x,
      this.y,
      this.size * Block.size,
      this.size * Block.size
    );
  }
  /**
   * Fired when an entity interacts with this block.
   * @param {Entity} entity Interacting entity.
   * @param {ItemStack} usedItemStack Itemstack held while interacting.
   */
  interaction(entity, usedItemStack) {}
  drawTooltip(
    x,
    y,
    outlineColour = [50, 50, 50],
    backgroundColour = [95, 100, 100, 160]
  ) {}
  get x() {
    return (this.blockX + this.chunk.x * Chunk.size) * Block.size;
  }
  get y() {
    return (this.blockY + this.chunk.y * Chunk.size) * Block.size;
  }
}
