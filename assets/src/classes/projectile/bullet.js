import { Vector } from "../../core/number.js";
import { blockSize } from "../../scaling.js";
import { ComponentData } from "../component-model/component-data.js";
import { PhysicalObject, ShootableObject } from "../physical.js";
import {
  NoBlockCollisionComponent,
  NoEntityCollisionComponent,
} from "./bullet-components.js";
/// <reference path="../../lib/integrate"/>
export class BulletInstance extends PhysicalObject {
  // Core properties
  lifetime = 1;
  /** Getter for model hitsize. @deprecated Use `BulletInstance.model.hitSize` instead */
  get hitSize() {
    return this.model.hitSize;
  }
  remove = false;

  /** source entity - the entity that this belongs to. @type {import("../entity/entity.js").Entity}*/
  entity = null;
  /** Storage for bullet behaviours, to avoid runtime copying. @type {BulletModel} */
  model = null;
  /** Data stored by those behaviours, specific to this instance. */
  data = new ComponentData();

  /**All points this bullet has been at. Used for linear effects, and is only populated if `endLine` is not `"none"` (i.e., there's a linear trail component) */
  // positions = [];
  lastpos = Vector.ZERO;
  constructor() {
    super();
    delete this.registryName;
    delete this.type;
    delete this.hitSize;
  }
  init() {
    super.init();
    this.world ??= this.entity?.world;
  }
  oncreated() {
    this.lastpos = new Vector(this.x, this.y);
    this.model.call("onspawn", this);
    // for (const c of this.model.all()) {
    //   c.onspawn(this);
    // }
  }
  ondestroyed() {
    this.model.call("onexpire", this);
    // for (const c of this.model.all()) {
    //   c.onexpire(this);
    // }
  }
  tick() {
    this.update();
    this.model.call("ontick", this);
    // for (const c of this.model.all()) {
    //   c.ontick(this);
    // }
  }
  update() {
    //Not if dead
    if (!this.remove) {
      // this.intervalTick();
      this.model.call("onupdate", this);
      // for (const c of this.model.all()) {
      //   c.onupdate(this);
      // }
      //hit
      this.checkCollisions();
      //Tick lifetime
      this.lifetime--;
      if (this.lifetime <= 0) {
        this.remove = true;
      }
      this.lastpos = this.pos.clone();
    }
  }
  draw() {
    this.model.call("ondraw", this);
    // for (const c of this.model.all()) {
    //   c.ondraw(this);
    // }
    super.draw();
  }
  componentDeniesHit(thing) {
    return this.model.call("onhits", this, thing);
    // for (const c of this.model.all()) {
    //   if (!c.onhits(this, thing)) return true;
    // }
    // return false;
  }
  checkCollisions() {
    if (this.remove || !this.model.collides) return;
    //collide with blocks
    if (!this.model.has(NoBlockCollisionComponent))
      this.world
        .blocksInSquare(
          Math.round(this.x / blockSize),
          Math.round(this.y / blockSize),
          Math.ceil(this.model.hitSize / blockSize),
        )
        .forEach((block) => {
          if (
            !this.remove &&
            this.model.collides &&
            this.collidesWith(block) &&
            !this.componentDeniesHit(block)
          ) {
            this.hit(block);
          }
        });
    if (!this.model.has(NoEntityCollisionComponent))
      //collide with entities
      this.world.entities.forEach((entity) => {
        if (
          !this.remove &&
          this.model.collides &&
          entity.tangible &&
          this.collidesWith(entity) &&
          !this.componentDeniesHit(entity)
        ) {
          this.hit(entity);
        }
      });
  }
  /** @param {ShootableObject} physobj */
  hit(physobj) {
    if (physobj.team !== this.entity.team) {
      this.remove = true;

      this.model.call("onhit", this, physobj);
      this.hitex();
      // for (const c of this.model.all()) {
      //   c.onhit(this, physobj);
      // }
    }
    physobj.hitByBullet(this);

    if (physobj.dead) {
      this.model.call("onkill", this, physobj);
    }
  }
  hitex(){}
}

