import { col } from "../../core/color.js";
import { construct, constructFromType } from "../../core/constructor.js";
import { clamp, rnd, roundNum, tru, Vector } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { debug } from "../../play/debug.js";
import {
  autoScaledEffect,
  createDestructionExplosion,
  liquidDestructionBlast,
} from "../../play/effects.js";
import { game } from "../../play/game.js";
import { blockSize, totalSize } from "../../scaling.js";
import { GroundTile } from "../block/ground-tile.js";
import { PhysicalObject, ShootableObject } from "../physical.js";
import { Chunk } from "../world/chunk.js";
import { World } from "../world/world.js";
import { AI } from "./ai/ai.js";
import "./ai/scripter.js";
import { AttributeMap } from "./attribute.js";
import { Model } from "./models/model.js";
/**
 * @typedef SerialisedEntity
 * @prop {number} health
 * @prop {number} shield
 * @prop {string} entity Registry name.
 * @prop {{effect: string, duration: int}[]} statuses
 * @prop {number} x
 * @prop {number} y
 * @prop {number} spawnX
 * @prop {number} spawnYs
 * @prop {boolean} isMainPlayer
 */
/** Shootable object which moves off the chunk grid, possibly with a complex model. */
class Entity extends ShootableObject {
  name = "Entity";
  resistances = [];
  age = 0;

  isBoss = false;

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
  /** @type {PhysicalObject|Vector|null} */
  target = null;

  //nrg
  energy = 100;
  maxEnergy = 0;

  //AI
  aiType = "passive";
  attackRange = 100;
  targetRange = 1000;
  approachDist = 0;
  waitTime = 90;
  waitVariance = 60;
  _waiting = 0;
  spawnX = 0;
  spawnY = 0;
  controllable = true;
  _lastAICheck = 6;
  //because ai rate limit sucks and the scrapper is  s l o w
  #firing = false;
  /** Multiplier for both range and movement speed while passive. */
  passiveIncentiveModifier = 0.75;
  moving = false;

  //custom ai, only available for entities and not turrets
  /**@type {AI?} */
  ai = null;

  //Status effects
  /** @type {AttributeMap} */
  attributes = new AttributeMap({
    "speed": 5,
    "turnSpeed": 10,
    "health": 1,
    "resistances": 1,
    "fire-rate": 1,
  });

  statuses = {};

  //Physics
  flying = false;
  explosiveness = 0.1;
  _lastPos = Vector.ZERO;
  computedVelocity = Vector.ZERO;
  computedSpeed = 0;

  velocity = Vector.ZERO;

  // Visuals
  /** Deprecated visuals, use `Entity.model` instead. @deprecated @type {Component[]} */
  components = [];
  /** @type {Model?} */
  model = null;

  predictMotion(timeToImpact) {
    return this.velocity.scale(timeToImpact);
  }
  predictMotionDS(speedOfShot, distance) {
    return this.predictMotion(distance / speedOfShot);
  }

