class World {
  static size = 64;
  /** The distance in chunks **outside the render distance** that will still tick. */
  static simulationDistance = 5;
  particles = [];
  /** @type {Array<Entity>} */
  entities = [];
  /** @type {Array<Bullet>} */
  bullets = [];
  /** @type {Array<Array<Chunk>>} */
  chunks = null;
  name = "World";
  seed = null;
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
    //Only tick simulated chunks
    iterate2DArray(
      this.chunks,
      (chunk) =>
        chunk &&
        World.isInRenderDistance(
          chunk,
          Chunk.size * Block.size,
          0.5 + World.simulationDistance,
          0.5,
          0.5
        ) &&
        chunk.tick()
    );
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
          0.5,
          0.5,
          0.5
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
  static isInRenderDistance(
    thing,
    posScale = 1,
    padding = 0,
    xoffset = 0,
    yoffset = 0
  ) {
    if (
      (thing.x + xoffset) * posScale <
      ui.camera.x - width / 2 - padding * posScale
    )
      return false;
    if (
      (thing.x + xoffset) * posScale >
      ui.camera.x + width / 2 + padding * posScale
    )
      return false;
    if (
      (thing.y + yoffset) * posScale <
      ui.camera.y - height / 2 - padding * posScale
    )
      return false;
    if (
      (thing.y + yoffset) * posScale >
      ui.camera.y + height / 2 + padding * posScale
    )
      return false;
    return true;
  }
  prepareForGeneration() {
    this.chunks = create2DArray(World.size);
  }
  isPositionFree(x, y, layer = "blocks") {
    if (!this.chunks) throw new Error("The world has not been generated!");
    let cx = Math.floor(x / Chunk.size),
      bx = x % Chunk.size;
    let cy = Math.floor(y / Chunk.size),
      by = y % Chunk.size;
    let cr = this.chunks[cy];
    if (!cr) return false;
    let chunk = cr[cx];
    if (!chunk) return false;
    return chunk.getBlock(bx, by, layer) === null;
  }
  placeAt(block, x, y, layer = "blocks") {
    if (!this.chunks) throw new Error("The world has not been generated!");
    let cx = Math.floor(x / Chunk.size),
      bx = x % Chunk.size;
    let cy = Math.floor(y / Chunk.size),
      by = y % Chunk.size;
    let cr = this.chunks[cy];
    let chunk = cr ? cr[cx] : null;
    if (!chunk)
      throw new Error("There is no chunk at (chunk) x:" + cx + ", y:" + cy);
    return chunk.addBlock(block, bx, by, layer);
  }
  break(x, y, layer = "blocks") {
    if (!this.chunks) throw new Error("The world has not been generated!");
    let cx = Math.floor(x / Chunk.size),
      bx = x % Chunk.size;
    let cy = Math.floor(y / Chunk.size),
      by = y % Chunk.size;
    let chunk = this.chunks[cy][cx];
    if (!chunk)
      throw new Error("There is no chunk at (chunk) x:" + cx + ", y:" + cy);
    let broken = chunk.getBlock(bx, by, layer);
    chunk.removeBlock(bx, by, layer);
    return broken;
  }
  /**@returns `undefined` if no chunk, `null` if no block, or a `Block` otherwise. */
  getBlock(x, y, layer = "blocks") {
    if (!this.chunks) throw new Error("The world has not been generated!");
    try {
      let cx = Math.floor(x / Chunk.size),
        bx = x % Chunk.size;
      let cy = Math.floor(y / Chunk.size),
        by = y % Chunk.size;
      let cr = this.chunks[cy];
      if (!cr) return;
      let chunk = cr[cx];
      if (!chunk) return;
      let block = chunk.getBlock(bx, by, layer);
      return block;
    } catch (error) {
      return null;
    }
  }
  /** Similar to `getBlock`, but will always return a block, or throw an error otherwise. */
  getBlockErroring(x, y, layer = "blocks") {
    let block = this.getBlock(x, y, layer);
    if (block === undefined)
      throw new Error("There is no chunk at (block) x:" + x + ", y:" + y);
    if (block === null)
      throw new Error("There is no block at x:" + x + ", y:" + y);
    return block;
  }
}
