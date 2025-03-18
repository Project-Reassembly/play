/**
 * @typedef SerialisedChunk
 * @prop {SerialisedBlock[][]} blocks
 * @prop {SerialisedBlock[][]} tiles
 * @prop {SerialisedBlock[][]} floors
 * @prop {int} i
 * @prop {int} j
 */

/** 16x16 Block group for ticking and rendering.*/
class Chunk {
  /**@readonly Holds values for possible chunk layers. */
  static Layer = {
    /**@readonly*/
    blocks: "blocks",
    /**@readonly*/
    tiles: "tiles",
    /** @readonly */
    floor: "floor",
  };
  static size = 16;
  tiles = create2DArray(Chunk.size);
  blocks = create2DArray(Chunk.size);
  floor = create2DArray(Chunk.size);
  //Not representative of the actual position of the blocks, though
  i = 0;
  get x() {
    return this.i;
  }
  j = 0;
  get y() {
    return this.j;
  }
  /**@type {World} */
  world = null;
  /**
   * Adds a block to the chunk.
   * @param {string} block Registry name of the block
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @param {keyof Chunk.Layer} layer Layer that blocks should be placed on.
   * @returns {Block} Block added.
   */
  addBlock(block, x = 0, y = 0, layer = Chunk.Layer.blocks) {
    if (
      this[layer] === undefined ||
      this[layer][y] === undefined ||
      this[layer][y][x] === undefined
    )
      throw new Error(
        "Can't place block outside of chunk (at " + x + ", " + y + " in chunk)"
      );
    let blockToAdd = construct(Registry.blocks.get(block), "block");
    blockToAdd.blockX = x;
    blockToAdd.blockY = y;
    blockToAdd.chunk = this;
    this[layer][y][x] = blockToAdd;
    return blockToAdd;
  }
  /**
   * Removes a block from the chunk.
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @param {keyof Chunk.Layer} layer Layer that blocks should be removed from.
   * @returns {Boolean} True if the block was removed, false if not.
   */
  removeBlock(x, y, layer = Chunk.Layer.blocks) {
    if (
      this[layer] === undefined ||
      this[layer][y] === undefined ||
      this[layer][y][x] === undefined
    )
      throw new Error(
        "Can't remove block outside of chunk (at " + x + ", " + y + " in chunk)"
      );
    if (this[layer][y][x]) {
      this[layer][y][x] = null;
      return true;
    }
    return false;
  }
  /**
   * Gets a block from the chunk.
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @param {keyof Chunk.Layer} layer Layer that blocks should be looked for in.
   * @returns {Block | null} The block, or null if no block is present.
   */
  getBlock(x, y, layer = Chunk.Layer.blocks) {
    if (
      this[layer] === undefined ||
      this[layer][y] === undefined ||
      this[layer][y][x] === undefined
    )
      throw new Error(
        "Can't get block outside of chunk (at " + x + ", " + y + " in chunk)"
      );
    return this[layer][y][x];
  }
  tick() {
    iterate2DArray(this.tiles, (tile) => tile && tile.tick());
    iterate2DArray(this.floor, (floor) => floor && floor.tick());
    iterate2DArray(
      this.blocks,
      (block) => block && !block.disabled && block.tick()
    );
  }
  draw() {
    this.drawFloorsOnly();
    this.drawBlocksOnly();
  }
  drawFloorsOnly() {
    push();
    translate(Block.size / 2, Block.size / 2);
    iterate2DArray(this.tiles, (tile) => tile && tile.draw());
    iterate2DArray(this.floor, (floor) => floor && floor.draw());
    pop();
  }
  drawBlocksOnly() {
    push();
    translate(Block.size / 2, Block.size / 2);
    iterate2DArray(this.blocks, (block) => block && block.draw());
    iterate2DArray(this.blocks, (block) => block && block.postDraw());
    pop();
  }
  /**@returns {SerialisedChunk} */
  serialise() {
    return {
      blocks: this.blocks.map((x) => x.map((y) => (y ? y.serialise() : null))),
      tiles: this.tiles.map((x) => x.map((y) => (y ? y.serialise() : null))),
      floors: this.floor.map((x) => x.map((y) => (y ? y.serialise() : null))),
      i: this.i,
      j: this.j,
    };
  }
  /**@param {SerialisedChunk} created  */
  static deserialise(created) {
    let chunk = new this();
    chunk.i = created.i;
    chunk.j = created.j;
    for (let y = 0; y < Chunk.size; y++) {
      for (let x = 0; x < Chunk.size; x++) {
        let sblock = created.blocks[y][x];
        let sfloor = created.floors[y][x];
        let stile = created.tiles[y][x];
        if (sblock) {
          //Block
          let blk = chunk.addBlock(sblock.block, x, y, "blocks");
          if (sblock.direction)
            blk.direction = Block.dir.fromEnum(sblock.direction);
          if (sblock.health) blk.health = sblock.health;
          if (sblock.team) blk.team = sblock.team;
          //Specific saves
          if (blk instanceof Container) {
            blk.inventory = Inventory.deserialise(sblock.inventory);
          }
          if (blk instanceof Crafter) {
            blk.changeRecipe(sblock.recipe);
          }
          if (blk instanceof Unloader) {
            blk.filter = sblock.filter;
          }
        }
        //Floor, Tile
        if (sfloor) chunk.addBlock(sfloor.block, x, y, "floor");
        if (stile) chunk.addBlock(stile.block, x, y, "tiles");
      }
    }
    return chunk;
  }
}

/**
 * Runs a function on each element on a 2D array. Array does not have to be square.
 * @param {Array} array 2D Array to iterate.
 * @param {(element:any) => void} func Function to iterate with.
 */
function iterate2DArray(array, func) {
  array.forEach((row) => row.forEach((element) => void func(element)));
}

/** Creates a square 2D array for use in the block grid. */
function create2DArray(size = 1) {
  let array = [];
  for (let i = 0; i < size; i++) {
    let row = [];
    for (let i = 0; i < size; i++) {
      row.push(null);
    }
    array.push(row);
  }
  return array;
}
