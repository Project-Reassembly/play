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
*/

class Generator {
  /** Runs this generator on the world. */
  generate() {}
}

class TileGenerator extends Generator {
  noiseScale = 2;
  noiseLevel = 255;
  tiles = [];
  stageTitle = "Generating...";
  init() {
    this.tiles = this.tiles.map((x) => construct(x, "gen-options"));
  }
  /**
   * Creates the tiles for a world.
   * @param {number} size Size of the world in chunks.
   * @param {number} noiseScale Size of the noise function. Bigger makes more noisy.
   * @param {number} noiseLevel Vertical scale of the noise. Too low, and everything's water.
   * @param {TileGenerationOptions[]} options Array of generation options for this generation stage. Uses the first matching TileGenerationOptions for each position.
   */
  generate(grid) {
    //Create grid
    let maxProgress = World.size ** 2;
    let progress = 0;
    //Procedural ground gen
    this.noiseScale *= 0.001;
    for (let i = 0; i < World.size; i++) {
      //Each row
      let row = [];
      //Chunk coords
      for (let j = 0; j < World.size; j++) {
        let newChunk = [];
        for (let x = 0; x < Chunk.size; x++) {
          //Block coords
          for (let y = 0; y < Chunk.size; y++) {
            let nx = roundNum(
              this.noiseScale *
                ((World.size / 2 + i) * Chunk.size * Block.size +
                  (x * Block.size + Block.size / 2)),
              2
            );
            let ny = roundNum(
              this.noiseScale *
                ((World.size / 2 + j) * Chunk.size * Block.size +
                  (y * Block.size + Block.size / 2)),
              2
            );
            let c = this.noiseLevel * noise(nx, ny);
            for (let optionsobj of this.tiles) {
              if (optionsobj.valid(c)) {
                newChunk.push({
                  block: optionsobj.tile,
                  x: x,
                  y: y,
                });
                break;
              }
            }
          }
        }
        progress++;
        postMessage({ type: "chunk", def: { chunk: newChunk, i: i, j: j } });
        postMessage({ type: "progress", progress: progress / maxProgress });
      }
    }
  }
}

class GenerationOptions {
  min = 0;
  max = 255;
  valid(level) {
    return this.min <= level && level <= this.max;
  }
}

class TileGenerationOptions extends GenerationOptions {
  tile = "stone";
}
