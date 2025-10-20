import { ShootableObject } from "../physical.js";
import { construct, constructFromType } from "../../core/constructor.js";
import { Registries } from "../../core/registry.js";
import { World } from "../world/world.js";
import { rnd, tru, roundNum, Vector, clamp } from "../../core/number.js";
import { PhysicalObject } from "../physical.js";
import {
  liquidDestructionBlast,
  createDestructionExplosion,
} from "../../play/effects.js";
import { blockSize, totalSize, worldSize } from "../../scaling.js";
import { game } from "../../play/game.js";
import { Block } from "../block/block.js";
import { AI } from "./ai/ai.js";
import { AttributeMap } from "./attribute.js";
/**
 * @typedef SerialisedEntity
 * @prop {number} health
 * @prop {number} shield
 * @prop {string} entity Registry name.
 * @prop {{effect: string, duration: int}[]} statuses
 * @prop {number} x
 * @prop {number} y
 * @prop {number} spawnX
 * @prop {number} spawnY
 * @prop {boolean} isMainPlayer
 */
/** */
class Entity extends ShootableObject {
  name = "Entity";
  resistances = [];
  //How the entity will be drawn
  /**@type {Component[]} */
  components = [];

  moving = false;
  hitSize = 20;
  get speed() {
    return this.attributes.get("speed").get();
  }
  set speed(_) {
    this.attributes.get("speed").set(_);
  }
  get baseSpeed() {
    return this.attributes.get("speed").base();
  }
  get turnSpeed() {
    return this.attributes.get("turnSpeed").get();
  }
  set turnSpeed(_) {
    this.attributes.get("turnSpeed").set(_);
  }
  target = null;

  //nrg
  energy = 100;
  maxEnergy = 0;

  //AI
  aiType = "passive";
  attackRange = 100;
  targetRange = 1000;
  waitTime = 90;
  waitVariance = 60;
  _waiting = 0;
  spawnX = 0;
  spawnY = 0;
  controllable = true;
  _aidelay = 6;
  /** Multiplier for both range and movement speed while passive. */
  passiveIncentiveModifier = 0.75;

  //custom ai, only available for entities and not turrets
  /**@type {AI?} */
  ai = null;

  isBoss = false;

  //Status effects
  /** @type {AttributeMap} */
  attributes = new AttributeMap({
    speed: 10,
    turnSpeed: 10,
    health: 1,
    resistances: 1,
    "fire-rate": 1,
  });

  statuses = {};

  //Physics
  flying = false;
  explosiveness = 0.1;
  _lastPos = Vector.ZERO;

  //because ai rate limit sucks and the scrapper is  s l o w
  #firing = false;

  get computedVelocity() {
    return this.pos.sub(this._lastPos);
  }
  get computedSpeed() {
    return this.computedVelocity.magnitude;
  }

  predictMotion(timeToImpact) {
    return this.computedVelocity.scale(timeToImpact);
  }
  predictMotionDS(speedOfShot, distance) {
    return this.predictMotion(distance / speedOfShot);
  }

  init() {
    super.init();
    this.maxEnergy = this.energy;
    this.components = this.components.map((x) => construct(x, "component"));

    if (!(this.attributes instanceof AttributeMap)) {
      console.warn("Invalid attribute map!");
      this.attributes = new AttributeMap();
      this.dead = true;
    }

    if (this.ai) this.ai = constructFromType(this.ai, AI);
  }

  moveTowards(x, y, rotate = true) {
    super.moveTowards(
      x,
      y,
      this.speed *
        (this.aiType === "passive" ? this.passiveIncentiveModifier : 1),
      this.turnSpeed,
      rotate
    );
  }

  addToWorld(world, x, y) {
    if (!(world instanceof World))
      throw new TypeError(
        "Cannot add entity to non-world object of type '" +
          world?.constructor?.name +
          "'"
      );
    world.entities.push(this);
    this.world = world;
    if (x != null) this.x = x;
    this.spawnX = this.x;
    if (y != null) this.y = y;
    this.spawnY = this.y;
  }

