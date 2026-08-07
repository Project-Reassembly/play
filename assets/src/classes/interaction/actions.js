import { construct, constructFromRegistry, constructFromType } from "../../core/constructor.js";
import { clamp, rnd } from "../../core/number.js";
import { Registries, TypeRegistries } from "../../core/registry.js";
import { game } from "../../play/game.js";
import { blockSize, totalSize } from "../../scaling.js";
import { BreakType } from "../block/block.js";
import { CMFTParticle } from "../effect/cmft-particle.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
import { BulletModel } from "../projectile/bullet-model.js";
import { deliverEntity, undeliverEntity } from "../world/events/event-action.js";
import { InteractableEntity } from "./interactable-entity.js";

/** Something that choosing an option does. */
export class DialogueAction {
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {}
  text() {
    return "";
  }
}
export class PlaceholderTextDialogueAction extends DialogueAction {
  constructor(txt) {
    super();
    this.txt = txt;
  }
  /**
   * @param {InteractableEntity} entity
   */
  text(entity) {
    return `${this.txt}`.replaceAll(/\$[a-zA-Z0-9_-]+/g, (v) => {
      const vari = v.substring(1);
      switch (vari) {
        case "entity":
          return entity.name;
        case "player":
          return game.player.entity.name;
        default:
          return Registries.entities.tryGet(vari)?.name ?? "<?>";
      }
    });
  }
}

export class AddFlagAction extends DialogueAction {
  constructor(flag) {
    super();
    this.flag = flag;
  }
  flag = "";
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    entity._dialogue.flag(this.flag);
  }
}
export class AddGlobalFlagAction extends DialogueAction {
  constructor(flag) {
    super();
    this.flag = flag;
  }
  flag = "";
  do() {
    game.player.flags.add("*" + this.flag);
  }
}

export class RemoveFlagAction extends DialogueAction {
  constructor(flag) {
    super();
    this.flag = flag;
  }
  flag = "";
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    entity._dialogue.unflag(this.flag);
  }
}
export class RemoveGlobalFlagAction extends DialogueAction {
  constructor(flag) {
    super();
    this.flag = flag;
  }
  flag = "";
  do() {
    game.player.flags.delete("*" + this.flag);
  }
}

export class ChangeRelationAction extends DialogueAction {
  constructor(rel) {
    super();
    this.change = rel;
  }
  change = "";
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    game.player.relations.addRelation(entity.registryName, this.change);
  }
  /**
   * @param {InteractableEntity} entity
   */
  text(entity) {
    return `#${
      this.change < 0 ? "c-"
      : this.change > 0 ? "a-+"
      : "e-"
    }${this.change * 100}%#-- relation with #=-${entity.name}#--`;
  }
}
export class ChangeRelationWithAction extends DialogueAction {
  constructor(entity, rel) {
    super();
    this.entity = entity;
    this.change = rel;
  }
  entity = "";
  change = "";
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    game.player.relations.addRelation(this.entity, this.change);
  }
  text() {
    return `#${
      this.change < 0 ? "c-"
      : this.change > 0 ? "a-+"
      : "e-"
    }${this.change * 100}%#-- relation with #=-${Registries.entities.tryGet(this.entity)?.name ?? "<?>"}#--`;
  }
}

export class PromoteToBestFriendAction extends DialogueAction {
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    game.player.relations.setBestFriend(entity.registryName);
  }
  /**
   * @param {InteractableEntity} entity
   */
  text(entity) {
    return game.player.relations.bestFriend === entity.registryName ?
        ""
      : `Make #=-${entity.name}#-- your #b-best friend#--.${game.player.relations.bestFriend ? `\n#c-Remove #=-${Registries.entities.tryGet(game.player.relations.bestFriend)?.name ?? "<?>"}#-- as #b-best friend#--` : ""}`;
  }
}
export class PromoteToMortalEnemyAction extends DialogueAction {
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    game.player.relations.setMortalEnemy(entity.registryName);
  }
  text(entity) {
    return game.player.relations.mortalEnemy === entity.registryName ?
        ""
      : `Make #=-${entity.name}#-- your #5-mortal enemy#--.${game.player.relations.mortalEnemy ? `\n#c-Remove #=-${Registries.entities.tryGet(game.player.relations.mortalEnemy)?.name ?? "<?>"}#-- as #5-mortal enemy#--` : ""}`;
  }
}

