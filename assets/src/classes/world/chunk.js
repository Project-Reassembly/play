import { create2DArray, iterate2DArray, mapJagged2DArray } from "../../core/2D-array.js";
import { construct } from "../../core/constructor.js";
import { tru } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { blockSize, chunkSize, Direction } from "../../scaling.js";
import { GroundTile } from "../block/ground-tile.js";
import { World } from "./world.js";
/**
 * @import { SerialisedBlock } from "../block/block.js";
 * @typedef SerialisedChunk
 * @prop {SerialisedBlock[][]} blocks
 * @prop {string[][]} tiles
 * @prop {string[][]} ores
 * @prop {SerialisedBlock[][]?} floors @deprecated version of 'ores'.
 * @prop {int} i
 * @prop {int} j
 */

/** 16x16 Block group for ticking and rendering.*/
class Chunk {
  /**@enum @readonly Holds values for possible chunk ground layers. */
  static Layer = {
    /**@readonly*/
    tiles: "tiles",
    /** @readonly */
    ores: "ores",
  };
  static get size() {
    return chunkSize;
  }
  /** @import {Block} from "../block/block.js" */
  /** @type {(number)[][]} */
  tiles = create2DArray(chunkSize);
  /** @type {(number)[][]} */
  ores = create2DArray(chunkSize);
  /** @type {(Block|null)[][]} */
  blocks = create2DArray(chunkSize);
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
   * @returns {Block?} Block added.
   */
  addBlock(block, x = 0, y = 0) {
    if (
      this.blocks === undefined ||
      this.blocks[y] === undefined ||
      this.blocks[y][x] === undefined
    )
      throw new Error(`Can't place block outside of chunk (at ${x}, ${y} in chunk)`);

    let blockToAdd = construct(Registries.blocks.get(block), "block");
    blockToAdd.blockX = x;
    blockToAdd.blockY = y;
    blockToAdd.chunk = this;
    this.blocks[y][x] = blockToAdd;
    return blockToAdd;
  }
  /**
   * Adds a tile to the chunk.
   * @param {string} block Registry name of the tile
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @param {string} [layer=Chunk.Layer.tiles] Floor layer to add the tile to.
   */
  addTile(block, x = 0, y = 0, layer = Chunk.Layer.tiles) {
    if (this[layer][y] === undefined || this[layer][y][x] === undefined)
      throw new Error(`Can't place tile outside of chunk (at ${x}, ${y} (not) in chunk)`);

    this[layer][y][x] = GroundTile.getNumericalID(block);
  }
  /**
   * Removes a block from the chunk.
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @returns {Boolean} True if the block was removed, false if not.
   */
  removeBlock(x, y) {
    if (this.blocks[y] === undefined || this.blocks[y][x] === undefined)
      throw new Error(
        "Can't remove block outside of chunk (at " + x + ", " + y + " (not) in chunk)",
      );
    if (this.blocks[y][x]) {
      this.blocks[y][x] = null;
      return true;
    }
    return false;
  }
  /**
   * Removes a tile from the chunk.
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @param {string} [layer=Chunk.Layer.tiles] Floor layer to add the tile to.
   * @returns {Boolean} True if the tile was removed, false if not.
   */
  removeTile(x, y, layer = Chunk.Layer.tiles) {
    if (this[layer][y] === undefined || this[layer][y][x] === undefined)
      throw new Error(`Can't remove time outside of chunk (at ${x}, ${y} in chunk)`);
    if (this[layer][y][x]) {
      this[layer][y][x] = 0;
      return true;
    }
    return false;
  }
  /**
   * Gets a block from the chunk.
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @returns {Block | null} The block, or null if no block is present.
   */
  getBlock(x, y) {
    if (
      this.blocks[y] === undefined ||
      this.blocks[y][x] === undefined
    )
      throw new Error(`Can't get block outside of chunk (at ${x}, ${y} in chunk)`);
    return this.blocks[y][x];
  } /**
   * Gets a tile from the chunk.
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @param {keyof Chunk.Layer} layer Layer that tiles should be looked for in.
   * @returns {string?} The tile's registry name, or null if no block is present.
   */
  getTile(x, y, layer = Chunk.Layer.tiles) {
    if (this[layer][y] === undefined || this[layer][y][x] === undefined)
      throw new Error(`Can't get tile outside of chunk (at ${x}, ${y} in chunk)`);
    return GroundTile.getNameFromID(this[layer][y][x]);
  } /**
   * Gets a tile ID from the chunk.
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @param {keyof Chunk.Layer} layer Layer that tiles should be looked for in.
   * @returns {number} The tile's numerical ID, or 0 if no block is present.
   */
  getTileID(x, y, layer = Chunk.Layer.tiles) {
    if (this[layer][y] === undefined || this[layer][y][x] === undefined)
      throw new Error(`Can't get tile outside of chunk (at ${x}, ${y} in chunk)`);
    return this[layer][y][x];
  }/**
   * Gets the tile from the highest occupied layer at a position in the chunk.\
   * For example, if both an ore and a tile are present, then the ore is chosen.
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @returns {string?} The tile's registry name, or null if no block is present.
   */
  getHighestTile(x, y) {
    if (this.tiles[y] === undefined || this.tiles[y][x] === undefined)
      throw new Error(`Can't get tile outside of chunk (at ${x}, ${y} in chunk)`);
    return GroundTile.getNameFromID(this.ores[y][x] ?? this.tiles[y][x]);
  }/**
   * Gets the tile from the highest occupied layer at a position in the chunk.\
   * For example, if both an ore and a tile are present, then the ore is chosen.
   * @param {number} x X position offset from the chunk
   * @param {number} y Y position offset from the chunk
   * @returns {number} The tile's numerical ID, or null if no block is present.
   */
  getHighestTileID(x, y) {
    if (this.tiles[y] === undefined || this.tiles[y][x] === undefined)
      throw new Error(`Can't get tile outside of chunk (at ${x}, ${y} in chunk)`);
    return (this.ores[y][x] ?? this.tiles[y][x]);
  }
  randomTick() {
    iterate2DArray(
      this.tiles,
      (tile, y, x) => tile && tru(World.randomTick) && GroundTile.randomTick(tile, x, y),
    );
    iterate2DArray(
      this.ores,
      (tile, y, x) => tile && tru(World.randomTick) && GroundTile.randomTick(tile, x, y),
    );
    // iterate2DArray(this.floor, (floor) => floor && tru(World.randomTick) && floor.tick());
  }
  tick() {
    iterate2DArray(this.blocks, (block) => block && !block.disabled && block.tick());
  }
  drawTiles() {
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
  }
  drawOres() {
    // translate(blockSize / 2, blockSize / 2);
    iterate2DArray(
      this.ores,
      (tile, y, x) =>
        tile &&
        GroundTile.draw(
          tile,
          (x + this.i * chunkSize) * blockSize,
          (y + this.j * chunkSize) * blockSize,
        ),
    );
  }
  drawBlocksOnly() {
    // translate(blockSize / 2, blockSize / 2);
    iterate2DArray(this.blocks, (block) => block && block.draw());
  }
  postDrawBlocksOnly() {
    // translate(blockSize / 2, blockSize / 2);
    iterate2DArray(this.blocks, (block) => block && block.postDraw());
  }
  postDraw2BlocksOnly() {
    // translate(blockSize / 2, blockSize / 2);
    iterate2DArray(this.blocks, (block) => block?.postDraw2 && block.postDraw2());
  }
  /**@returns {SerialisedChunk} */
  serialise() {
    return {
      blocks: mapJagged2DArray(this.blocks, (y) => (y ? y.serialise() : null)),
      tiles: mapJagged2DArray(this.tiles, t => GroundTile.getNameFromID(t)),
      ores: mapJagged2DArray(this.ores, t => GroundTile.getNameFromID(t)),
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
        let sfloor = (created.ores ?? mapJagged2DArray(created.floors, (s,r,c) => s?.block ))[y][x];
        let stile = created.tiles[y][x];
        //Floor, Tile
        if (stile) chunk.addTile(stile, x, y);
        if (sfloor) chunk.addTile(sfloor, x, y, "ores");
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

