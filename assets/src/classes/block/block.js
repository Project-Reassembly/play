/**
 * @typedef SerialisedBlock
 * @prop {int} x
 * @prop {int} y
 * @prop {string} block Registry name
 * @prop {number} direction
 */
/** */
class Block extends ShootableObject {
  static size = 30;
  selectable = false;
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
    /**@param {0|1|2|3} */
    fromEnum(en) {
      switch (en) {
        case 0:
          return Block.dir.UP;
        case 1:
          return Block.dir.DOWN;
        case 2:
          return Block.dir.LEFT;
        case 3:
          return Block.dir.RIGHT;
        default:
          return Block.dir.UP;
      }
    },
    toEnum(en) {
      switch (en) {
        case Block.dir.UP:
          return 0;
        case Block.dir.DOWN:
          return 1;
        case Block.dir.LEFT:
          return 2;
        case Block.dir.RIGHT:
          return 3;
        default:
          return 0;
      }
    },
  };
  /**@readonly */
  static dir = this.direction;
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
  tileSize = 1;
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
      this.tileSize * Block.size,
      this.tileSize * Block.size
    );
    super.draw();
  }
  
  createDamageNumber(amount) {
    this.world.particles.push(
      new TextParticle(
        this.x + Block.size/2,
        this.y + Block.size/2,
        rnd(0, Math.PI * 2),
        60,
        this.size / 15,
        0.1,
        roundNum(amount, 1),
        [255, (10 * this.maxHealth) / amount, 0],
        [255, (10 * this.maxHealth) / amount, 0],
        20,
        10,
        0,
        true
      )
    );
  }
  steppedOnBy(entity) {}
  /**
   * Fired when an entity interacts with this block.
   * @param {Entity} entity Interacting entity.
   * @param {ItemStack} usedItemStack Itemstack held while interacting.
   * @returns {Boolean} True, if the block has been interacted with and should not be selected. False otherwise.
   */
  interaction(entity, usedItemStack = ItemStack.EMPTY) {
    return false;
  }
  /**Fired when a block is activated through an interaction, commands or ISL. */
  activated() {}
  canBreak(type = BreakType.delete) {
    return true;
  }
  onHealthZeroed(type, source) {
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
  ) {
    return true;
  }
  highlight(emphasised = false) {
    push();
    noFill();
    let othercol = (emphasised ? 50 : 200) + 55 * Math.sin(frameCount / 30);
    stroke(emphasised ? 255 : othercol, othercol, othercol);
    strokeWeight((emphasised ? 2 : 1) * ui.camera.zoom);
    rectMode(CORNER);
    rect(
      this.uiX,
      this.uiY,
      Block.size * ui.camera.zoom,
      Block.size * ui.camera.zoom
    );
    pop();
  }
  get x() {
    return (this.blockX + this.chunk.i * Chunk.size) * Block.size;
  }
  get y() {
    return (this.blockY + this.chunk.j * Chunk.size) * Block.size;
  }
  get gridX() {
    return this.blockX + this.chunk.i * Chunk.size;
  }
  get gridY() {
    return this.blockY + this.chunk.j * Chunk.size;
  }
  get uiX() {
    return (this.x - ui.camera.x) * ui.camera.zoom;
  }
  get uiY() {
    return (this.y - ui.camera.y) * ui.camera.zoom;
  }
  /**@returns {SerialisedBlock} */
  serialise() {
    return {
      block: this.registryName,
      direction: Block.dir.toEnum(this.direction),
      health: this.health,
      team: this.team,
    };
  }
  /**
   * @param {Block} deserialised
   * @param {object} creator
   */
  static applyExtraProps(deserialised, creator) {}
  rightArrow() {}
  leftArrow() {}
  read() {
    return this.registryName;
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
