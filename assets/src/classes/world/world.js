/**
 * @typedef SerialisedWorld
 * @prop {SerialisedChunk[][]} chunks
 * @prop {SerialisedEntity[]} entities
 * @prop {string} name
 * @prop {int} seed
 */

/** */
class World {
  static size = 16;
  /** The chance for a *chunk* to random tick. */
  static randomTick = 0.01;
  /** The distance in chunks **outside the render distance** that will still tick. */
  static simulationDistance = 5;
  /**
   * @type {Array<ImageParticle|ShapeParticle|TextParticle|WaveParticle>}
   * Particles that will be drawn underneath normal blocks, but on top of floors and tiles.
   */
  floorParticles = [];
  /** @type {Array<ImageParticle|ShapeParticle|TextParticle|WaveParticle>} */
  particles = [];
  /** @type {Array<Entity>} */
  entities = [];
  /** @type {Array<Bullet>} */
  bullets = [];
  /** @type {Array<Array<Chunk>>} */
  chunks = null;
  /**
   * @type {PhysicalObject[]} \
   * An array of extra objects, none of which will be saved.\
   * Will not render on their own, so use of VFX (`this.emit(...)`) is required for rendering.\
   * Use one of `particles`, `floorParticles`, `entities` or `bullets` instead of this where possible.
   */
  physobjs = [];
  name = "World";
  seed = null;
  /**Chunks to render this frame.
   * @type {Array<Chunk>} */
  toRender = [];
  constructor(name = "World") {
    this.name = name;
  }
  tickAll() {
    this.#actualTick();
    this.#removeDead();
  }
  #actualTick() {
    this.toRender = this.getRenderedChunks(undefined, ui.camera.zoom);
    //Tick *everything*
    this.physobjs.forEach((p) => p.tick());
    this.floorParticles.forEach((p) => p.step(1));
    this.bullets.forEach((b) => b.step(1));
    this.particles.forEach((p) => p.step(1));
    this.entities.forEach((entity) => {
      entity.tick();
      if (entity instanceof InventoryEntity) {
        entity.inventory.iterate((stack) => {
          stack.getItem().tick(entity);
        }, true);
      }
      if (entity instanceof EquippedEntity) {
        for (let key of ["leftHand", "rightHand"]) {
          entity[key].iterate((stack) => {
            stack.getItem().tick(entity);
          }, true);
        }
      }
    });
    //Only tick simulated chunks
    this.getRenderedChunks(World.simulationDistance).forEach((chunk) => {
      chunk.tick();
      if (tru(World.randomTick)) chunk.randomTick();
    });
  }
  #removeDead() {
    //THEN remove dead stuff
    let len = this.bullets.length;
    for (let b = 0; b < len; b++) {
      if (this.bullets[b]?.remove && !this.bullets[b].exploded) {
        let bullet = this.bullets[b];
        bullet.exploded = true;
        for (let instance of bullet.damage) {
          if (!instance.spread) instance.spread = 0;
          if (instance.radius) {
            //If it explodes
            let boom = new (instance.nuclear ? NuclearExplosion : Explosion)(
              instance
            );
            boom.x = bullet.x;
            boom.y = bullet.y;
            boom.world = bullet.world;
            boom.dealDamage();
          }
          if (instance.blinds) {
            flash(
              bullet.x,
              bullet.y,
              instance.blindOpacity,
              instance.blindDuration,
              instance.glareSize
            );
          }
          bullet.emit(instance.effect ?? "none");
        }
        bullet.emit(bullet.despawnEffect);
        bullet.frag();
        bullet.incend();
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
    len = this.floorParticles.length;
    for (let p = 0; p < len; p++) {
      if (this.floorParticles[p]?.remove) {
        this.floorParticles.splice(p, 1);
      }
    }
    len = this.entities.length;
    for (let e = 0; e < len; e++) {
      if (this.entities[e]?.dead) {
        this.entities.splice(e, 1);
      }
    }
    len = this.physobjs.length;
    for (let p = 0; p < len; p++) {
      if (this.physobjs[p]?.remove) {
        this.physobjs.splice(p, 1);
      }
    }
    //No search algorithms => faster
  }
  /**
   * Returns an array of chunks to be rendered this frame.
   * @returns {Chunk[]}
   */
  getRenderedChunks(padding = 0, zoom = 1) {
    let chunks = [];
    iterate2DArray(
      this.chunks,
      (chunk) =>
        chunk &&
        World.isInRenderDistance(
          chunk,
          Chunk.size * Block.size,
          0.5 + padding,
          0.5,
          0.5,
          zoom
        ) &&
        chunks.push(chunk)
    );
    return chunks;
  }
  drawAll() {
    this.toRender.forEach((chunk) => chunk.drawFloorsOnly());
    for (let particle of this.floorParticles) {
      if (!World.isInRenderDistance(particle)) continue;
      particle.draw();
    }
    this.toRender.forEach((chunk) => chunk.drawBlocksOnly());
    this.toRender.forEach((chunk) => chunk.postDrawBlocksOnly());
    for (let entity of this.entities) {
      if (!World.isInRenderDistance(entity)) continue;
      entity.draw();
    }
    for (let entity of this.entities) {
      if (!World.isInRenderDistance(entity)) continue;
      entity.postDraw();
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
    yoffset = 0,
    zoom = 1
  ) {
    if (thing.size) padding += thing.size;
    else if (thing.sizeX && thing.sizeY)
      padding += Math.max(thing.sizeX, thing.sizeY);
    if (thing.hitSize) padding += thing.hitSize;
    else if (thing.width && thing.height)
      padding += Math.max(thing.width, thing.height);

    if (
      (thing.x + xoffset) * posScale <
      ui.camera.x - width / zoom / 2 - padding * posScale
    )
      return false;
    if (
      (thing.x + xoffset) * posScale >
      ui.camera.x + width / zoom / 2 + padding * posScale
    )
      return false;
    if (
      (thing.y + yoffset) * posScale <
      ui.camera.y - height / zoom / 2 - padding * posScale
    )
      return false;
    if (
      (thing.y + yoffset) * posScale >
      ui.camera.y + height / zoom / 2 + padding * posScale
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
  /**Gets all blocks neighbouring a position. Includes that position.*/
  getAdjacent(x, y, layer = "blocks") {
    return [
      this.getBlock(x - 1, y - 1, layer),
      this.getBlock(x, y - 1, layer),
      this.getBlock(x + 1, y - 1, layer),
      this.getBlock(x - 1, y, layer),
      this.getBlock(x, y, layer),
      this.getBlock(x + 1, y, layer),
      this.getBlock(x - 1, y + 1, layer),
      this.getBlock(x, y + 1, layer),
      this.getBlock(x + 1, y + 1, layer),
    ];
  }
  /**@returns {SerialisedWorld} */
  serialise() {
    return {
      chunks: this.chunks.map((x) => x.map((y) => y.serialise())),
      name: this.name,
      entities: this.entities.map((x) => x.serialise()),
      seed: this.seed,
    };
  }
  /**@param {SerialisedWorld} created  */
  static deserialise(created) {
    let wrold = new this();
    wrold.chunks = created.chunks.map((x) =>
      x.map((y) => Chunk.deserialise(y))
    );
    created.entities.forEach((entity) => {
      if (entity["-"]) {
        DroppedItemStack.create(
          ItemStack.deserialise(entity.stack),
          wrold,
          entity.x,
          entity.y,
          0,
          0
        );
      } else {
        let ent = Entity.deserialise(entity, false);
        ent.addToWorld(wrold, entity.x, entity.y);
        ent.spawnX = entity.spawnX;
        ent.spawnY = entity.spawnY;
        if (entity.isMainPlayer) createPlayer(ent);
      }
    });
    wrold.seed = created.seed;
    wrold.name = created.name;
    //Set world properties
    iterate2DArray(wrold.chunks, (chunk) => {
      chunk.world = wrold;
      iterate2DArray(chunk.blocks, (block) => {
        if (block) block.world = wrold;
      });
    });
    return wrold;
  }
  /**Sets everything on this world possible to those values on a source world.
   * @param {World} world  */
  become(world) {
    Object.assign(this, world);
  }
}
