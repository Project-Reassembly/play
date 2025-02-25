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
  interaction(entity, usedItemStack = ItemStack.EMPTY) {}
  /** Fired when this block is attempted to be broken. Can specify the result of the break attempt.  
   * @param {symbol} [type=BreakType.entity] What broke this block. Should be a property of `BreakType`.
   * @returns {Boolean} True if this block should break, false if not.
  */
  break(type = BreakType.delete){
    return true;
  };
  /** Fired when this block is attempted to be placed. Can specify the result of the place attempt. Still respects default placement rules.
   * @param {symbol} [type=BreakType.entity] What placed this block. Should be a property of `PlaceType`.
   * @returns {Boolean} True if this block can be placed, false if not.
  */
  place(type = PlaceType.create){
    return true;
  }
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
/** Stores values to describe how blocks are broken. */
const BreakType = {
  /** The block is deconstructed by the player. */
  deconstruct: Symbol(),
  /** The block is broken by an explosion. */
  explode: Symbol(),
  /** The block is changing to another one. */
  replace: Symbol(),
  /** Generic breaking, has no semantics. */
  delete: Symbol(),
  /** The block is being broken by an enemy. */
  attack: Symbol()
}
/** Describes how a block is placed. */
const PlaceType = {
  /** Type used for blocks built by the player. */
  build: Symbol(),
  /** Type used for blocks placed on world generation. */
  generate: Symbol(),
  /** Generic placement, has no semantics. */
  create: Symbol()
}