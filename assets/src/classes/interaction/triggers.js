import { TypeRegistries } from "../../core/registry.js";
import { Entity } from "../entity/entity.js";
import { BulletInstance } from "../projectile/bullet.js";
import { InteractableEntity } from "./interactable-entity.js";

export class ReactionTrigger {
  static time = 0;
  constructor(c) {
    const n = +c;
    this.cooldown = isNaN(n) ? 60 : n;
  }
  cooldown;
  #nextFire = ReactionTrigger.time;
  isTriggered() {
    return true;
  }
  get timeToNextFire() {
    return this.#nextFire - ReactionTrigger.time;
  }
  get canFire() {
    return ReactionTrigger.time >= this.#nextFire;
  }
  stop() {
    this.#nextFire = Infinity;
  }
  trigger() {
    this.#nextFire = ReactionTrigger.time + this.cooldown;
  }
  reset() {
    this.#nextFire = ReactionTrigger.time;
  }
}

export class DamageTakenTrigger extends ReactionTrigger {
  constructor(c, min, max) {
    super(c);
    this.min = +min || 0;
    this.max = +max || Infinity;
  }
  min = 0;
  max = 0;
  /** @param {number} amount @param {string} type  */
  isTriggered(amount, type) {
    return amount <= this.max && amount >= this.min;
  }
}
/** One-time trigger for falling below a certain health point. */
export class HealthPercentTrigger extends ReactionTrigger {
  constructor(percent) {
    super(0);
    this.frac = (+percent || 0) / 100;
  }
  frac;
  /** @param {InteractableEntity} entity */
  isTriggered(entity) {
    return entity.health / entity.maxHealth <= this.frac;
  }
  // override normal code which lets it reset
  // once disabled, no functions will be called, maintaining less overhead
  // reset() does this reset anyway, so it can still run if a new entity is made
  trigger() {
    // sets next fire time to infinity
    this.stop();
  }
}
export class DeathTrigger extends ReactionTrigger {}
export class KillTrigger extends ReactionTrigger {
  constructor(c, filter) {
    super(c);
    this.filter = filter;
  }
  /** @param {Entity} killed  */
  isTriggered(killed) {
    return !this.filter || this.filter === killed;
  }
}
/** Similar to {@linkcode KillTrigger}, but will activate if a status effect or another entity kills the target. Also, won't fire on accidental kills. */
export class TargetDiedTrigger extends ReactionTrigger {
  constructor(c, filter) {
    super(c);
    this.filter = filter;
  }
  /** @param {Entity} killed  */
  isTriggered(killed) {
    return !this.filter || this.filter === killed;
  }
}
export class StatusAppliedTrigger extends ReactionTrigger {
  constructor(c, status) {
    super(c);
    this.status = status;
  }
  /** @param {string} effect  */
  isTriggered(effect) {
    return !this.status || this.status === effect;
  }
}
const getc = TypeRegistries.bullet.get.bind(TypeRegistries.bullet);

export class ShieldBrokenTrigger extends ReactionTrigger {}
export class HitByBulletTrigger extends ReactionTrigger {
  constructor(c, ...neededComponentTypes) {
    super(c);
    this.needs = neededComponentTypes.map(getc);
  }
  needs;
  /** @param {BulletInstance} bullet */
  isTriggered(bullet) {
    for (const ct of this.needs) {
      if (!bullet.model.has(ct)) return false;
    }
    return true;
  }
}
export class HealedTrigger extends ReactionTrigger {
  constructor(c, min, max) {
    super(c);
    this.min = +min || 0;
    this.max = +max || Infinity;
  }
  min = 0;
  max = 0;
  /** @param {number} amount */
  isTriggered(amount) {
    return amount <= this.max && amount >= this.min;
  }
}
export class FlagAddedTrigger extends ReactionTrigger {
  constructor(c, flag) {
    super(c);
    this.flag = flag;
  }
  /** @param {string} added */
  isTriggered(flag) {
    return flag === this.flag;
  }
}
export class FlagRemovedTrigger extends ReactionTrigger {
  constructor(c, flag) {
    super(c);
    this.flag = flag;
  }
  /** @param {string} added */
  isTriggered(flag) {
    return flag === this.flag;
  }
}
