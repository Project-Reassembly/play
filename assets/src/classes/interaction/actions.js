import { construct, constructFromRegistry } from "../../core/constructor.js";
import { clamp, rnd } from "../../core/number.js";
import { Registries, TypeRegistries } from "../../core/registry.js";
import { game } from "../../play/game.js";
import { blockSize, totalSize } from "../../scaling.js";
import { BreakType } from "../block/block.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
import { deliverEntity, undeliverEntity } from "../world/events/event-action.js";
import { DialogueManager } from "./dialogue.js";

/** Something that choosing an option does. */
export class DialogueAction {
  /**
   * @param {DialogueManager} manager
   */
  do(manager) {}
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
   * @param {DialogueManager} manager
   */
  text(manager) {
    return `${this.txt}`.replaceAll(/\$[a-zA-Z0-9_-]+/g, (v) => {
      const vari = v.substring(1);
      switch (vari) {
        case "entity":
          return manager.entity.name;
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
   * @param {DialogueManager} manager
   */
  do(manager) {
    manager.flags.add(this.flag);
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
   * @param {DialogueManager} manager
   */
  do(manager) {
    manager.flags.delete(this.flag);
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
   * @param {DialogueManager} manager
   */
  do(manager) {
    game.player.relations.addRelation(manager.entity.registryName, this.change);
  }
  /**
   * @param {DialogueManager} manager
   */
  text(manager) {
    return `#${
      this.change < 0 ? "c-"
      : this.change > 0 ? "a-+"
      : "e-"
    }${this.change * 100}%#-- relation with #=-${manager.entity.name}#--`;
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
   * @param {DialogueManager} manager
   */
  do(manager) {
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
   * @param {DialogueManager} manager
   */
  do(manager) {
    game.player.relations.setBestFriend(manager.entity.registryName);
  }
  /**
   * @param {DialogueManager} manager
   */
  text(manager) {
    return game.player.relations.bestFriend === manager.entity.registryName ?
        ""
      : `Make #=-${manager.entity.name}#-- your #b-best friend#--.${game.player.relations.bestFriend ? `\n#c-Remove #=-${Registries.entities.tryGet(game.player.relations.bestFriend)?.name ?? "<?>"}#-- as #b-best friend#--` : ""}`;
  }
}
export class PromoteToMortalEnemyAction extends DialogueAction {
  /**
   * @param {DialogueManager} manager
   */
  do(manager) {
    game.player.relations.setMortalEnemy(manager.entity.registryName);
  }
  text(manager) {
    return game.player.relations.mortalEnemy === manager.entity.registryName ?
        ""
      : `Make #=-${manager.entity.name}#-- your #5-mortal enemy#--.${game.player.relations.mortalEnemy ? `\n#c-Remove #=-${Registries.entities.tryGet(game.player.relations.mortalEnemy)?.name ?? "<?>"}#-- as #5-mortal enemy#--` : ""}`;
  }
}

export class DemoteFromBestFriendAction extends DialogueAction {
  /**
   * @param {DialogueManager} manager
   */
  do(manager) {
    if (game.player.relations.bestFriend === manager.entity.registryName)
      game.player.relations.setBestFriend(null);
  }
  text(manager) {
    return `#c-Remove #=-${manager.entity.name}#-- as #b-best friend#--`;
  }
}
export class DemoteFromMortalEnemyAction extends DialogueAction {
  /**
   * @param {DialogueManager} manager
   */
  do(manager) {
    if (game.player.relations.mortalEnemy === manager.entity.registryName)
      game.player.relations.setMortalEnemy(null);
  }
  text(manager) {
    return `#c-Remove #=-${manager.entity.name}#-- as #5-mortal enemy#--`;
  }
}
/** Starts a bossfight with an entity. Tries to preserve the current dialogue state. */
export class StartBossfightAction extends DialogueAction {
  constructor(ent) {
    super();
    this.boss = ent;
  }
  boss = "";
  /**
   * @param {DialogueManager} manager
   */
  do(manager) {
    const boss = construct(Registries.entities.get(this.boss), "entity");
    boss.addToWorld(manager.entity.world, manager.entity.x, manager.entity.y);
    boss.dialogue = manager;
  }
  text(manager) {
    return `#a-Remove #=-${manager.entity.name}#-- as #5-mortal enemy#--`;
  }
}

export class OpenTradingMenuAction extends DialogueAction {
  /**
   * @param {DialogueManager} manager
   */
  do(manager) {
    game.player.trade = game.player.trades.get(manager.entity.registryName);
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
   * @param {DialogueManager} manager
   */
  do(manager) {
    const t = game.player.trades.get(manager.entity.registryName);
    if (t) {
      t.addTrade(this.item, this.costX);
      t.updateEverything();
    }
  }
  text(manager) {
    const t = game.player.trades.get(manager.entity.registryName);
    if (t && t.hasTrade(this.item)) return "";
    const i = Registries.items.tryGet(this.item);
    return `#=-${manager.entity.name}#-- can now trade #>>${i?.image ?? "error"}#=b${i?.name ?? "<?>"}#--`;
  }
}

export class RemoveTradeFromMenuAction extends DialogueAction {
  constructor(item) {
    super();
    this.item = item;
  }
  item = "nothing";
  /**
   * @param {DialogueManager} manager
   */
  do(manager) {
    const t = game.player.trades.get(manager.entity.registryName);
    if (t) {
      t.removeTrade(this.item, this.costX);
      t.updateEverything();
    }
  }
  text(manager) {
    const t = game.player.trades.get(manager.entity.registryName);
    if (t && t.hasTrade(this.item)) return "";
    const i = Registries.items.tryGet(this.item);
    return `#=-${manager.entity.name}#-- can now trade #>>${i?.image ?? "error"}#=b${i?.name ?? "<?>"}#--`;
  }
}
export class CloseDialogueMenuAction extends DialogueAction {
  do(manager) {
    game.player.conversation = null;
  }
}
export class FuckOffAction extends DialogueAction {
  /**
   * @param {DialogueManager} manager
   */
  do(manager) {
    game.player.conversation = null;
    undeliverEntity(manager.entity);
  }
  /**
   * @param {DialogueManager} manager
   */
  text(manager) {
    return `#=-${manager.entity.name}#-- will #c-leave#--`;
  }
}

export class DeliverEntityAction extends DialogueAction {
  entity = "none";
  xOff = 0;
  yOff = 0;
  /**
   * @param {DialogueManager} manager
   */
  do(manager) {
    const e = construct(Registries.entities.get(this.entity), "entity");
    e.pos = manager.entity.pos.clone();
    if (this.xOff) e.x += rnd.float(-this.xOff, this.xOff);
    if (this.yOff) e.y += rnd.float(-this.yOff, this.yOff);
    e.x = clamp(e.x, 0, totalSize);
    e.y = clamp(e.y, 0, totalSize);
    const world = manager.entity.world;
    const b = world.getBlock(Math.round(e.x / blockSize), Math.round(e.y / blockSize));
    if (b) b.break(BreakType.delete);
    deliverEntity(e, true, world, false);
  }
  /**
   * @param {DialogueManager} manager
   */
  text(manager) {
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
   * @param {DialogueManager} manager
   */
  do(manager) {
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
  text(manager) {
    const t = game.player.trades.get(manager.entity.registryName);
    if (t && t.hasTrade(this.item)) return "";
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
   * @param {DialogueManager} manager
   */
  do(manager) {
    game.player.entity.inventory.removeItem(this.item, this.count);
  }
  text(manager) {
    const t = game.player.trades.get(manager.entity.registryName);
    if (t && t.hasTrade(this.item)) return "";
    const i = Registries.items.tryGet(this.item);
    return `#c-Remove#-- ${this.count} #>>${i?.image ?? "error"}#=b${i?.name ?? "<?>"}#-- from #=-your inventory#--`;
  }
}
export class RepeatedAction extends DialogueAction {
  constructor(action, count) {
    super();
    if (action)
      this.action =
        typeof action === "string" ?
          actionFromString(action)
        : constructFromRegistry(action, TypeRegistries.dialogue, "no-op");
    this.count = +count || 1;
  }
  init() {
    this.action =
      this.action instanceof DialogueAction ? this.action
      : typeof this.action === "string" ? actionFromString(this.action)
      : constructFromRegistry(this.action, TypeRegistries.dialogue, "no-op");
  }
  /** @type {DialogueAction} */
  action = new DialogueAction();
  count = 1;
  /**
   * @param {DialogueManager} manager
   */
  do(manager) {
    for (let i = 0; i < this.count; i++) this.action.do(manager);
  }
  text(manager) {
    return `#n-[x${this.count}]#-- ${this.action.text(manager)}`;
  }
}
/** Converts many shorthands into full instances. **Won't call Integrate's `init()`!** @param {string} str */
export function actionFromString(str) {
  const ci = str.indexOf(":"),
    asti = str.indexOf("*");
  return (
    asti > 0 ?
    // "+x*item" -> give item, like "+4*scrap"
      str.startsWith("+") ?
        new AddItemToInventoryAction(str.substring(asti + 1), str.substring(0, asti))
    // "-x*item" -> take item, like "-4*scrap"
      : str.startsWith("-") ?
        new RemoveItemFromInventoryAction(str.substring(asti + 1), str.substring(0, asti))
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
