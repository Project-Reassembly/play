import { constructFromType } from "../../core/constructor.js";
import Integrate from "../../lib/integrate.js";
import { game } from "../../play/game.js";
import { EquippedEntity } from "../entity/inventory-entity.js";
import { BulletInstance } from "../projectile/bullet.js";
import { DialogueAction } from "./actions.js";
import { DialogueManager } from "./dialogue.js";
import { ReactionManager } from "./reactions.js";
import { TradeInfo, TradingManager } from "./trading.js";
import {
  DamageTakenTrigger,
  DeathTrigger,
  HealedTrigger,
  HealthPercentTrigger,
  HitByBulletTrigger,
  KillTrigger,
  ReactionTrigger,
  ShieldBrokenTrigger,
  StatusAppliedTrigger,
  TargetDiedTrigger,
} from "./triggers.js";

/**
 * An entity which the player can interact with.\
 * If `dialogue` is present, then the player will be able to talk to them via their `DialogueManager`.\
 *
 * All of these will have the ability to be added to the player's `RelationManager` - some important notes about that:
 *  - Each entity type has its own relation, but each entity instance with the same registry name shares the relation.
 *   To avoid confusion, **only one instance of each registry name should be made**. I recommend the use of world events.
 *  - The persistent player stores relations, not any entity - so no deaths anywhere affect relations.
 *  - Flags are uncompressed (unless they match a registry name), so use short names where possible. I recommend an enumeration class of some sort, if possible (i.e. not if working in json)
 *  - In custom action text, you can use `$entity` to refer to the current entity's display name, `$player` to refer to the player's display name and `$<name>` to refer to the default display name of the entity with the registry name `<name>`.
 *
 */
export class InteractableEntity extends EquippedEntity {
  /** Doesn't exist for long. @type {Integrate.Unconstructed<DialogueManager>} */
  dialogue = null;
  /** Doesn't exist for long. @type {Integrate.Unconstructed<TradeInfo>[]} */
  trades = null;
  tradeCostX = 1;
  /** Doesn't exist for long. @type {[Integrate.Unconstructed<ReactionTrigger>[], Integrate.Unconstructed<DialogueAction>[]][]} */
  reactions = [];

  init() {
    super.init();
    if (this.dialogue) {
      // centralised dialogue for better saving
      const d = game.player.dialogue.getOrInsertComputed(this.registryName, () =>
        constructFromType(this.dialogue, DialogueManager),
      );

      d.flags = game.player.savedLocalFlags.get(this.registryName) ?? new Set();

      d.entity = this;
      d.postEntInit();
      d.updateNode();
    }
    if (this.trades) {
      const t = game.player.trades.getOrInsertComputed(this.registryName, () =>
        constructFromType({ trades: this.trades, tradeCostX: this.tradeCostX }, TradingManager),
      );

      t.entity = this;
      t.updateEverything();
    }
    if (this.reactions) {
      const r = game.player.reactions.getOrInsertComputed(
        this.registryName,
        () => new ReactionManager(this.reactions),
      );

      r.reset();
    }
    delete this.dialogue;
    delete this.trades;
    delete this.reactions;
    delete this.tradeCostX;
  }
  get playerRelation() {
    return game.player.relations.getRelation(this.registryName);
  }
  get _dialogue() {
    return game.player.dialogue.get(this.registryName);
  }
  get _trades() {
    return game.player.trades.get(this.registryName);
  }
  get _reactions() {
    return game.player.reactions.get(this.registryName);
  }
  takeDamage(type, amount, source) {
    this._reactions.fire(this, DamageTakenTrigger, amount, type);
    this._reactions.fire(this, HealthPercentTrigger, this);
    super.takeDamage(type, amount, source);
  }
  applyStatus(effect, time) {
    this._reactions.fire(this, StatusAppliedTrigger, effect);
    super.applyStatus(effect, time);
  }
  breakShield() {
    this._reactions.fire(this, ShieldBrokenTrigger);
    super.breakShield();
  }
  // add for these methods
  heal(amount) {
    this._reactions.fire(this, HealedTrigger, amount);
    super.heal(amount);
  } // healed
  /** @param {BulletInstance} bullet  */
  hitByBullet(bullet) {
    if (bullet.entity?.team !== this.team) this._reactions.fire(this, HitByBulletTrigger, bullet);
    super.hitByBullet(bullet);
  } // shot
  onHealthZeroed(type, source) {
    this._reactions.fire(this, DeathTrigger);
    super.onHealthZeroed(type, source);
  } // death
  kills(other) {
    this._reactions.fire(this, KillTrigger, other);
  } // kill entity
  doAI() {
    if (this.target?.dead) {
      this._reactions.fire(this, TargetDiedTrigger, this.target);
      this.target = null;
    }
    super.doAI();
  }
  // hitSomething // slammed into wall
  // knockback // yeeted
}
