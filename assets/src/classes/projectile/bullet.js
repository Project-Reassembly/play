import { col } from "../../core/color.js";
import { clamp, rnd, tru, Vector } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { rotatedImg, rotatedShape } from "../../core/ui.js";
import Integrate from "../../lib/integrate.js";
import { createLinearEffect, repeat } from "../../play/effects.js";
import { game } from "../../play/game.js";
import { blockSize } from "../../scaling.js";
import { Fire } from "../effect/fire.js";
import { ShapeParticle } from "../effect/shape-particle.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { PhysicalObject } from "../physical.js";
import { patternedBulletExpulsion } from "./yeeter.js";
class Bullet extends PhysicalObject {
  extraUpdates = 0;
  direction = 0;
  damage = [];
  speed = 20;
  decel = 0;
  maxSpeed = Infinity;
  lifetime = 60;
  hitSize = 5;

  //collision types
  collides = true;
  collidesBlocks = true;
  /**Does this bullet hit grounded entities? */
  collidesGround = true;
  /**Does this bullet hit airborne entities? */
  collidesAir = true;

  //trails
  trail = false;
  trailColours = [col.from(255, 255, 255, 200)];
  trailShape = "rhombus";
  trailWidth = 0;
  trailLength = 0;
  trailLife = 0;
  trailLight = 0;
  trailSpacing = "speed";
  //
  remove = false;
  light = 0;
  drawer = { shape: "circle", fill: col.red, image: "error", width: 10, height: 10 };
  entity = null;
  //bonc
  knockback = 0;
  iknockback = 0; // immediate knockback
  // kineticKnockback = false;
  // controlledKnockback = false;
  //pierce
  damaged = [];
  pierce = 0;
  conditionalPierce = false;
  lifeOnHit = 0;
  //internal
  _trailCounter = 20;
  trailInterval = null;
  //Statuseseseseses
  status = "none";
  statusDuration = 0;
  //spawn bullet
  /**@type {Integrate.Unconstructed<Bullet>} */
  spawnBullet = {};
  spawnNumber = 0;
  spawnDirection = 0;
  spawnSpread = 0;
  spawnSpacing = 0;

  spawnSpeedMin = 0.8;
  spawnSpeedMax = 1.2;
  //Frags
  /**@type {Integrate.Unconstructed<Bullet>} */
  fragBullet = {};
  fragNumber = 0;
  fragDirection = 0;
  fragSpread = 0;
  fragSpacing = 0;

  fragSpeedMin = 0.8;
  fragSpeedMax = 1.2;
  //Hit-only Frags
  /**@type {Integrate.Unconstructed<Bullet>} */
  hitBullet = {};
  hitNumber = 0;
  hitDirection = 0;
  hitSpread = 0;
  hitSpacing = 0;

  hitSpeedMin = 0.8;
  hitSpeedMax = 1.2;
  //Intervals
  /**@type {Integrate.Unconstructed<Bullet>} */
  intervalBullet = {};
  intervalNumber = 0;
  intervalDirection = 0;
  intervalSpread = 0;
  intervalSpacing = 0;
  intervalTime = 0;
  #intervalCounter = 0;
  //vfx
  spawnEffect = "none";
  spawnFrame = "none";
  despawnEffect = "explosion~5";
  hitEffect = "none";
  endLine = "none"; //linear effect
  impactFrame = "none";
  trailEffect = "default";
  //incendiary
  fire = {};
  fireChance = 1;
  fires = 0;
  fireSpread = 0;
  /** If true, the number of fires created (`F`) will follow a binomial distribution: `F ~ B(fires,fireChance)`.\
   * Each fire will have `fireChance` probability of being created.\
   * If this is the case, the mean number of fires will be `fireChance * fires`, with variance `fireChance * (1 - fireChance) * fires`.\
   * If false, all fire will be created at once with a probability of `fireChance`.\
   * Generally, this option allows any integer number of fires between 0 and `fires` to spawn, whereas, with this off, the only options are `fires` fires, or no fires.
   */
  isFireBinomial = false;

