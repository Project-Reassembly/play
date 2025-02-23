class World {
  static size = 25;
  particles = [];
  /** @type {Array<Entity>} */
  entities = [];
  /** @type {Array<Bullet>} */
  bullets = [];
  /** @type {Array<Array<Chunk>>} */
  chunks = null;
  name = "World";
  constructor(name = "World") {
    this.name = name;
  }
  tickAll() {
    this.#actualTick();
    this.#removeDead();
  }
  #actualTick() {
    //Tick *everything*
    for (let bullet of this.bullets) {
      bullet.step(1);
    }
    for (let particle of this.particles) {
      particle.step(1);
    }
    for (let entity of this.entities) {
      entity.tick();
    }
    iterate2DArray(this.chunks, (chunk) => chunk && chunk.tick());
  }
  #removeDead() {
    //THEN remove dead stuff
    let len = this.bullets.length;
    for (let b = 0; b < len; b++) {
      if (this.bullets[b]?.remove) {
        let bullet = this.bullets[b];
        for (let instance of bullet.damage) {
          if (instance.area)
            //If it explodes
            splashDamageInstance(
              bullet.x,
              bullet.y,
              instance.amount,
              instance.type,
              instance.area,
              bullet.entity,
              instance.visual, //        \
              instance.sparkColour, //   |
              instance.sparkColourTo, // |
              instance.smokeColour, //   |- These are optional, but can be set per instance
              instance.smokeColourTo, // |
              instance.waveColour, //     /
              bullet.status,
              bullet.statusDuration
            );
          if (instance.blinds) {
            blindingFlash(
              bullet.x,
              bullet.y,
              instance.blindOpacity,
              instance.blindDuration,
              instance.glareSize
            );
          }
        }
        bullet.frag();
        //Delete the bullet
        this.bullets.splice(b, 1);
      }
    }
    len = this.particles.length;
    for (let p = 0; p < len; p++) {
      if (this.particles[p]?.remove) {
        this.particles.splice(p, 1);
      }
    }
    len = this.entities.length;
    for (let e = 0; e < len; e++) {
      if (this.entities[e]?.dead) {
        this.entities.splice(e, 1);
      }
    }
    //No search algorithms => faster
  }
  drawAll() {
    iterate2DArray(
      this.chunks,
      (chunk) =>
        chunk &&
        World.isInRenderDistance(
          chunk,
          Chunk.size * Block.size,
          Chunk.size * Block.size
        ) &&
        chunk.draw()
    );
    for (let entity of this.entities) {
      if (!World.isInRenderDistance(entity)) continue;
      entity.draw();
    }
    for (let bullet of this.bullets) {
      if (!World.isInRenderDistance(bullet)) continue;
      bullet.draw();
    }
    for (let particle of this.particles) {
      if (!World.isInRenderDistance(particle)) continue;
      particle.draw();
    }
  }
  static isInRenderDistance(thing, posScale = 1, padding = 0) {
    if (thing.x * posScale < ui.camera.x - width / 2 - padding) return false;
    if (thing.x * posScale > ui.camera.x + width / 2 + padding) return false;
    if (thing.y * posScale < ui.camera.y - height / 2 - padding) return false;
    if (thing.y * posScale > ui.camera.y + height / 2 + padding) return false;
    return true;
  }
  /**
   * Creates the tiles of the world. Deletes all existing chunks first.
   * @param {number} size Size of the world in chunks.
   * @param {number} noiseScale Size of the noise function. Bigger makes more noisy.
   * @param {number} noiseLevel Vertical scale of the noise. Too low, and everything's water.
   */
  async generateTiles(noiseScale = 1, noiseLevel = 255) {
    //Create grid
    this.chunks = create2DArray(World.size);
    //Procedural ground gen
    noiseScale *= 0.001;
    for (let i = 0; i < World.size; i++) {
      //Each row
      //Chunk coords
      for (let j = 0; j < World.size; j++) {
        let newChunk = new Chunk();
        newChunk.world = this;
        newChunk.x = Math.round(i);
        newChunk.y = Math.round(j);
        for (let x = 0; x < Chunk.size; x++) {
          //Block coords
          for (let y = 0; y < Chunk.size; y++) {
            let nx = roundNum(
              noiseScale *
                ((World.size / 2 + i) * Chunk.size * Block.size +
                  (x * Block.size + Block.size / 2)),
              2
            );
            let ny = roundNum(
              noiseScale *
                ((World.size / 2 + j) * Chunk.size * Block.size +
                  (y * Block.size + Block.size / 2)),
              2
            );
            let c = noiseLevel * noise(nx, ny);
            if (c > 175) {
              newChunk.addBlock("stone", x, y, "tiles");
            } else if (c > 100) {
              newChunk.addBlock("grass", x, y, "tiles");
            } else if (c > 75) {
              newChunk.addBlock("sand", x, y, "tiles");
            } else if (c > 65) {
              newChunk.addBlock("sand-water", x, y, "tiles");
            } else if (c > 50) {
              newChunk.addBlock("water", x, y, "tiles");
            } else {
              newChunk.addBlock("water", x, y, "tiles");
            }
          }
        }
        this.chunks[j][i] = newChunk;
      }
    }
  }
  isPositionFree(x, y) {
    let cx = Math.floor(x / Chunk.size),
      bx = x % Chunk.size;
    let cy = Math.floor(y / Chunk.size),
      by = y % Chunk.size;
    let chunk = this.chunks[cy][cx];
    if (!chunk)
      throw new Error("There is no chunk at (chunk) x:" + cx + ", y:" + cy);
    return chunk.getBlock(bx, by, "blocks") === null;
  }
  placeAt(block, x, y) {
    let cx = Math.floor(x / Chunk.size),
      bx = x % Chunk.size;
    let cy = Math.floor(y / Chunk.size),
      by = y % Chunk.size;
    let chunk = this.chunks[cy][cx];
    if (!chunk)
      throw new Error("There is no chunk at (chunk) x:" + cx + ", y:" + cy);
    chunk.addBlock(block, bx, by, "blocks");
  }
  break(x, y) {
    let cx = Math.floor(x / Chunk.size),
      bx = x % Chunk.size;
    let cy = Math.floor(y / Chunk.size),
      by = y % Chunk.size;
    let chunk = this.chunks[cy][cx];
    if (!chunk)
      throw new Error("There is no chunk at (chunk) x:" + cx + ", y:" + cy);
    let broken = chunk.getBlock(bx, by, "blocks");
    chunk.removeBlock(bx, by, "blocks");
    return broken;
  }
  getBlock(x, y, layer = "blocks") {
    let cx = Math.floor(x / Chunk.size),
      bx = x % Chunk.size;
    let cy = Math.floor(y / Chunk.size),
      by = y % Chunk.size;
    let chunk = this.chunks[cy][cx];
    if (!chunk)
      throw new Error("There is no chunk at (chunk) x:" + cx + ", y:" + cy);
    let block = chunk.getBlock(bx, by, layer);
    return block;
  }
}