  knock(
    amount = 0,
    direction = -this.direction,
    kineticKnockback = false,
    resolution = 1,
    collided = []
  ) {
    if (resolution < 0) resolution *= -1; //Fix possilility of infinite loop
    if (resolution == 0) resolution = 1;
    //so sin and cos only happen once
    let ymove = Math.sin(radians(direction));
    let xmove = Math.cos(radians(direction));
    if (!kineticKnockback) {
      this.move(amount * xmove, amount * ymove, this.flying);
    } else {
      let hit = false; //Has the entity hit anything?
      for (let iteration = 0; iteration < amount; iteration += resolution) {
        //For every entity this one could possibly collide with
        for (let entity of this.world.entities) {
          if (
            //If a valid collision
            entity !== this &&
            !entity.dead &&
            this.team === entity.team &&
            !collided.includes(entity) && //Not if already hit
            this.collidesWith(entity)
          ) {
            //It's hit something!
            hit = true;
            collided.push(entity);

            //Move back to stop infinite loop
            this.move(-resolution * xmove, -resolution * ymove, this.flying);

            //Propagate knockback
            entity.knock(
              amount * 0.75 /* exponential decay */,
              direction,
              true,
              resolution,
              collided
            ); //Pass on collided entities to prevent infinite loop
          }
        }
        if (hit) break;
        else {
          this.move(resolution * xmove, resolution * ymove, this.flying);
        }
      }
    }
  }

  hitByBullet(bullet) {
    if (bullet.entity.team === this.team) return;
    if (bullet.controlledKnockback) {
      //Get direction to the target
      let direction = new Vector(
        bullet.entity.target.x,
        bullet.entity.target.y
      ).subXY(bullet.x, bullet.y).angle;
      this.knock(bullet.knockback, direction, bullet.kineticKnockback); //Knock with default resolution
    } else {
      this.knock(bullet.knockback, bullet.direction, bullet.kineticKnockback); //Knock with default resolution
    }
    if (bullet.status !== "none") {
      this.applyStatus(bullet.status, bullet.statusDuration);
    }
  }

  tick() {
    this.components.forEach((c) => c.tick(this));
    if (this.controllable) this.doAI();
    super.tick();
    this.calculateAttributeModifiers();
    this._lastPos = new Vector(this.x, this.y);
  }