export class DemoteFromBestFriendAction extends DialogueAction {
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    if (game.player.relations.bestFriend === entity.registryName)
      game.player.relations.setBestFriend(null);
  }
  text(entity) {
    return `#c-Remove #=-${entity.name}#-- as #b-best friend#--`;
  }
}
export class DemoteFromMortalEnemyAction extends DialogueAction {
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    if (game.player.relations.mortalEnemy === entity.registryName)
      game.player.relations.setMortalEnemy(null);
  }
  text(entity) {
    return `#c-Remove #=-${entity.name}#-- as #5-mortal enemy#--`;
  }
}
/** Starts a bossfight with an entity. */
export class StartBossfightAction extends DialogueAction {
  constructor() {
    super();
  }
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    // uhhh not really sure what to do here yet
    // i want to keep the entity the same
    // but save the bossfight part
    // restrict interactions (no talking during fight)
    // change ai
  }
  text(entity) {
    return `#c-Start a fight#--`;
  }
}

export class OpenTradingMenuAction extends DialogueAction {
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    game.player.trade = game.player.trades.get(entity.registryName);
    if (game.player.trade) game.player.trade.updateCosts();
  }
  text() {
    return "Open the #=-trading screen#--";
  }
}
export class AddTradeToMenuAction extends DialogueAction {
  constructor(item) {
    super();
    this.item = item;
  }
  item = "nothing";
  costX = 1;
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    const t = game.player.trades.get(entity.registryName);
    if (t) {
      t.addTrade(this.item, this.costX);
      t.updateEverything();
    }
  }
  text(entity) {
    const t = game.player.trades.get(entity.registryName);
    if (t && t.hasTrade(this.item)) return "";
    const i = Registries.items.tryGet(this.item);
    return `#=-${entity.name}#-- can now trade #>>${i?.image ?? "error"}#=b${i?.name ?? "<?>"}#--`;
  }
}

export class RemoveTradeFromMenuAction extends DialogueAction {
  constructor(item) {
    super();
    this.item = item;
  }
  item = "nothing";
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    const t = game.player.trades.get(entity.registryName);
    if (t) {
      t.removeTrade(this.item, this.costX);
      t.updateEverything();
    }
  }
  text(entity) {
    const t = game.player.trades.get(entity.registryName);
    if (t && t.hasTrade(this.item)) return "";
    const i = Registries.items.tryGet(this.item);
    return `#=-${entity.name}#-- can now trade #>>${i?.image ?? "error"}#=b${i?.name ?? "<?>"}#--`;
  }
}
export class CloseDialogueMenuAction extends DialogueAction {
  do(entity) {
    game.player.conversation = null;
  }
}
export class FuckOffAction extends DialogueAction {
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    game.player.conversation = null;
    undeliverEntity(entity);
  }
  /**
   * @param {InteractableEntity} entity
   */
  text(entity) {
    return `#=-${entity.name}#-- will #c-leave#--`;
  }
}

export class DeliverEntityAction extends DialogueAction {
  entity = "none";
  xOff = 0;
  yOff = 0;
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    const e = construct(Registries.entities.get(this.entity), "entity");
    e.pos = entity.pos.clone();
    if (this.xOff) e.x += rnd.float(-this.xOff, this.xOff);
    if (this.yOff) e.y += rnd.float(-this.yOff, this.yOff);
    e.x = clamp(e.x, 0, totalSize);
    e.y = clamp(e.y, 0, totalSize);
    const world = entity.world;
    const b = world.getBlock(Math.round(e.x / blockSize), Math.round(e.y / blockSize));
    if (b) b.break(BreakType.delete);
    deliverEntity(e, true, world, false);
  }
  /**
   * @param {InteractableEntity} entity
   */
  text(entity) {
    return `#=-${Registries.entities.tryGet(this.entity)?.name ?? "<?>"}#-- will arrive#--`;
  }
}

export class AddItemToInventoryAction extends DialogueAction {
  constructor(item, count) {
    super();
    this.item = item;
    this.count = count;
  }
  item = "nothing";
  count = 1;
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    const left = game.player.entity.inventory.addItem(this.item, this.count);
    DroppedItemStack.create(
      new ItemStack(this.item, left),
      game.player.entity.world,
      game.player.entity.x,
      game.player.entity.y,
      4,
      rnd.float(0, 360),
    );
  }
  text(entity) {
    const i = Registries.items.tryGet(this.item);
    return `Add ${this.count} #>>${i?.image ?? "error"}#=b${i?.name ?? "<?>"}#-- to #=-your inventory#--`;
  }
}
export class RemoveItemFromInventoryAction extends DialogueAction {
  constructor(item, count) {
    super();
    this.item = item;
    this.count = count;
  }
  item = "nothing";
  count = 1;
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    game.player.entity.inventory.removeItem(this.item, this.count);
  }
  text(entity) {
    const i = Registries.items.tryGet(this.item);
    return `#c-Remove#-- ${this.count} #>>${i?.image ?? "error"}#=b${i?.name ?? "<?>"}#-- from #=-your inventory#--`;
  }
}
export class RepeatedAction extends DialogueAction {
  constructor(action, count) {
    super();
    if (action) this.action = action(this.action);
    this.count = +count || 1;
  }
  init() {
    this.action = action(this.action);
  }
  /** @type {DialogueAction} */
  action = new DialogueAction();
  count = 1;
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    for (let i = 0; i < this.count; i++) this.action.do(entity);
  }
  text(entity) {
    return `#n-[x${this.count}]#-- ${this.action.text(entity)}`;
  }
}

