import { RegisteredItem } from "../../core/registered-item.js";
import { construct, constructFromRegistry } from "../../core/constructor.js";
import { Integrate } from "../../lib/integrate.js";
import { blockSize, chunkSize, worldSize } from "../../scaling.js";
import {
  noise,
  noiseSeed,
  setNoiseParams,
  rng1,
} from "../../lib/q5-noise-function.js";
import { roundNum, tru, rnd } from "../../core/number.js";
/*
|| LIST OF WORLDGEN MESSAGE TYPES
|| "genstage", "progress-stage", "finish": Don't use, internal.
|| "chunk": Adds or replaces a chunk in the world.
||  - i: horizontal offset from the top-left corner of the world.
||        The chunk equivalent of an x-coordinate.
||  - j: vertical offset from the top-left corner of the world.
||        The chunk equivalent of an y-coordinate.
||  - chunk: 1D array of tile definitions, with a registry name
||        'block', and x- and y-coordinates within the chunk.
||         Extra properties can be set with 'construction'.
|| "progress": Sets the position of the progress bar.
||   - progress: Number from 0-1. 0 means empty bar, 1 means full.
|| "build": Builds a structure.
||   - x, y: Coordinates of the centre block.
||   - blocks: Array of blocks to place. Similar to "chunk"'s 'chunk' property.
||   - name: Name of the structure. Used in world breakdown, and structure location.
*/

class Generator extends RegisteredItem {
  stageTitle = "Generating...";
  /** Runs this generator on the world. */
  generate(seed) {}
}
/** Perlin Noise-based generator */
class NoiseGenerator extends Generator {
  /** Horizontal scaling of the noise function. */
  noiseScale = 2;
  /** Maximum height of the noise function. Lower numbers flatten the pattern. */
  noiseLevel = 255;
  /** The number of layers of noise. */
  octaves = 4;
  /** How much each additional octave contributes, compared to the previous. */
  falloff = 0.5;
  generate(seed) {
    //Create grid
    let maxProgress = worldSize ** 2;
    let progress = 0;
    let newChunk;
    doNoise(
      seed,
      this.noiseLevel,
      this.noiseScale,
      this.octaves,
      this.falloff,
      {
        prechunk: (i, j) => (newChunk = []),
        postchunk: (i, j) => {
          progress++;
          this.forEachChunk(newChunk, i, j);
          postMessage({ type: "progress", progress: progress / maxProgress });
        },
        eachpos: (x, y, level) => {
          this.forEachPosition(level, x, y, newChunk);
        },
      }
    );
  }
  forEachPosition(level, x, y, constructing) {}
  forEachChunk(chunk, i, j) {}
}

/** Creates the base tile layer for the world. */
class TileGenerator extends NoiseGenerator {
  /**@type {TileGenerationOptions[]} */
  tiles = [];
  init() {
    this.tiles = this.tiles.map((x) => {
      x.type ??= "tile-gen-options";
      return constructFromRegistry(x, wtype);
    });
  }
  forEachPosition(level, x, y, constructing) {
    for (let optionsobj of this.tiles) {
      if (optionsobj.valid(level, x, y)) {
        constructing.push({
          block: optionsobj.tile,
          x: x,
          y: y,
        });
        break;
      }
    }
  }
  forEachChunk(chunk, i, j) {
    postMessage({ type: "chunk", def: { chunk: chunk, i: i, j: j } });
  }
}

class BlockGenerator extends Generator {
  /**@type {{defs: {x: int, y: int, block: string, direction: int}, weight: int}[]} */
  variants = [];
  name = "-";
  attempts = 1000;
  chance = 0.1;
  separation = 3;
  _positions = [];
  generate(seed) {
    rng1.setSeed(seed);
    for (let i = 0; i < this.attempts; i++) {
      let x = Math.floor(rng1.rand() * worldSize * chunkSize);
      let y = Math.floor(rng1.rand() * worldSize * chunkSize);
      if (rng1.rand() < this.chance) this.forEachPosition(x, y);
      postMessage({ type: "progress", progress: i / this.attempts });
    }
  }
  forEachPosition(x, y) {
    let extraName = "";
    let totalWeight = this.variants.reduce((sum, thi) => sum + thi.weight, 0);
    let variant = Math.floor(rng1.rand() * totalWeight + 1);
    let index = 0;
    let selected = this.variants.at(0);
    for (let v of this.variants) {
      index += v.weight;
      if (index > variant) {
        selected = v;
        extraName = v.name ?? "";
        break;
      }
    }
    if (this.outOfRange(x, y)) {
      postMessage({
        type: "build",
        name: this.name + (extraName ? " (" + extraName + ")" : ""),
        blocks: selected.defs,
        x: x,
        y: y,
      });
      this._positions.push({ x: x, y: y });
      this._generated++;
    }
  }
  outOfRange(x, y) {
    for (let pos of this._positions) {
      if (((x - pos.x) ** 2 + (y - pos.y) ** 2) ** 0.5 < this.separation)
        return false;
    }
    return true;
  }
}

