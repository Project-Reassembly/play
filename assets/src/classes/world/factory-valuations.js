import { create2DArray, index, modifySubsection, multiMax, multiMin } from "../../core/2D-array.js";
import { rnd, roundNum } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { chunkSize, worldSize } from "../../scaling.js";
import { Block } from "../block/block.js";
import { Chunk } from "./chunk.js";

export const REGION_SIZE = 4;

export class FactoryEvaluator {
  #instantUpdateRequested = false;
  static interval = 180;
  #time = 0;
  constructor(world) {
    this.world = world;
  }
  /**@type {Map<string, number[][]>} */
  values = new Map();
  /**@type {Set<import("../../core/number.js").idx>} */
  #wantsUpdates = new Set();

  reset() {
    this.#time = 0;
    this.#wantsUpdates.clear();
  }

  // AUTO-UPDATE

  requestChunkUpdate(i, j) {
    this.#wantsUpdates.add(index.of(i, j));
  }
  requestInstantChunkUpdate(i, j) {
    this.#wantsUpdates.add(index.of(i, j));
    this.#instantUpdateRequested = true;
  }
  chunkWantsUpdate(i, j) {
    return this.#wantsUpdates.has(index.of(i, j));
  }
  tick() {
    if (this.#time === 0) this.updateWorldForAllTeams();
    this.#time++;
    if (this.#time % 180 !== 0 && !this.#instantUpdateRequested) return;
    this.#instantUpdateRequested = false;

    if (this.#wantsUpdates.size > 0) {
      const [nextInLine] = this.#wantsUpdates;
      this.#wantsUpdates.delete(nextInLine);
      console.log(`Updating chunk ${nextInLine} ${index.str(nextInLine)}`);
      Registries.corps.forEach((c, n) => {
        this.updateChunk(nextInLine, n);
      });
    }
  }

  /** Computes a 2D array of factory values for a team for standard regions in a chunk. */
  updateChunk(idx, team) {
    const chunk = this.world.chunkI(idx);
    const startX = index.col(idx) * 4,
      startY = index.row(idx) * 4;
    modifySubsection(
      this.values.get(team),
      (oldVal, j, i) => this.valueRegion(chunk, i - startX, j - startY, team),
      startX,
      startY,
      4,
      4,
    );
  }

  // COMMON

  regionContaining(bx, by) {
    return index.of(bx / chunkSize / REGION_SIZE, by / chunkSize / REGION_SIZE);
  }
  /**
   * Computes the total factory value for a team of a standard region of blocks.
   * @param {(Block|null)[]} blocks
   */
  valueRegion(chunk, i, j, team) {
    return this.valueBlocks(
      this.getRegion(chunk, i * REGION_SIZE, j * REGION_SIZE, REGION_SIZE, REGION_SIZE),
      team,
    );
  }
  /** Gets a random position in the region with the highest value in the world for the specified team - the region which is most valuable for that team. */
  getHighValueTargetPosition(team) {
    const arr = this.values.get(team);
    const indices = multiMax(arr),
      [first] = indices;
    const ids = [...indices].map((x) => index.str(x));
    console.log(
      `found ${indices.size} possible spots: ${ids.length > 30 ? ids.slice(0, 30) + "..." : ids} with value ${index.at(arr, first)}`,
    );
    // block index
    const corner = index.scale(rnd.of(...indices), REGION_SIZE);
    // random in there
    const target = index.offset(corner, rnd.int(3), rnd.int(3));
    return target;
  }
  /** Gets a random position in the region with the lowest value in the world for the specified team - the region which is least valuable for that team, but not actively hostile. */
  getLowValueTargetPosition(team) {
    const arr = this.values.get(team);
    const indices = multiMin(arr, 0),
      [first] = indices;
    const ids = [...indices].map((x) => index.str(x));
    console.log(
      `found ${indices.size} possible spots: ${ids.length > 30 ? ids.slice(0, 30) + "..." : ids} with value ${index.at(arr, first)}`,
    );
    // block index
    const corner = index.scale(rnd.of(...indices), REGION_SIZE);
    // random in there
    const target = index.offset(corner, rnd.int(3), rnd.int(3));
    return target;
  }
  /**
   * Computes the total factory value for a team of an array of blocks.
   * @param {(Block|null)[]} blocks
   */
  valueBlocks(blocks, team) {
    return roundNum(
      blocks.reduce((p, c) => {
        if (!c) return p;
        let v = c.value();
        if (c?.team !== team) v = -v;
        return p + v;
      }, 0),
      2,
    );
  }
  /**
   * Reads a rectangular region of blocks from a chunk into a single flat array.
   * @param {Chunk} chunk
   * @param {number} sx
   * @param {number} sy
   */
  getRegion(chunk, sx, sy, width, height) {
    let blocks = [];
    for (let i = 0; i < height; i++) blocks.push(...chunk.blocks[sy + i].slice(sx, sx + width));
    return blocks;
  }

  // GET ALL

  /** Computes a 2D array of factory values for **each** team for all standard regions in the whole world. */
  updateWorldForAllTeams() {
    this.#wantsUpdates.clear();
    Registries.corps.forEach((c, n) => this.updateWorld(n));
  }
  /** Computes a 2D array of factory values for a team for all standard regions in the whole world. */
  updateWorld(team) {
    const regions = create2DArray(worldSize, (i, j) => this.valueChunkRegions(i, j, team));
    this.values.set(
      team,
      create2DArray(
        worldSize * REGION_SIZE,
        (i, j) =>
          regions[Math.floor(j / REGION_SIZE)][Math.floor(i / REGION_SIZE)][j % REGION_SIZE][
            i % REGION_SIZE
          ],
      ),
    );
  }
  /** Computes a 2D array of factory values for a team for standard regions in a chunk. */
  valueChunkRegions(x, y, team) {
    const chunk = this.world.chunk(x, y);
    return create2DArray(chunkSize * 0.25, (i, j) => this.valueRegion(chunk, i, j, team));
  }
}