export class SpeechAction extends DialogueAction {
  constructor(line) {
    super();
    this.line = line;
  }
  line = "";
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    entity.world.particles.push(
      new CMFTParticle(
        entity.x,
        entity.y - 10,
        -Math.PI * 0.5,
        this.line.length*5,
        2,
        0.075,
        `${this.line}`,
        10,
      ),
    );
  }
}

export class RandomAction extends DialogueAction {
  constructor(...actions) {
    super();
    this.actions = actions.map(action);
  }
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    rnd.in(this.actions).do(entity);
  }
  text(entity) {
    return `#6-[One of the following]#--\n  ${this.actions.flatMap((x) => x.text(entity).split("\n")).join("\n  ")}`;
  }
}

// has no shorthand
export class FireBulletAction extends DialogueAction {
  /** @type {BulletModel} */
  bullet = {};
  amount = 1;
  spread = 0;
  spacing = 0;
  speedMultMin = 1;
  speedMultMax = 1;
  rotationOverride = NaN;
  init() {
    this.bullet = constructFromType(this.bullet, BulletModel);
  }
  /**
   * @param {InteractableEntity} entity
   */
  do(entity) {
    this.bullet.emit(
      entity.x,
      entity.y,
      this.amount,
      this.rotationOverride || entity.direction,
      this.spread,
      this.spacing,
      entity.world,
      entity,
      this.speedMultMin,
      this.speedMultMax,
    );
  }
}

/** @returns {DialogueAction} */
export function action(something) {
  return (
    typeof something === "string" ? actionFromString(something)
    : Array.isArray(something) ? new RandomAction(...something)
    : something instanceof DialogueAction ? something
    : constructFromRegistry(something, TypeRegistries.dialogue, "no-op")
  );
}
/** Converts many shorthands into full instances. **Won't call Integrate's `init()`!** @param {string} str @returns {DialogueAction}*/
export function actionFromString(str) {
  const ci = str.indexOf(":"),
    asti = str.indexOf("*");
  return (
    asti > 0 ?
      // "+x*item" -> give item, like "+4*scrap"
      str.startsWith("+") ?
        new AddItemToInventoryAction(str.substring(asti + 1), +str.substring(1, asti) || 0)
        // "-x*item" -> take item, like "-4*scrap"
      : str.startsWith("-") ?
        new RemoveItemFromInventoryAction(str.substring(asti + 1), +str.substring(1, asti) || 0)
        // "x*item" -> do something many times (no good pure string example yet)
      : new RepeatedAction(str.substring(asti + 1), str.substring(0, asti))
      // "<type>" -> regular instance of a type, like "<trade>"
    : str.startsWith("<") && str.endsWith(">") ?
      new (TypeRegistries.dialogue.get(str.slice(1, -1)))()
    : str.startsWith("~") ?
      // "~e:x" -> change relation with other entity, like "~scrapper:0.2" or "~iti-corporate-merchant:-.1"
      ci !== -1 ?
        new ChangeRelationWithAction(str.substring(1, ci), parseFloat(str.substring(ci + 1)))
        // "~x" -> change relation with this
      : new ChangeRelationAction(parseFloat(str.substring(1)))
      // "'text'" -> adds more tooltip text
    : str.startsWith("'") && str.endsWith("'") ? new PlaceholderTextDialogueAction(str.slice(1, -1))
      // '"text"' -> says stuff
    : str.startsWith('"') && str.endsWith('"') ? new SpeechAction(str.slice(1, -1))
      // "&item" -> adds a trade, like "&scrap"
    : str.startsWith("&") ? new AddTradeToMenuAction(str.substring(1))
      // "^item" -> removes a trade, like "^scrap"
    : str.startsWith("^") ? new RemoveTradeFromMenuAction(str.substring(1))
      // "-*flag" -> removes a global flag 'flag'
    : str.startsWith("-*") ? new RemoveGlobalFlagAction(str.substring(2))
      // "-flag" -> removes a local flag 'flag'
    : str.startsWith("-") ? new RemoveFlagAction(str.substring(1))
      // "*flag" -> adds a global flag 'flag'
    : asti === 1 ? new AddGlobalFlagAction(str.substring(1))
      // "flag" -> adds a local flag 'flag'
    : new AddFlagAction(str)
  );
}
