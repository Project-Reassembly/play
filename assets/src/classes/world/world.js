import { Chunk, create2DArray, iterate2DArray } from "./chunk.js";
import { Entity } from "../entity/entity.js";
import { createPlayer } from "../../play/game.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
import { ui } from "../../core/ui.js";
import { Block } from "../block/block.js";
import { InventoryEntity } from "../entity/inventory-entity.js";
import { EquippedEntity } from "../entity/inventory-entity.js";
import { tru } from "../../core/number.js";
import { worldSize } from "../../scaling.js";
import { Explosion, NuclearExplosion } from "../../play/effects.js";
import { PowerNetwork } from "./power-network.js";
import { Log } from "../../play/messaging.js";
import { assign } from "../../core/constructor.js";

/**
 * @typedef SerialisedWorld
 * @prop {SerialisedChunk[][]} chunks
 * @prop {SerialisedEntity[]} entities
 * @prop {string} name
 * @prop {int} seed
 * @prop {{positions: {x: int, y:int}[]}[]} networks
 */

/** */
class World {
  static get size() {
    return worldSize;
  }
  /** The chance for a *chunk* to random tick. */
  static randomTick = 0.01;
  /** The distance in chunks **outside the render distance** that will still tick. */
  static simulationDistance = 5;
  /**
   * @type {(ImageParticle|ShapeParticle|TextParticle|WaveParticle)[]}
   * Particles that will be drawn underneath normal blocks, but on top of floors and tiles.
   */
  floorParticles = [];
  /** @type {(ImageParticle|ShapeParticle|TextParticle|WaveParticle)[]} */
  particles = [];
  /** @type {(ImageParticle|ShapeParticle|TextParticle|WaveParticle)[]} */
  impactParticles = [];
  /** @type {Entity[]} */
  entities = [];
  /** @type {Bullet[]} */
  bullets = [];
  /** @type {Chunk[][]} */
  chunks = null;
  /**
   * @type {PhysicalObject[]} \
   * An array of extra objects, none of which will be saved.\
   * Will not render on their own, so use of VFX (`this.emit(...)`) is required for rendering.\
   * Use one of `particles`, `floorParticles`, `entities` or `bullets` instead of this where possible.
   */
  physobjs = [];
  /** @type {PowerNetwork[]} */
  networks = [];
  name = "World";
  seed = null;
  /**Chunks to render this frame.
   * @type {Chunk[]} */
  toRender = [];
  /**Chunks to tick this frame.
   * @type {Chunk[]} */
  toTick = [];
  //saved events
  events = [];
  constructor(name = "World") {
    this.name = name;
  }
  reset() {
    this.physobjs = [];
    this.chunks = [];
    this.bullets = [];
    this.entities = [];
    this.particles = [];
    this.floorParticles = [];
    this.impactParticles = [];
    this.networks = [];
    this.toRender = [];
    this.toTick = [];
  }
  tickAll() {
    this.tickEvents();
    this.#actualTick();
    this.#removeDead();
  }
  resetRenderer() {
    this.toRender = this.getRenderedChunks(undefined, ui.camera.zoom);
  }
  #actualTick() {
    if (this.impactParticles.length > 0) {
      this.impactParticles.forEach((p) => p.step(1));
      return;
    }
    this.resetRenderer();
    this.toTick = this.getRenderedChunks(World.simulationDistance);
    //Tick *everything*
    this.physobjs.forEach((p) => p.tick());
    this.floorParticles.forEach((p) => p.step(1));
    this.bullets.forEach((b) => b.tick());
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
    this.toTick.forEach((chunk) => {
      chunk.tick();
      if (tru(World.randomTick)) chunk.randomTick();
    });
  }
  #removeDead() {
    let len = this.impactParticles.length;
    if (len > 0) {
      for (let p = 0; p < len; p++) {
        if (this.impactParticles[p]?.remove) {
          this.impactParticles.splice(p, 1);
        }
      }
    } else {
      //THEN remove dead stuff
      len = this.bullets.length;
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
              boom.source = bullet.entity;
              if (boom.status === "none") boom.status = bullet.status;
              if (boom.statusDuration === 0)
                boom.statusDuration = bullet.statusDuration;
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
          bullet.ondestroyed();
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
      if (!World.isInRenderDistance(particle, 1, 0, 0, 0, ui.camera.zoom))
        continue;
      particle.draw();
    }
    this.toRender.forEach((chunk) => chunk.drawBlocksOnly());
    this.toRender.forEach((chunk) => chunk.postDrawBlocksOnly());
    this.toRender.forEach((chunk) => chunk.postDraw2BlocksOnly());
    for (let entity of this.entities) {
      if (
        !entity.visible ||
        !World.isInRenderDistance(entity, 1, 0, 0, 0, ui.camera.zoom)
      )
        continue;
      entity.draw();
    }
    for (let entity of this.entities) {
      if (
        !entity.visible ||
        !World.isInRenderDistance(entity, 1, 0, 0, 0, ui.camera.zoom)
      )
        continue;
      entity.postDraw();
    }
    for (let bullet of this.bullets) {
      if (!World.isInRenderDistance(bullet, 1, 0, 0, 0, ui.camera.zoom))
        continue;
      bullet.draw();
    }
    for (let particle of this.particles) {
      if (!World.isInRenderDistance(particle, 1, 0, 0, 0, ui.camera.zoom))
        continue;
      particle.draw();
    }
    for (let particle of this.impactParticles) {
      if (!World.isInRenderDistance(particle, 1, 0, 0, 0, ui.camera.zoom))
        continue;
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
  blocksInSquare(x, y, size, layer = "blocks") {
    let arr = [];
    for (let i = -size; i <= size; i++) {
      for (let j = -size; j <= size; j++) {
        arr.push(this.getBlock(x + i, y + j, layer));
      }
    }
    return arr;
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
      networks: this.networks.map((x) => x.serialise()),
      events: this.events.map((x) => ({
        duration: x.time,
        name: x.name,
        full: x.full,
      })),
    };
  }
  /**@param {SerialisedWorld} created  */
  static deserialise(created) {
    let wrold = new this();
    wrold.events = created.events?.map((x) => ({
      name: x.name,
      time: x.duration,
      full: x.full,
    }));
    wrold.chunks = created.chunks?.map((x) =>
      x.map((y) => Chunk.deserialise(y))
    ) ?? [[]];
    created.entities?.forEach((entity) => {
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
    created.networks?.forEach((x) => {
      let net = PowerNetwork.deserialise(x);
      net.world = wrold;
      wrold.networks.push(net);
    });
    iterate2DArray(wrold.chunks, (chunk) => {
      chunk.world = wrold;
      iterate2DArray(chunk.blocks, (block) => {
        if (block) block.world = wrold;
      });
    });
    //Set world properties
    wrold.seed = created.seed;
    wrold.name = created.name;
    return wrold;
  }
  /**Sets everything on this world possible to those values on a source world.
   * @param {World} world  */
  become(world) {
    assign(this, world);
  }
  tickEvents() {
    this.events.forEach((x) => {
      if (x.time === 0) if (this.evlisten[x.name]) this.evlisten[x.name](this);
      if (x.time >= 0) x.time--;
    });
  }
  addEvent(name, time, listener) {
    if (!this.events.some((x) => x.name === name)) {
      this.events.push({ name: name, time: time, full: time });
    }
    this.evlisten[name] = listener;
  }
  triggerEvent(name) {
    this.events.forEach((x) => {
      if (x.name === name) x.time = 0;
    });
  }
  resetEvent(name) {
    this.events.forEach((x) => {
      if (x.name === name) x.time = x.full ?? 0;
    });
  }
  evlisten = {};

  hasBoss() {
    return this.entities.some((x) => x.isBoss);
  }
  firstBoss() {
    return this.entities.find((x) => x.isBoss);
  }
}
export { World };
