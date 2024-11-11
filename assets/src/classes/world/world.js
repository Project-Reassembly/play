class World {
  particles = [];
  /** @type {Array<Entity>} */
  entities = [];
  /** @type {Array<Bullet>} */
  bullets = [];
  /** @type {Array<Chunk>} */
  chunks = [];
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
    for (let chunk of this.chunks) {
      if (World.isInRenderDistance(chunk, Chunk.size * Block.size)) {
        chunk.tick();
      }
    }
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
    for (let chunk of this.chunks) {
      if (World.isInRenderDistance(chunk, Chunk.size * Block.size, Chunk.size * Block.size)) {
        chunk.draw();
      }
    }
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
  generateTiles(size, noiseScale = 1, noiseLevel = 255) {
    this.chunks.splice(0);
    //Procedural ground gen
    noiseScale *= 0.001;
    for (let i = -size / 2; i < size / 2; i++) {
      //Chunk coords
      for (let j = -size / 2; j < size / 2; j++) {
        let newChunk = new Chunk();
        newChunk.x = i;
        newChunk.y = j;
        for (let x = -Chunk.size / 2; x < Chunk.size / 2 + 1; x++) {
          //Block coords
          for (let y = -Chunk.size / 2; y < Chunk.size / 2 + 1; y++) {
            let nx = roundNum(
              noiseScale *
                ((size/2 + i) * Chunk.size * Block.size +
                  (x * Block.size + Block.size / 2)),
              2
            );
            let ny = roundNum(
              noiseScale *
                ((size/2 + j) * Chunk.size * Block.size +
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
        this.chunks.push(newChunk);
      }
    }
  }
  getNearestChunk(x, y){
    let tx = x / Block.size / Chunk.size,
    ty = y / Block.size / Chunk.size
    let nearest = null
    let closestDist = Infinity
    for(let chunk of this.chunks){
      let dist = ((tx-chunk.x)**2 + (ty-chunk.y)**2)**0.5
      if(dist < closestDist){
        closestDist = dist
        nearest = chunk
      }
    }
    return nearest
  }
  getNearestTile(x, y){
    let chunk = this.getNearestChunk(x, y)
    let nearest = null
    let closestDist = Infinity
    for(let tile of chunk.tiles){
      let dist = ((x-tile.x)**2 + (y-tile.y)**2)**0.5
      if(dist < closestDist){
        closestDist = dist
        nearest = tile
      }
    }
    return nearest
  }
  getNearestBlock(x, y){
    let chunk = this.getNearestChunk(x, y)
    let nearest = null
    let closestDist = Infinity
    for(let tile of chunk.blocks){
      let dist = ((x-tile.x)**2 + (y-tile.y)**2)**0.5
      if(dist < closestDist){
        closestDist = dist
        nearest = tile
      }
    }
    return nearest
  }
}
