import { create2DArray, iterate2DArray, mapJagged2DArray } from "../../core/2D-array.js";
import { construct } from "../../core/constructor.js";
import { tru } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { blockSize, chunkSize, Direction } from "../../scaling.js";
import { GroundTile } from "../block/ground-tile.js";
import { World } from "./world.js";
/**
 * @typedef SerialisedChunk
 * @prop {SerialisedBlock[][]} blocks
 * @prop {string[][]} tiles
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
    /** @readonly */
    floor: "floor",
  };
  static get size() {
    return chunkSize;
  }
  /** @import {Block} from "../block/block.js" */
  /** @type {(string|null)[][]} */
  tiles = create2DArray(chunkSize);
  /** @type {(Block|null)[][]} */
  blocks = create2DArray(chunkSize);
  /** @type {(Block|null)[][]} */
  floor = create2DArray(chunkSize);
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
   * @returns {Block?} Block added, or null if it was a tile.
   */
  addBlock(block, x = 0, y = 0, layer = Chunk.Layer.blocks) {
    if (
      this[layer] === undefined ||
      this[layer][y] === undefined ||
      this[layer][y][x] === undefined
    )
      throw new Error("Can't place block outside of chunk (at " + x + ", " + y + " in chunk)");

    let blockToAdd = construct(Registries.blocks.get(block), "block");
    blockToAdd.blockX = x;
    blockToAdd.blockY = y;
    blockToAdd.chunk = this;
    this[layer][y][x] = blockToAdd;
    return blockToAdd;
  }
  /**
   * Adds a tile to the chunk.
   * @param {string} block Registry name of the tile
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   */
  addTile(block, x = 0, y = 0) {
    if (this.tiles[y] === undefined || this.tiles[y][x] === undefined)
      throw new Error("Can't place tile outside of chunk (at " + x + ", " + y + " in chunk)");

    this.tiles[y][x] = block;
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
      throw new Error("Can't remove block outside of chunk (at " + x + ", " + y + " in chunk)");
    if (this[layer][y][x]) {
      this[layer][y][x] = null;
      return true;
    }
    return false;
  }
  /**
   * Removes a tile from the chunk.
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @returns {Boolean} True if the block was removed, false if not.
   */
  removeTile(x, y) {
    if (this.tiles[y] === undefined || this.tiles[y][x] === undefined)
      throw new Error("Can't remove block outside of chunk (at " + x + ", " + y + " in chunk)");
    if (this.tiles[y][x]) {
      this.tiles[y][x] = null;
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
      throw new Error("Can't get block outside of chunk (at " + x + ", " + y + " in chunk)");
    return this[layer][y][x];
  } /**
   * Gets a tile from the chunk.
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @returns {string?} The tile's registry name, or null if no block is present.
   */
  getTile(x, y) {
    if (this.tiles[y] === undefined || this.tiles[y][x] === undefined)
      throw new Error("Can't get tile outside of chunk (at " + x + ", " + y + " in chunk)");
    return this.tiles[y][x];
  }
  randomTick() {
    iterate2DArray(
      this.tiles,
      (tile, y, x) => tile && tru(World.randomTick) && GroundTile.randomTick(tile, x, y),
    );
    iterate2DArray(this.floor, (floor) => floor && tru(World.randomTick) && floor.tick());
  }
  tick() {
    iterate2DArray(this.blocks, (block) => block && !block.disabled && block.tick());
  }
  draw() {
    this.drawTiles();
    this.drawFloorsOnly();
    this.drawBlocksOnly();
  }
  drawTiles() {
    push();
    // translate(blockSize / 2, blockSize / 2);
    iterate2DArray(
      this.tiles,
      (tile, y, x) =>
        tile &&
        GroundTile.draw(
          tile,
          (x + this.i * chunkSize) * blockSize,
          (y + this.j * chunkSize) * blockSize,
        ),
    );
    pop();
  }
  drawFloorsOnly() {
    push();
    // translate(blockSize / 2, blockSize / 2);
    iterate2DArray(this.floor, (floor) => floor && floor.draw());
    pop();
  }
  drawBlocksOnly() {
    push();
    // translate(blockSize / 2, blockSize / 2);
    iterate2DArray(this.blocks, (block) => block && block.draw());
    pop();
  }
  postDrawBlocksOnly() {
    push();
    // translate(blockSize / 2, blockSize / 2);
    iterate2DArray(this.blocks, (block) => block && block.postDraw());
    pop();
  }
  postDraw2BlocksOnly() {
    push();
    // translate(blockSize / 2, blockSize / 2);
    iterate2DArray(this.blocks, (block) => block?.postDraw2 && block.postDraw2());
    pop();
  }
  /**@returns {SerialisedChunk} */
  serialise() {
    return {
      blocks: mapJagged2DArray(this.blocks, (y) => (y ? y.serialise() : null)),
      tiles: structuredClone(this.tiles),
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
    for (let y = 0; y < chunkSize; y++) {
      for (let x = 0; x < chunkSize; x++) {
        let sblock = created.blocks[y][x];
        let sfloor = created.floors[y][x];
        let stile = created.tiles[y][x];
        //Floor, Tile
        if (stile) chunk.addTile(stile ?? "stone", x, y);
        if (sfloor && sfloor.block) chunk.addBlock(sfloor.block, x, y, "floor");
        if (sblock) {
          //Block
          let blk = chunk.addBlock(sblock.block ?? "scrap-wall", x, y, "blocks");
          if (sblock.direction) blk.direction = Direction.fromEnum(sblock.direction);
          if (sblock.health) blk.health = sblock.health ?? 0;
          if (sblock.team) blk.team = sblock.team ?? "enemy";
          if (sblock.power) blk.power = sblock.power ?? 0;
          //Specific saves
          blk.constructor.applyExtraProps(blk, sblock);
        }
      }
    }
    return chunk;
  }

  print() {
    iterate2DArray(this.tiles, (t, y, x) =>
      console.log(`${t}: ${x},${y} -> ${x + this.i * chunkSize},${y + this.j * chunkSize}\n  `),
    );
  }
}

export { Chunk };