  init() {
    super.init();
    this.maxEnergy = this.energy;

    if (this.model) {
      this.model.draw(this.x, this.y, this.direction);
    } else this.components = this.components.map((x) => construct(x, "component"));

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
      this.speed * (this.aiType === "passive" ? this.passiveIncentiveModifier : 1),
      this.turnSpeed,
      rotate,
    );
  }

  /** Intent to move in a direction. @param {Vector} vct */
  moveInDirection(vct, ignoreBlocks) {
    const accel = this.flying ? Math.cbrt(this.speed) / 5 : this.speed / 10;
    this.velocity.add(vct.normalise().scale(accel), true);
  }

  hitHorizontalWall(x, y) {
    const spd = Math.abs(this.velocity.x);
    this.velocity.scaleAsymmetrical(0, 1, true);
    if (spd > this.speed) {
      autoScaledEffect("hit-wall", this.world, x, y, 0);
      this.hitSomething(spd - this.speed);
    }
  }
  hitVerticalWall(x, y) {
    const spd = Math.abs(this.velocity.y);
    this.velocity.scaleAsymmetrical(1, 0, true);
    if (spd > this.speed) {
      autoScaledEffect("hit-wall", this.world, x, y, Math.PI / 2);
      this.hitSomething(spd - this.speed);
    }
  }
  hitSomething(speed) {
    this.damage("wall", speed ** 2);
  }

  addToWorld(world, x, y) {
    if (!(world instanceof World))
      throw new TypeError(
        `Cannot add entity to non-world object of type '${world?.constructor?.name}'`,
      );
    world.entities.push(this);
    this.world = world;
    if (x != null) this.x = x;
    this.spawnX = this.x;
    if (y != null) this.y = y;
    this.spawnY = this.y;
  }

  /** @deprecated */
  knock(
    amount = 0,
    direction = -this.direction,
    kineticKnockback = false,
    resolution = 1,
    collided = [],
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
              collided,
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

  knockback(amount = 0, direction = this.direction + 180) {
    this.velocity.add(Vector.fromAngle(direction).scale(amount, true), true);
  }

  hitByBullet(bullet) {
    if (bullet.entity.team === this.team) return;
    // if (bullet.controlledKnockback) {
    //   //Get direction to the target
    //   let direction = new Vector(bullet.entity.target.x, bullet.entity.target.y).subXY(
    //     bullet.x,
    //     bullet.y,
    //   ).angle;
    //   this.knock(bullet.knockback, direction, bullet.kineticKnockback); //Knock with default resolution
    // } else {
    // this.knock(bullet.knockback, bullet.direction, bullet.kineticKnockback); //Knock with default resolution
    // }
    // if (bullet.status !== "none") {
    //   this.applyStatus(bullet.status, bullet.statusDuration);
    // }
  }

  tick() {
    this._lastPos = new Vector(this.x, this.y);
    this.components.forEach((c) => c.tick(this));
    if (this.controllable) this.doAI();
    this.moveVct(this.velocity, this.flying);
    if (this.flying) this.velocity.scale(0.975, true);
    else this.velocity.scale(0.9, true);
    super.tick();
    this.calculateAttributeModifiers();
    this.computedVelocity = this.pos.sub(this._lastPos);
    this.computedSpeed = this.computedVelocity.magnitude;
    this.age++;
  }

  doAI() {
    if (this.ai) this.ai.tick(this);
    else {
      if (this.#firing) this.attack();
      if (this.age >= this._lastAICheck + 6) {
        this._lastAICheck = this.age;
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
      this._approachTarget();
    }
  }

  /**Target Approach AI
   * - Moves towards a point, trying to stop at its approach distance away from the target.
   * - May cause high velocities to confuse the AI for a short time.
   * - Used by literally everything.
   * - Slightly different to `ai.follow`, in that it directly takes current velocity into account, and will stop early to let friction slow it down.
   */
  _approachTarget() {
    if (this.target) {
      this._waiting--;
      if (this._waiting <= 0) {
        if (
          this.distanceToPoint(this.target.x, this.target.y) >
          (this.size * 0.5 + this.approachDist) * (0.6 + this.velocity.magnitude ** 1.11)
        )
          this.moveTowards(this.target.x, this.target.y, true);
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
    if (this.distanceTo(this.target) < this.size * 2) {
      let xOffset =
        rnd.float(this.targetRange, this.targetRange / 4) *
        (tru(0.5) ? -1 : 1) *
        this.passiveIncentiveModifier;
      let yOffset =
        rnd.float(this.targetRange, this.targetRange / 4) *
        (tru(0.5) ? -1 : 1) *
        this.passiveIncentiveModifier;

      this.target.x += xOffset;
      this.target.y += yOffset;
      if (this.target.x > totalSize) this.target.x = totalSize * 2 - this.target.x;
      if (this.target.y > totalSize) this.target.y = totalSize * 2 - this.target.y;

      if (this.target.x < 0) this.target.x = -this.target.x;
      if (this.target.y < 0) this.target.y = -this.target.y;
      this._waiting = this.waitTime + rnd.float(this.waitVariance, -this.waitVariance);
    }
  }

  /**Hostile AI
   * - Follows entities within its target range.
   * - Acts as Passive when no entity can be found.
   */
  _hostileAI() {
    if (!this._generic_AttackerAI((ent) => !ent.item, true, true)) this._passiveAI();
  }

  /**Scavenger AI
   * - Follows entities within its target range.
   * - Prioritises dropped items and containers.
   * - Acts as Passive when no entity can be found.
   */
  _scavengerAI() {
    if (!this.inventory || !this._generic_AttackerAI((ent) => !!ent.item, false, false))
      if (!this._generic_AttackerAI((blk) => !!blk.inventory, true, true, false)) this._hostileAI();
  }

  /**Guard AI
   * - Follows entities within its `targetRange` of its spawnpoint
   * - Returns to the spawnpoint if the entity left the range, or died
   * - Just waits at the spawnpoint, no passive movement.
   */
  _guardAI() {
    if (
      !this._generic_AttackerAI(
        (ent) => !ent.item && ent.distanceToPoint(this.spawnX, this.spawnY) < this.targetRange,
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
    attackEntities = true,
  ) {
    this.#firing = false;
    let tempTarget = this.target;
    let entity =
      attackEntities ?
        this.closestFrom(
          this.world.entities,
          this.targetRange,
          (ent) => !ent.dead && ent.team !== this.team && ent.visible && conditions(ent),
        )
      : null;
    let block =
      attackBlocks ?
        this.closestFrom(
          this.world.blocksInSquare(
            Math.round(this.x / blockSize),
            Math.round(this.y / blockSize),
            Math.round(this.attackRange / blockSize),
            "blocks",
          ),
          this.attackRange,
          (blk) => blk.team !== this.team && conditions(blk),
        )
      : null;
    this.target = this.closestFrom([entity, block], this.targetRange);
    if (this.target) {
      if (shoots && this.distanceTo(this.target) < this.attackRange) this.#firing = true;
      return true;
    } else {
      this.target = tempTarget;
      return false;
    }
  }

  attack() {}

  tickGroundEffects() {
    const bx = Math.round(this.x / blockSize);
    const by = Math.round(this.y / blockSize);
    let blockIn = this.world.getBlock(bx, by);
    if (!this.flying && blockIn && blockIn.walkable) blockIn.steppedOnBy(this);
    // else if (blockOn?.speedMultiplier) this.attributes.multiply("speed", blockOn.speedMultiplier);
    else if (!blockIn /* && !blockOn */) {
      if (this.flying) {
        let tile = this.world.getTileID(bx, by);
        let ore = this.world.getTileID(bx, by, Chunk.Layer.ores);
        this.world.floorFlightCircle(
          this.x,
          this.y,
          ore ?
            col.blend(GroundTile.colorOf(ore), GroundTile.colorOf(tile))
          : GroundTile.colorOf(tile),
          (this.velocity.magnitude + 1) * 0.25,
        );
      } else {
        let tile = this.world.getHighestTileID(bx, by);
        if (tile) GroundTile.entityWalksOn(this, tile);
      }
    }
  }
  draw() {
    if (this.model) {
      this.model.draw(this.x, this.y, this.direction);
    } else {
      for (let component of this.components) {
        component.draw(this.x, this.y, this.direction);
      }
      super.draw();
    }
    if (debug.ai) this._debugAI();
  }
  /**Draws extra lines and stuff for AI debugging. */
  _debugAI() {
    push();
    noFill();
    col.stroke(this.target instanceof ShootableObject ? col.red : col.green);
    strokeWeight(4);
    if (this.target) {
      square(
        this.target.x,
        this.target.y,
        (this.size * 0.5 + this.approachDist) * (0.6 + this.velocity.magnitude ** 1.11),
      );
      line(this.x, this.y, this.target.x, this.target.y);
    }
    if (this.aiType === "hostile" || this.aiType === "guard") {
      col.stroke(
        this.target instanceof ShootableObject ?
          col.from(200, 0, 255, 100)
        : col.from(255, 255, 0, 100),
      );
      circle(this.x, this.y, this.attackRange * 2);
    }
    if (this.aiType === "hostile" || this.aiType === "scavenger") {
      col.stroke(
        this.target instanceof ShootableObject ?
          col.from(255, 0, 0, 100)
        : col.from(0, 255, 0, 100),
      );
      circle(this.x, this.y, this.targetRange * 2);
    }
    if (this.aiType === "guard") {
      col.stroke(
        this.target instanceof ShootableObject ?
          col.from(255, 128, 0, 100)
        : col.from(0, 255, 255, 100),
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
          rnd.float(-this.width / 2, this.width / 2),
          rnd.float(-this.height / 2, this.height / 2),
        );
      if (time % effect.interval === clamp(10, 0, effect.interval - 1)) {
        this.damage(effect.damageType, effect.damage);
        this.heal(effect.healing);
      }
      for (let key in effect.attributeModifiers) {
        this.attributes.multiply(key, effect.attributeModifiers[key]);
      }
      if (time > 0)
        this.statuses[status]--; //Tick timer
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
      col.black,
      col.black,
      col.black,
      this.components,
      this.world,
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

