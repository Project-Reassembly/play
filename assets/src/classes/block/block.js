class Block extends ShootableObject {
  static size = 30;
  selectable = false;
  /**@readonly */
  static dir = this.direction;
  /**@readonly @enum*/
  static direction = {
    /**@readonly */
    UP: -Math.PI / 2,
    /**@readonly */
    DOWN: Math.PI / 2,
    /**@readonly */
    LEFT: Math.PI,
    /**@readonly */
    RIGHT: 0,
    rotateClockwise(dir) {
      if (dir === Block.direction.UP) return Block.direction.RIGHT;
      if (dir === Block.direction.RIGHT) return Block.direction.DOWN;
      if (dir === Block.direction.DOWN) return Block.direction.LEFT;
      return Block.direction.UP;
    },
    rotateAntiClockwise(dir) {
      if (dir === Block.direction.UP) return Block.direction.LEFT;
      if (dir === Block.direction.LEFT) return Block.direction.DOWN;
      if (dir === Block.direction.DOWN) return Block.direction.RIGHT;
      return Block.direction.UP;
    },
    oppositeOf(dir) {
      if (dir === Block.direction.UP) return Block.direction.DOWN;
      if (dir === Block.direction.LEFT) return Block.direction.RIGHT;
      if (dir === Block.direction.RIGHT) return Block.direction.LEFT;
      return Block.direction.UP;
    },
    vectorOf(direction) {
      return { x: Math.cos(direction), y: Math.sin(direction) };
    },
  };
  disabled = false;
  walkable = false;
  image = "error";
  blockX = 0;
  blockY = 0;
  rotatable = false;
  direction = Block.direction.UP;
  explosiveness = 0.1;
  /**@type {Chunk} */
  _chunk = null;
  set chunk(_) {
    this._chunk = _;
    this.world = _.world;
  }
  get chunk() {
    return this._chunk;
  }
  size = 1;
  init() {
    super.init();
    delete this.x;
    delete this.y;
  }
  draw() {
    drawImg(
      this.image,
      this.x,
      this.y,
      this.size * Block.size,
      this.size * Block.size
    );
    super.draw();
  }
  /**
   * Fired when an entity interacts with this block.
   * @param {Entity} entity Interacting entity.
   * @param {ItemStack} usedItemStack Itemstack held while interacting.
   * @returns {Boolean} True, if the block has been interacted with and should not be selected. False otherwise.
   */
  interaction(entity, usedItemStack = ItemStack.EMPTY) {
    return false;
  }
  canBreak(type = BreakType.delete) {
    return true;
  }
  onHealthZeroed() {
    if (this.break(BreakType.attack)) {
      this.world.break(this.gridX, this.gridY, "blocks");
      //Block go boom
      createDestructionExplosion(
        this.x + Block.size / 2,
        this.y + Block.size / 2,
        this
      );
    }
  }
  /** Fired when this block is attempted to be broken. Can specify the result of the break attempt.
   * @param {symbol} [type=BreakType.entity] What broke this block. Should be a property of `BreakType`.
   * @returns {Boolean} True if this block should break, false if not.
   */
  break(type = BreakType.delete) {
    if (type !== BreakType.deconstruct && type !== BreakType.replace)
      return true;
    if (!this.dropItem) return true;
    DroppedItemStack.create(
      new ItemStack(this.dropItem, 1),
      this.world,
      this.x + Block.size / 2,
      this.y + Block.size / 2
    );
    return true;
  }
  /** Fired when this block is attempted to be placed. Can specify the result of the place attempt. Still respects default placement rules.
   * @param {symbol} [type=BreakType.entity] What placed this block. Should be a property of `PlaceType`.
   * @returns {Boolean} True if this block can be placed, false if not.
   */
  place(type = PlaceType.create) {
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
  get gridX() {
    return this.blockX + this.chunk.x * Chunk.size;
  }
  get gridY() {
    return this.blockY + this.chunk.y * Chunk.size;
  }
}
/** Stores values to describe how blocks are broken.
 * @enum
 */
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
  attack: Symbol(),
};
/** Describes how a block is placed. */
const PlaceType = {
  /** Type used for blocks built by the player. */
  build: Symbol(),
  /** Type used for blocks placed on world generation. */
  generate: Symbol(),
  /** Generic placement, has no semantics. */
  create: Symbol(),
  /** The block is being changed from another one. */
  replace: Symbol(),
};

function createLinkedBlockAndItem(
  regname,
  displayname,
  image,
  blockprops,
  itemprops
) {
  Registry.blocks.add(
    regname,
    Object.assign(blockprops, {
      name: displayname,
      image: image,
      dropItem: regname,
      health: 100,
    })
  );
  Registry.items.add(
    regname,
    Object.assign(itemprops, {
      type: "placeable",
      name: displayname,
      block: regname,
      image: image,
    })
  );
}