class OreGenerator extends Generator {
  /**@type {OreGenerationOptions[]} */
  ores = [];
  /** Multiplier for the world seed. */
  seedManipulator = 1.5;
  init() {
    this.ores = this.ores.map((x) => {
      x.type ??= "ore-gen-options";
      return constructFromRegistry(x, wtype);
    });
  }
  generate(seed) {
    let maxProgress = worldSize ** 2 * this.ores.length;
    let progress = 0;
    for (let o = 0; o < this.ores.length; o++) {
      let ore = this.ores[o];
      doNoise(
        (seed) * this.seedManipulator * (o + 1),
        100,
        ore.scale,
        ore.octaves,
        ore.falloff,
        {
          postchunk: (i, j) => {
            progress++;
            postMessage({ type: "progress", progress: progress / maxProgress });
          },
          eachpos: (x, y, level, i, j) => {
            if (level > ore.threshold) {
              postMessage({
                type: "place",
                x: x + i * chunkSize,
                y: y + j * chunkSize,
                layer: "floor",
                block: ore.tile,
                target: ore.target,
              });
            }
          },
        }
      );
    }
  }
}

class GenerationOptions extends RegisteredItem {
  min = 0;
  max = 255;
  valid(level, x, y) {
    return this.min <= level && level <= this.max;
  }
}

class TileGenerationOptions extends GenerationOptions {
  tile = "stone";
}

class OreGenerationOptions extends GenerationOptions {
  tile = "stone";
  threshold = 100;
  falloff = 0.5;
  octaves = 4;
  scale = 1;
  target = null;
}

let wtype = new Integrate.Registry();

wtype.add("gen-options", GenerationOptions);
wtype.add("tile-gen-options", TileGenerationOptions);
wtype.add("ore-gen-options", OreGenerationOptions);

/**
 * Does stuff with a 2D Perlin noise function.
 * @param {int} seed Noise seed.
 * @param {number} level Scalar for noise height.
 * @param {number} scale Scalar for noise width.
 * @param {int} octaves Number of layers of noise.
 * @param {number} falloff Amount each layer contributes, as a fraction of the previous.
 * @param {{prechunk: (i, j)=>void, postchunk: (i,j)=>void, eachpos: (x, y, level, i, j)=>void}} funcs Functions to provide actual functionality.
 */
function doNoise(
  seed,
  level = 100,
  scale = 1,
  octaves = 4,
  falloff = 0.5,
  funcs
) {
  noiseSeed(seed);
  setNoiseParams(1, octaves, falloff);
  //Create grid
  //Procedural ground gen
  scale *= 0.001;
  for (let i = 0; i < worldSize; i++) {
    //Chunk coords
    for (let j = 0; j < worldSize; j++) {
      if (funcs.prechunk) funcs.prechunk(i, j);
      for (let x = 0; x < chunkSize; x++) {
        //Block coords
        for (let y = 0; y < chunkSize; y++) {
          let nx = roundNum(
            scale *
              ((worldSize / 2 + i) * chunkSize * blockSize +
                (x * blockSize + blockSize / 2)),
            2
          );
          let ny = roundNum(
            scale *
              ((worldSize / 2 + j) * chunkSize * blockSize +
                (y * blockSize + blockSize / 2)),
            2
          );
          let n = noise(nx, ny)
          let c = level * n;
          ////////////////////////
          if (funcs.eachpos) funcs.eachpos(x, y, c, i, j);
          /////////////////////////
        }
      }
      if (funcs.postchunk) funcs.postchunk(i, j);
    }
  }
}
export {
  Generator,
  NoiseGenerator,
  TileGenerationOptions,
  TileGenerator,
  BlockGenerator,
  OreGenerationOptions,
  OreGenerator,
  GenerationOptions,
  doNoise,
};