  // These don't affect the bullet directly, but are used for certain interactions:
  /**Indicates whether or not the entity or block firing this bullet is in control of this bullet. Forced to true if it's homing to anything other than 'nearest'. */
  controlled = false;
  /**The point at which this bullet spawned. Used for linear effects. */
  startpos = Vector.ZERO;
  /**All points this bullet has been at. Used for linear effects, and is only populated if `endLine` is not `"none"` */
  positions = [];
  lastpos = Vector.ZERO;

  init() {
    super.init();
    this.trailColours = this.trailColours.map(col.convert);
    this.maxLife = this.lifetime;
    if (this.drawer.fill) this.drawer.fill = col.convert(this.drawer.fill);
    this.trailInterval ??= this.speed / this.hitSize;
    this.world ??= this.entity?.world;
    if (this.targetType !== "none" && this.targetType !== "nearest") this.controlled = true;
    if(!this.damage instanceof Array) this.damage = [this.damage];
  }
  oncreated() {
    this.emit(this.spawnFrame, 0, 0, true);
    this.emit(this.spawnEffect);
    this.startpos = this.lastpos = new Vector(this.x, this.y);
    this.spawn();
  }
  ondestroyed() {
    this.frag();
    this.incend();
    this.emit(this.despawnEffect);
    if (this.endLine !== "none") {
      createLinearEffect(this.endLine, this.world, this.positions);
    }
  }
  tick() {
    repeat(this.extraUpdates + 1, () => this.step(1));
  }
  step(dt) {
    //Not if dead
    if (!this.remove) {
      this.intervalTick();
      //Which way to move
      let moveVector = Vector.fromAngle(this.direction);
      //Scale to speed
      moveVector.scale(this.speed * dt, true);
      //Move
      this.move(moveVector.x, moveVector.y);
      if (this.trackingRange > 0 && this.targetType !== "none") this.track();
      //hit
      this.checkCollisions();
      //Speed change
      this.speed = clamp(this.speed - dt * this.decel, 0, this.maxSpeed);
      //Tick lifetime
      if (this.lifetime <= 0) {
        this.remove = true;
      } else {
        this.lifetime -= dt;
      }
      this.spawnTrail(dt);
      const p = this.pos.clone();
      if (this.endLine !== "none") {
        this.positions.push(p);
      }
      this.lastpos = p;
    }
  }
  move(x, y) {
    super.move(x, y, true);
  }
  spawnTrail(dt) {
    //This got too long
    let s =
      this.trailSpacing === "speed" ? this.speed * dt
      : this.trailSpacing === "timed" ? dt
      : 0;
    const from = this.lastpos,
      to = this.pos;

    if (this.world?.particles != null && this.trail) {
      if (this.trailEffect === "old") {
        for (let e = 0; e <= s; e++) {
          this._trailCounter--;
          if (this._trailCounter <= 1) {
            let trailparticle = new ShapeParticle(
              this.x - e * p5.Vector.fromAngle(this.directionRad).x,
              this.y - e * p5.Vector.fromAngle(this.directionRad).y,
              this.directionRad,
              this.trailLife || (this.maxLife * 1.2) ** 0.4,
              0,
              0,
              this.trailShape,
              this.trailColours,
              this.trailWidth || this.hitSize * 1.9,
              0,
              (this.trailLength || this.hitSize) * this.trailInterval * 0.25,
              (this.trailLength || this.hitSize) * this.trailInterval * 0.25,
              0,
            );
            trailparticle.light = this.trailLight;
            this.world.particles.push(trailparticle);
            this._trailCounter = this.trailInterval;
          }
        }
      } else if (this.trailEffect === "default") {
        const poses = from.multiLerp(to, Math.ceil(s / this.trailInterval));
        poses.forEach((p) => {
          const trailparticle = new ShapeParticle(
            p.x,
            p.y,
            this.directionRad,
            this.trailLife || (this.maxLife * 1.2) ** 0.6,
            0,
            0,
            this.trailShape, //flames
            this.trailColours,
            this.trailWidth || this.hitSize * 1.25,
            0,
            this.trailWidth || this.hitSize * 1.25,
            0,
            0,
          );
          trailparticle.light = this.trailLight;
          this.world.particles.push(trailparticle);
        });
      } else if (this.trailEffect === "moab-adventure") {
        for (let e = 0; e < this.speed * dt; e++) {
          if (reduced && !tru(game.effects)) continue;
          if (this._trailCounter <= 0) {
            if (this.world?.particles != null && this.trail) {
              let v = Vector.fromAngle(this.direction).scale(e);
              this.world.particles.push(
                new ShapeParticle(
                  this.x - v.x,
                  this.y - v.y,
                  this.directionRad,
                  this.maxLife * 0.75,
                  0,
                  0,
                  this.trailShape,
                  this.trailColour,
                  this.trailColourTo,
                  this.trailWidth * 1.9,
                  0,
                  this.hitSize * this.trailInterval * 0.25,
                  this.hitSize * this.trailInterval * 0.25,
                  0,
                ),
              );
            }
            this._trailCounter = this.trailInterval;
          } else {
            this._trailCounter--;
          }
        }
      } else if (Registries.vfx.get(this.trailEffect).type === "line-emission")
        createLinearEffect(this.trailEffect, this.world, [from, to]);
      else this.emit(this.trailEffect);
    }
  }
  draw() {
    if (!this.drawer.hidden)
      if (this.drawer.image) {
        rotatedImg(
          this.drawer.image,
          this.x,
          this.y,
          this.drawer.width,
          this.drawer.height,
          this.directionRad,
        );
      } else {
        //If no image, draw shape instead
        noStroke();
        col.fill(this.drawer.fill);
        rotatedShape(
          this.drawer.shape,
          this.x,
          this.y,
          this.drawer.width,
          this.drawer.height,
          this.directionRad,
        );
      }
    super.draw();
  }
  incend() {
    if (this.isFireBinomial)
      repeat(this.fires, () => {
        if (tru(this.fireChance))
          Fire.create(
            Object.assign(this.fire, {
              x: this.x + rnd.float(this.fireSpread, -this.fireSpread),
              y: this.y + rnd.float(this.fireSpread, -this.fireSpread),
              world: this.world,
              team: this.entity.team,
            }),
          );
      });
    else if (tru(this.fireChance))
      repeat(this.fires, () =>
        Fire.create(
          Object.assign(this.fire, {
            x: this.x + rnd.float(this.fireSpread, -this.fireSpread),
            y: this.y + rnd.float(this.fireSpread, -this.fireSpread),
            world: this.world,
            team: this.entity.team,
          }),
        ),
      );
  }
  hitb() {
    patternedBulletExpulsion(
      this.x,
      this.y,
      this.hitBullet,
      this.hitNumber,
      this.direction + this.hitDirection,
      this.hitSpread,
      this.hitSpacing,
      this.world,
      this.entity,
      this.hitSpeedMin,
      this.hitSpeedMax,
    );
  }
  frag() {
    patternedBulletExpulsion(
      this.x,
      this.y,
      this.fragBullet,
      this.fragNumber,
      this.direction + this.fragDirection,
      this.fragSpread,
      this.fragSpacing,
      this.world,
      this.entity,
      this.fragSpeedMin,
      this.fragSpeedMax,
    );
  }
  spawn() {
    patternedBulletExpulsion(
      this.x,
      this.y,
      this.spawnBullet,
      this.spawnNumber,
      this.direction + this.spawnDirection,
      this.spawnSpread,
      this.spawnSpacing,
      this.world,
      this.entity,
      this.spawnSpeedMin,
      this.spawnSpeedMax,
    );
  }
  interval() {
    patternedBulletExpulsion(
      this.x,
      this.y,
      this.intervalBullet,
      this.intervalNumber,
      this.direction + this.intervalDirection,
      this.intervalSpread,
      this.intervalSpacing,
      this.world,
      this.entity,
    );
  }
  intervalTick() {
    if (this.#intervalCounter <= 0) {
      this.interval();
      this.#intervalCounter = this.intervalTime;
    } else {
      this.#intervalCounter--;
    }
  }
  checkCollisions() {
    if (this.remove || !this.collides) return;
    //collide with blocks
    if (this.collidesBlocks)
      this.world
        .blocksInSquare(
          Math.floor(this.x / blockSize),
          Math.floor(this.y / blockSize),
          Math.ceil(this.hitSize / blockSize),
        )
        .forEach((block) => {
          if (
            !this.remove &&
            this.collides &&
            !this.damaged.includes(block) &&
            this.collidesWith(block)
          ) {
            this.hit(block);
          }
        });
    //collide with entities
    this.world.entities.forEach((entity) => {
      if (
        !this.remove &&
        this.collides &&
        entity.tangible &&
        !(entity instanceof DroppedItemStack) &&
        !this.damaged.includes(entity) &&
        this.collidesWith(entity)
      ) {
        if ((this.collidesGround && !entity.flying) || (this.collidesAir && entity.flying))
          this.hit(entity);
      }
    });
  }
  isExhausted() {
    return this.conditionalPierce ? false : this.pierce < 0;
  }
  hit(physobj) {
    if (physobj.team !== this.entity.team) {
      //Reduce pierce
      this.pierce--;
      //Increase life (if applicable)
      this.lifetime += this.lifeOnHit;
      //Deal all damage instances
      for (let instance of this.damage) {
        if (!instance.spread) instance.spread = 0;
        let todeal =
          instance.amount +
          (this.conditionalPierce ? 0 : rnd.float(instance.spread, -instance.spread));
        let taken = Math.min(todeal, physobj.health);
        if (!instance.radius) {
          physobj.damage(instance.type, todeal, this.entity);
          if (this.conditionalPierce) {
            instance.amount -= taken || 0;
            instance.spread = 0;
            if (instance.amount <= 0) {
              this.remove = true;
            }
          }
        }
      }
      this.emit(this.impactFrame, 0, 0, true);
      this.emit(this.hitEffect);
      this.hitb();
      //Make the bullet know
      this.damaged.push(physobj);
      //If exhausted
      if (this.isExhausted()) {
        //Delete
        this.remove = true;
      }
    }
    physobj.hitByBullet(this);
  }
  turnSpeed = 1;
  /** @type {"nearest" | "mouse" | "hovered" | "none"} */
  targetType = "none"; //"nearest", "mouse", "hovered"
  trackingRange = 0;
  target = null;
  track() {
    if (
      this.target &&
      !this.target.dead &&
      !this.target.remove &&
      this.distanceTo(this.target) < this.trackingRange
    ) {
      //If target still there
      this.rotateTowards(this.target.x, this.target.y, this.turnSpeed);
      return;
    }
    let selected = null;
    if (this.targetType === "nearest") {
      //Closest to bullet
      if (this.world) {
        //If the bullet exists
        let minDist = Infinity;
        for (let entity of this.world.entities) {
          if (
            !(entity instanceof DroppedItemStack) &&
            entity.team !== this.entity.team &&
            !entity.dead &&
            entity.visible &&
            !this.damaged.includes(entity)
          ) {
            let dist = this.distanceTo(entity);
            if (dist < this.trackingRange && dist < minDist) {
              //If closer
              selected = entity;
              minDist = dist;
            }
          }
        }
      }
    } else if (this.targetType === "hovered") {
      //Closest to mouse pointer
      if (this.world) {
        //If the bullet exists
        let minDist = Infinity;
        selected =
          this.distanceToPoint(game.mouse.x, game.mouse.y) < this.trackingRange ? game.mouse : null;
        for (let entity of this.world.entities) {
          if (
            !(entity instanceof DroppedItemStack) &&
            entity.team !== this.entity.team &&
            !entity.dead
          ) {
            //Only select living entities
            let dist = entity.distanceToPoint(game.mouse.x, game.mouse.y);
            if (dist < this.trackingRange && dist < minDist) {
              //If closer
              selected = entity;
              minDist = dist;
            }
          }
        }
      }
    } else if (this.targetType === "mouse") {
      //Closest to mouse pointer
      if (this.distanceToPoint(game.mouse.x, game.mouse.y) < this.trackingRange)
        selected = game.mouse;
    }
    this.target = selected;
  }
}
export { Bullet };

