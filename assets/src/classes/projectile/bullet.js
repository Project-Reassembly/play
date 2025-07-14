import { PhysicalObject, ShootableObject } from "../physical.js";
import { rotatedImg, rotatedShape } from "../../core/ui.js";
import { rnd, tru } from "../../core/number.js";
import { repeat } from "../../play/effects.js";
import { construct } from "../../core/constructor.js";
import { ShapeParticle } from "../effect/shape-particle.js";
import { Fire } from "../effect/fire.js";
import { blockSize } from "../../scaling.js";
import { Log } from "../../play/messaging.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
class Bullet extends PhysicalObject {
  extraUpdates = 0;
  direction = 0;
  damage = [];
  speed = 20;
  decel = 0;
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
  trail = true;
  trailColours = [[255, 255, 255, 200]];
  trailShape = "rhombus";
  trailWidth = 0;
  trailLength = 0;
  trailLife = 0;
  trailLight = 0;
  //
  remove = false;
  light = 0;
  drawer = {
    shape: "circle",
    fill: "red",
    image: "error",
    width: 10,
    height: 10,
  };
  entity = null;
  //bonc
  knockback = 0;
  kineticKnockback = false;
  controlledKnockback = false;
  //pierce
  damaged = [];
  pierce = 0;
  conditionalPierce = false;
  //internal
  _trailCounter = 20;
  trailInterval = null;
  //Statuseseseseses
  status = "none";
  statusDuration = 0;
  //Frags
  fragBullet = {};
  fragNumber = 0;
  fragDirection = 0;
  fragSpread = 0;
  fragSpacing = 0;

  fragSpeedMin = 0.8;
  fragSpeedMax = 1.2;
  //Intervals
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
  init() {
    super.init();
    this.maxLife = this.lifetime;
    this.trailInterval ??= this.hitSize * 4;
    this.world ??= this.entity?.world;
  }
  oncreated() {
    this.emit(this.spawnFrame, 0, 0, true);
    this.emit(this.spawnEffect);
  }
  ondestroyed() {
    this.emit(this.despawnEffect);
  }
  tick() {
    repeat(this.extraUpdates + 1, () => this.step(1));
  }
  step(dt) {
    //Not if dead
    if (!this.remove) {
      this.intervalTick();
      //Which way to move
      let moveVector = p5.Vector.fromAngle(this.directionRad);
      //Scale to speed
      moveVector.mult(this.speed * dt);
      //Move
      this.move(moveVector.x, moveVector.y);
      //hit
      this.checkCollisions();
      //Speed change
      this.speed = Math.max(this.speed - dt * this.decel, 0);
      //Tick lifetime
      if (this.lifetime <= 0) {
        this.remove = true;
      } else {
        this.lifetime -= dt;
      }
      this.spawnTrail(dt);
    }
  }
  move(x, y) {
    super.move(x, y, true);
  }
  spawnTrail(dt) {
    //This got too long

    for (let e = 0; e < this.speed * dt; e++) {
      this._trailCounter--;
      if (this._trailCounter <= 1) {
        if (this.world?.particles != null && this.trail) {
          if (this.trailEffect === "default") {
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
              0
            );
            trailparticle.light = this.trailLight;
            this.world.particles.push(trailparticle);
          } else this.emit(this.trailEffect);
        }
        this._trailCounter = this.trailInterval;
      }
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
          this.directionRad
        );
      } else {
        //If no image, draw shape instead
        noStroke();
        fill(this.drawer.fill);
        rotatedShape(
          this.drawer.shape,
          this.x,
          this.y,
          this.drawer.width,
          this.drawer.height,
          this.directionRad
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
              x: this.x + rnd(this.fireSpread, -this.fireSpread),
              y: this.y + rnd(this.fireSpread, -this.fireSpread),
              world: this.world,
              team: this.entity.team,
            })
          );
      });
    else if (tru(this.fireChance))
      repeat(this.fires, () =>
        Fire.create(
          Object.assign(this.fire, {
            x: this.x + rnd(this.fireSpread, -this.fireSpread),
            y: this.y + rnd(this.fireSpread, -this.fireSpread),
            world: this.world,
            team: this.entity.team,
          })
        )
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
      this.fragSpeedMax
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
      this.entity
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
          "blocks"
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
        if (
          (this.collidesGround && !entity.flying) ||
          (this.collidesAir && entity.flying)
        )
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
      //Take all damage instances
      for (let instance of this.damage) {
        if (!instance.spread) instance.spread = 0;
        let todeal =
          instance.amount +
          (this.conditionalPierce ? 0 : rnd(instance.spread, -instance.spread));
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
}
function patternedBulletExpulsion(
  x,
  y,
  bulletToSpawn,
  amount,
  direction,
  spread,
  spacing,
  world,
  entity,
  speedMultMin = 1,
  speedMultMax = 1
) {
  //Max difference in direction
  let diff = (spacing * (amount - 1)) / 2;
  //Current angle
  let currentAngle = -diff;
  //For each bullet to fire
  let maek = (bulletToSpawn) => {
    for (let index = 0; index < amount; index++) {
      /** @type {Bullet} */
      let bulletToFire = construct(bulletToSpawn, "bullet");
      //Put the bullet in position
      bulletToFire.x = x;
      bulletToFire.y = y;
      bulletToFire.direction = direction; //do the offset
      //Apply uniform spread
      bulletToFire.direction += currentAngle;
      currentAngle += spacing;
      //Apply random spread
      bulletToFire.direction += random(spread, -spread);
      //Add entity and world
      bulletToFire.entity = entity;
      bulletToFire.world = world;
      //Spawn it in
      bulletToFire.speed *= rnd(speedMultMin, speedMultMax);
      world.bullets.push(bulletToFire);
      bulletToFire.oncreated();
    }
  };
  if (bulletToSpawn instanceof Array) bulletToSpawn.forEach(maek);
  else maek(bulletToSpawn);
}
export { Bullet, patternedBulletExpulsion };
