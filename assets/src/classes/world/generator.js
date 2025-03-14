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

class Generator {
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
    let maxProgress = World.size ** 2;
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
    this.tiles = this.tiles.map((x) => construct(x, "tile-gen-options"));
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

class BlockGenerator extends NoiseGenerator {
  /**@type {{x: int, y: int, block: string}[]} */
  defs = [];
}

class OreGenerator extends Generator {
  /**@type {OreGenerationOptions[]} */
  ores = [];
  /** Multiplier for the world seed. */
  seedManipulator = 1.5;
  init() {
    this.ores = this.ores.map((x) => construct(x, "ore-gen-options"));
  }
  generate(seed) {
    let maxProgress = World.size ** 2 * this.ores.length;
    let progress = 0;
    for (let o = 0; o < this.ores.length; o++) {
      let ore = this.ores[o];
      doNoise(
        seed * this.seedManipulator * (o + 1),
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
                x: x + i * Chunk.size,
                y: y + j * Chunk.size,
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

class GenerationOptions {
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
  perlin_octaves = octaves;
  perlin_amp_falloff = falloff;
  //Create grid
  //Procedural ground gen
  scale *= 0.001;
  for (let i = 0; i < World.size; i++) {
    //Chunk coords
    for (let j = 0; j < World.size; j++) {
      if (funcs.prechunk) funcs.prechunk(i, j);
      for (let x = 0; x < Chunk.size; x++) {
        //Block coords
        for (let y = 0; y < Chunk.size; y++) {
          let nx = roundNum(
            scale *
              ((World.size / 2 + i) * Chunk.size * Block.size +
                (x * Block.size + Block.size / 2)),
            2
          );
          let ny = roundNum(
            scale *
              ((World.size / 2 + j) * Chunk.size * Block.size +
                (y * Block.size + Block.size / 2)),
            2
          );
          let c = level * noise(nx, ny);
          ////////////////////////
          if (funcs.eachpos) funcs.eachpos(x, y, c, i, j);
          /////////////////////////
        }
      }
      if (funcs.postchunk) funcs.postchunk(i, j);
    }
  }
}