  doAI() {
    if (this.ai) this.ai.tick(this);
    else {
      if (this.#firing) this.attack();
      if (this._aidelay > 0) {
        this._aidelay--;
      } else {
        this._aidelay = 6;
        if (this.aiType === "passive") {
          this._passiveAI();
        } else if (this.aiType === "hostile") {
          this._hostileAI();
        } else if (this.aiType === "guard") {
          this._guardAI();
        } else if (this.aiType === "scavenger") {
          this._scavengerAI();
        }
      }
      //Base AI
      if (this.target) {
        this._waiting--;
        if (this._waiting <= 0) {
          if (
            this.distanceToPoint(this.target.x, this.target.y) >
            this.size / 2
          )
            this.moveTowards(
              (this.target instanceof Block ? blockSize / 2 : 0) +
                this.target.x,
              (this.target instanceof Block ? blockSize / 2 : 0) +
                this.target.y,
              true
            );
        }
      }
    }
  }

  /**Passive AI
   * - Wanders aimlessly towards random points outside the follow range, but within target range.
   * - Used by Hostile to patrol and find entities to attack.
   * - Won't go over the world edge.
   */
  _passiveAI() {
    if (!this.target || this.target instanceof PhysicalObject)
      this.target = { x: this.x, y: this.y };
    if (this.distanceTo(this.target) < this.size) {
      let xOffset =
        rnd(this.targetRange, this.targetRange / 4) *
        (tru(0.5) ? -1 : 1) *
        this.passiveIncentiveModifier;
      let yOffset =
        rnd(this.targetRange, this.targetRange / 4) *
        (tru(0.5) ? -1 : 1) *
        this.passiveIncentiveModifier;

      this.target.x += xOffset;
      this.target.y += yOffset;
      if (this.target.x > totalSize)
        this.target.x = totalSize * 2 - this.target.x;
      if (this.target.y > totalSize)
        this.target.y = totalSize * 2 - this.target.y;

      if (this.target.x < 0) this.target.x = -this.target.x;
      if (this.target.y < 0) this.target.y = -this.target.y;
      this._waiting =
        this.waitTime + rnd(this.waitVariance, -this.waitVariance);
    }
  }

  /**Hostile AI
   * - Follows entities within its target range.
   * - Acts as Passive when no entity can be found.
   */
  _hostileAI() {
    if (!this._generic_AttackerAI((ent) => !ent.item, true, true))
      this._passiveAI();
  }

  /**Scavenger AI
   * - Follows entities within its target range.
   * - Prioritises dropped items and containers.
   * - Acts as Passive when no entity can be found.
   */
  _scavengerAI() {
    if (
      !this.inventory ||
      !this._generic_AttackerAI((ent) => !!ent.item, false, false)
    )
      if (
        !this._generic_AttackerAI((blk) => !!blk.inventory, true, true, false)
      )
        this._hostileAI();
  }

  /**Guard AI
   * - Follows entities within its `targetRange` of its spawnpoint
   * - Returns to the spawnpoint if the entity left the range, or died
   * - Just waits at the spawnpoint, no passive movement.
   */
  _guardAI() {
    if (
      !this._generic_AttackerAI(
        (ent) =>
          !ent.item &&
          ent.distanceToPoint(this.spawnX, this.spawnY) < this.targetRange
      )
    )
      this.target = { x: this.spawnX, y: this.spawnY };
  }

  /** Generic AI for attacking entities.
   * @param {(entity: Entity) => boolean} conditions Condition for selecting entities, to make this AI less generic.
   * @param {boolean} [shoots=true] Whether or not the entity should shoot at the new target.
   * @returns {boolean} `true` if an entity is being targeted, `false` if not.
   */
  _generic_AttackerAI(
    conditions = () => true,
    shoots = true,
    attackBlocks = true,
    attackEntities = true
  ) {
    this.#firing = false;
    let tempTarget = this.target;
    let entity = attackEntities
      ? this.closestFrom(
          this.world.entities,
          this.targetRange,
          (ent) =>
            !ent.dead &&
            ent.team !== this.team &&
            ent.visible &&
            conditions(ent)
        )
      : null;
    let block = attackBlocks
      ? this.closestFrom(
          this.world.blocksInSquare(
            Math.floor(this.x / blockSize),
            Math.floor(this.y / blockSize),
            Math.floor(this.attackRange / blockSize),
            "blocks"
          ),
          this.attackRange,
          (blk) => blk.team !== this.team && conditions(blk)
        )
      : null;
    this.target = this.closestFrom([entity, block], this.targetRange);
    if (this.target) {
      if (shoots && this.distanceTo(this.target) < this.attackRange)
        this.#firing = true;
      return true;
    } else {
      this.target = tempTarget;
      return false;
    }
  }

  attack() {}

  tickGroundEffects() {
    let blockIn = this.world.getBlock(
      Math.floor(this.x / blockSize),
      Math.floor(this.y / blockSize),
      "blocks"
    );
    let blockOn =
      this.world.getBlock(
        Math.floor(this.x / blockSize),
        Math.floor(this.y / blockSize),
        "floor"
      ) ??
      this.world.getBlock(
        Math.floor(this.x / blockSize),
        Math.floor(this.y / blockSize),
        "tiles"
      );
    if (blockIn && blockIn.walkable) blockIn.steppedOnBy(this);
    else if (blockOn?.speedMultiplier)
      this.attributes.multiply("speed", blockOn.speedMultiplier);
  }
  draw() {
    for (let component of this.components) {
      component.draw(this.x, this.y, this.direction);
    }
    if (PhysicalObject.debug) this._debugAI();
    super.draw();
  }
  /**Draws extra lines and stuff for AI debugging. */
  _debugAI() {
    push();
    noFill();
    stroke(this.target instanceof ShootableObject ? [255, 0, 0] : [0, 255, 0]);
    strokeWeight(4);
    if (this.target) {
      square(this.target.x, this.target.y, this.size);
      line(this.x, this.y, this.target.x, this.target.y);
    }
    if (this.aiType === "hostile" || this.aiType === "guard") {
      stroke(
        this.target instanceof ShootableObject
          ? [200, 0, 255, 100]
          : [255, 255, 0, 100]
      );
      circle(this.x, this.y, this.attackRange * 2);
    }
    if (this.aiType === "hostile" || this.aiType === "scavenger") {
      stroke(
        this.target instanceof ShootableObject
          ? [255, 0, 0, 100]
          : [0, 255, 0, 100]
      );
      circle(this.x, this.y, this.targetRange * 2);
    }
    if (this.aiType === "guard") {
      stroke(
        this.target instanceof ShootableObject
          ? [255, 128, 0, 100]
          : [0, 255, 255, 100]
      );
      circle(this.spawnX, this.spawnY, this.targetRange * 2);
    }
    pop();
  }
  calculateAttributeModifiers() {
    this.attributes.resetAll();
    this.tickStatuses();
    this.tickGroundEffects();
  }

  tickStatuses() {
    for (let status in this.statuses) {
      let time = this.statuses[status];
      /**@type {StatusEffect} */
      let effect = Registries.statuses.get(status);
      if (tru(effect.effectChance))
        this.emit(
          effect.effect,
          rnd(-this.width / 2, this.width / 2),
          rnd(-this.height / 2, this.height / 2)
        );
      if (time % effect.interval === clamp(10, 0, effect.interval - 1)) {
        this.damage(effect.damageType, effect.damage);
        this.heal(effect.healing);
      }
      for (let key in effect.attributeModifiers) {
        this.attributes.multiply(key, effect.attributeModifiers[key]);
      }
      if (time > 0) this.statuses[status]--; //Tick timer
      else delete this.statuses[status];
    }
  }
  applyStatus(effect, time) {
    if (time > (this.statuses[effect]?.time ?? 0)) this.statuses[effect] = time;
  }

  damage(type = "normal", amount = 0, source = null) {
    let calcAmount =
      (amount / this.attributes.getValue("health")) *
      (source?.attributes ? source.attributes.getValue("damageMult") : 1); //Get damage multiplier of source, if there is one
    for (let resistance of this.resistances) {
      if (resistance.type === type) {
        calcAmount -= amount * resistance.amount; //Negative resistance would actually make it do more damage
      }
    }
    return super.damage(type, calcAmount, source);
  }

  move(x, y) {
    super.move(x, y, this.flying);
  }
  onHealthZeroed(type, source) {
    super.onHealthZeroed(type, source);
    liquidDestructionBlast(
      this.x,
      this.y,
      this.width * this.height, //this.maxHealth,
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      this.components,
      this.world
    );
    createDestructionExplosion(this.x, this.y, this);
  }
  /**@returns {SerialisedEntity} */
  serialise() {
    return {
      entity: this.registryName,
      x: roundNum(this.x),
      y: roundNum(this.y),
      spawnX: roundNum(this.spawnX),
      spawnY: roundNum(this.spawnY),
      health: roundNum(this.health),
      shield: roundNum(this.shield),
      energy: roundNum(this.energy),
      statuses: this.statuses,
      isMainPlayer: this === game.player,
    };
  }
  /**@param {SerialisedEntity} created  */
  static deserialise(created, inFull = true) {
    /**@type {Entity} */
    let entity = construct(Registries.entities.get(created.entity), "entity");
    entity.statuses = created.statuses;
    entity.health = created.health;
    entity.shield = created.shield ?? 0;
    entity.energy = created.energy ?? entity.maxEnergy;
    entity._lastMaxShield = created.shield ?? 0;
    entity.constructor.applyExtraProps(entity, created);
    //Rest handled in-chunk, but here it is:
    if (!inFull) return entity;
    entity.spawnX = created.spawnX;
    entity.spawnY = created.spawnY;
    entity.x = created.x;
    entity.y = created.y;
    return entity;
  }
  static applyExtraProps(entity, created) {}
}
export { Entity };
