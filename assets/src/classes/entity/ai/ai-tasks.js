import { construct, constructFromType } from "../../../core/constructor.js";
import { Vector } from "../../../core/number.js";
import { RegisteredItem } from "../../../core/registered-item.js";
import { ui } from "../../../core/ui.js";
import { autoScaledEffect } from "../../../play/effects.js";
import {
  ShootPattern,
  WeaponShootConfiguration,
} from "../../item/weapon-exts.js";
import { patternedBulletExpulsion } from "../../projectile/yeeter.js";
import { Timer } from "../../timer.js";
import { Entity } from "../entity.js";
import { AICondition } from "./ai-conditions.js";
import { AI } from "./ai.js";

//Base class, counts as just waiting
export class AITask extends RegisteredItem{
  started = false;
  duration = 1;
  #timer = 0;
  /**@type {AICondition | string} */
  condition = "always";
  init() {
    if (this.condition === "always") this.condition = AICondition.ALWAYS;
    else if (this.condition === "never") this.condition = AICondition.NEVER;
    else this.condition = construct(this.condition, "aicon.constant");
  }
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  tick(ai, entity) {
    if (!this.condition.canDoIt(ai, entity)) return;
    if (!this.started) {
      this.started = true;
      this.start(ai, entity);
    } else if (this.#timer < this.duration) {
      this.#timer++;
      this.update(ai, entity);
    } else {
      this.end(ai, entity);
      this.started = false;
      this.#timer = 0;
      ai.next();
    }
  }
  /**
   * Starts performing the action represented by this AI task.
   * @param {AI} ai
   * @param {Entity} entity The entity to do it to.
   */
  start(ai, entity) {}
  /**
   * Continue performing the action represented by this AI task.
   * @param {AI} ai
   * @param {Entity} entity The entity to do it to.
   */
  update(ai, entity) {}
  /**
   * Finishes performing the action represented by this AI task.
   * @param {AI} ai
   * @param {Entity} entity The entity to do it to.
   */
  end(ai, entity) {}
}
/**
 * Task for attacking generally. Most entities won't use this, but it's the default AI's option for using weapons.
 */
export class AIAttackTask extends AITask {
  /**
   * Continue performing the action represented by this AI task.
   * @param {AI} ai
   * @param {Entity} entity The entity to do it to.
   */
  update(ai, entity) {
    entity.attack();
  }
}
/**
 * And now there's stuff! uhhhhhhh basically shoots bullets like a weapon but without the whole ammo->bullet relation bit
 */
export class ShootBulletsTask extends AITask {
  shootX = 0;
  shootY = 0;
  shootD = 0;
  bullet = {};
  pattern = new ShootPattern();
  effect = "none";
  timer = new Timer();
  /**
   * @param {AI} ai
   * @param {Entity} entity The entity to do it to.
   */
  start(ai, entity) {
    this.timer.repeat(
      () => {
        let pos = entity.pos.add(
          new Vector(this.shootX, this.shootY).rotate(entity.direction)
        );
        autoScaledEffect(
          this.effect,
          entity.world,
          pos.x,
          pos.y,
          entity.directionRad + radians(this.shootD)
        );
        patternedBulletExpulsion(
          pos.x,
          pos.y,
          this.bullet,
          this.pattern.amount,
          entity.direction + this.shootD,
          this.pattern.spread,
          this.pattern.spacing,
          entity.world,
          entity
        );
      },
      this.pattern.burst,
      this.pattern.interval
    );
  }
}
/**
 * Similar to ShootBulletsTask, fires bullets. Can spawn from anywhere on the map, or relative to the player's camera.
 */
export class CreateBulletsTask extends AITask {
  x = 0;
  y = 0;
  direction = 0;
  relativeToCamera = false;
  bullet = {};
  pattern = new ShootPattern();
  effect = "none";
  timer = new Timer();
  init() {
    super.init();
    this.pattern = constructFromType(this.pattern, ShootPattern);
  }
  /**
   * @param {AI} ai
   * @param {Entity} entity The entity to do it to.
   */
  start(ai, entity) {
    this.timer.repeat(
      (i) => {
        let pos = this.relativeToCamera
          ? ui.camera.pos.addXY(this.x, this.y)
          : new Vector(this.x, this.y);
        autoScaledEffect(
          this.effect,
          entity.world,
          pos.x,
          pos.y,
          radians(this.direction)
        );
        patternedBulletExpulsion(
          pos.x,
          pos.y,
          this.bullet,
          this.pattern.amount,
          this.direction,
          this.pattern.spread,
          this.pattern.spacing,
          entity.world,
          entity
        );
      },
      this.pattern.burst,
      this.pattern.interval
    );
    this.timer.tick();
  }
  update(ai, entity) {
    this.timer.tick();
  }
}
/**
 * Gets a new target, and stores it in the AI.
 */
export class RetargetTask extends AITask {
  range = 0;
  mustBeOtherTeam = true;
  checkEntities = true;
  checkBlocks = true;
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  start(ai, entity) {
    let centity = this.checkEntities
      ? entity.closestFrom(
          entity.world.entities,
          this.range || entity.targetRange,
          (ent) =>
            !ent.dead &&
            (!this.mustBeOtherTeam || ent.team !== entity.team) &&
            ent.visible
        )
      : null;
    let cblock = attackBlocks
      ? entity.closestFrom(
          entity.world.blocksInSquare(
            Math.floor(entity.x / blockSize),
            Math.floor(entity.y / blockSize),
            Math.floor((this.range || entity.attackRange) / blockSize),
            "blocks"
          ),
          this.range || entity.attackRange,
          (blk) => !this.mustBeOtherTeam || blk.team !== entity.team
        )
      : null;
    ai.target = entity.closestFrom([centity, cblock], entity.targetRange);
  }
}
/**
 * Uses the entity's default movement function to follow the AI's current target.
 */
export class TrackTargetTask extends AITask {
  /**
   * @param {AI} ai
   * @param {Entity} entity
   */
  update(ai, entity) {
    if (entity.distanceToPoint(ai.target.x, ai.target.y) > entity.size / 2)
      entity.moveTowards(
        (ai.target instanceof Block ? blockSize / 2 : 0) + ai.target.x,
        (ai.target instanceof Block ? blockSize / 2 : 0) + ai.target.y,
        true
      );
  }
}

/** Part of the flexible system for AI data storage.
 *  Sets a data key to a value.
 */
export class SetDataTask extends AITask {
  name = "data";
  value = 0;
  /**
   * @param {AI} ai
   * @param {Entity} entity The entity to do it to.
   */
  start(ai, entity) {
    ai.data.set(this.name, this.value);
  }
}
