import * as CMFT from "../../core/cmft.js";
import { col } from "../../core/color.js";
import { construct } from "../../core/constructor.js";
import { rnd, roundNum } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { ImageContainer, ui } from "../../core/ui.js";
import { game } from "../../play/game.js";
import { Log } from "../../play/messaging.js";
import { Accessory, TradeCostModifierComponent } from "../item/accessory.js";
import { DroppedItemStack } from "../item/dropped-itemstack.js";
import { ItemStack } from "../item/item-stack.js";
import { Item } from "../item/item.js";
import { pointInRect } from "../physical.js";
import { InteractableEntity } from "./interactable-entity.js";

export class TradeInfo {
  constructor(cm = 1) {
    this.costX = cm;
  }
  costX = 1;
  /** @type {CMFT.Drawer} */
  #drawer = null;
  /** @type {CMFT.Drawer} */
  #tooltip = null;
  #cost = 0;
  /** @type {Item?} */
  #item = null;
  page = 0;
  /** @type {InteractableEntity} */
  updateItemType(item, entity, cx) {
    this.#item = construct(Registries.items.get(item), "item");
    this.updateCost(entity, cx);
  }
  /** @type {InteractableEntity} */
  updateCost(entity, cx) {
    const icost = this.#item.marketValue * this.costX * (+cx || 1);
    this.#cost = icost;
    let tt = `#>>${this.#item.image}#@b${this.#item.name}#--\n Base cost: #a-$${roundNum(icost, 2)}#--/item`;

    const relation = game.player.relations.getRelation(entity.registryName);
    const relationCostMul = Math.round(0.99 ** (relation * 100) * 20) / 20;
    if (Math.abs(relationCostMul - 1) >= 0.01) {
      this.#cost *= relationCostMul;
      tt += `\n#n- - #${relationCostMul > 1 ? `c-+${roundNum((relationCostMul - 1) * 100)}` : `a--${roundNum((1 - relationCostMul) * 100)}`}%#-- from ${relation > 0 ? "#a-+" : "#c-"}${roundNum(relation * 100)}%#-- NPC relation`;
    }
    if (game.player.entity) {
      game.player.entity.equipment.iterate((is, sl, stop) => {
        const i = is.getItem();
        if (i instanceof Accessory) {
          i.modifiers.forEach((m) => {
            if (m instanceof TradeCostModifierComponent) {
              const rcm = m.multiplier;
              this.#cost *= rcm;
              tt += `\n#n- - #${rcm > 1 ? `c-+${roundNum((rcm - 1) * 100)}` : `a--${roundNum((1 - rcm) * 100)}`}%#-- from #=b${i.name}`;
            }
          });
        }
      });
    }
    if (this.#cost !== icost)
      tt += `\n#n- -> #--Final cost of #a-$${roundNum(this.#cost, 2)}#--/item`;

    this.#tooltip = CMFT.drawer(tt, 20, 40);
    this.#drawer = CMFT.Collection.createTruncated(`#-b${this.#item.name}`, 19).drawer(20).noBG();
  }
  /** @readonly */
  get cost() {
    return this.#cost;
  }
  /** @readonly */
  get cmft() {
    return this.#drawer;
  }
  /** @readonly */
  get tooltip() {
    return this.#tooltip;
  }
  /** @readonly */
  get stackSize() {
    return this.#item?.stackSize ?? 100;
  }
}
const tradesPerPage = 10;

export class TradingManager {
  /** Deleted. @type {({item:string, costX: number})[]} */
  trades = [];
  /** @type {Map<string, TradeInfo>} */
  #trades = new Map();
  /** @type {Map<string, number>} */
  #shoppingList = new Map();
  #listCost = 0;
  /** @type {InteractableEntity} */
  entity = null;
  tradeCostX = 1;
  #page = 0;
  #pages = 1;
  init() {
    [...this.trades].forEach((x) => {
      if (typeof x === "string") this.#trades.set(x, new TradeInfo(1));
      else this.#trades.set(x.item, new TradeInfo(x.costX));
    });
    delete this.trades;
  }
  updateEverything() {
    let page = 0,
      c = 0;
    for (const [item, trade] of this.#trades) {
      trade.page = page;
      trade.updateItemType(item, this.entity, this.tradeCostX);
      c++;
      if (c % tradesPerPage === 0) {
        page++;
      }
    }
    if (c % tradesPerPage === 0) page--;
    this.#pages = page;
  }
  updatePages() {
    let page = 0,
      c = 0;
    for (const [item, trade] of this.#trades) {
      trade.page = page;
      c++;
      if (c % tradesPerPage === 0) {
        page++;
      }
    }
    if (c % tradesPerPage === 0) page--;
    this.#pages = page;
  }
  /** Contains `construct`ors! */
  updateItemTypes() {
    for (const [item, trade] of this.#trades) {
      trade.updateItemType(item, this.entity, this.tradeCostX);
    }
  }
  updateCosts() {
    for (const [item, trade] of this.#trades) {
      trade.updateCost(this.entity, this.tradeCostX);
    }
    let c = 0;
    for (const [item, count] of this.#shoppingList) {
      c += count * this.#trades.get(item).cost;
    }
    this.#listCost = c;
  }
  updateListCosts() {
    let c = 0;
    for (const [item, count] of this.#shoppingList) {
      c += count * this.#trades.get(item).cost;
    }
    this.#listCost = c;
  }
  addTrade(item, costX) {
    this.#trades.set(item, new TradeInfo(costX));
  }
  removeTrade(item) {
    this.#trades.delete(item);
    this.#shoppingList.delete(item);
  }
  hasTrade(item) {
    return this.#trades.has(item);
  }
  draw(basex, basey) {
    let sel = null;
    push();
    fill(0);
    strokeWeight(4);
    col.stroke(col.accent);
    // available items
    rect(basex + 195, basey, 350 + 20, 420);
    textSize(35);
    textAlign(CENTER);
    text("Available to Buy", basex + 195, basey - 230);
    let cy = -(tradesPerPage + 1) * 20;
    push();
    for (const [item, trade] of this.#trades) {
      if (trade.page !== this.#page) continue;
      cy += 40;
      const selected = pointInRect(ui.mouse.x, ui.mouse.y, basex + 195, cy, 350, 40);
      const i = Registries.items.tryGet(item);
      fill(selected ? 50 : 0);
      strokeWeight(4);
      col.stroke(col.accent);
      rect(basex + 195, cy, 350, 40);
      if (selected) {
        rect(basex + 195, cy, 340, 30);

        triangle(basex + 370, cy - 20, basex + 370, cy + 20, basex + 390, cy);
      }
      rect(basex + 40, cy, 30, 30);
      ImageContainer.draw(i?.image ?? "error", basex + 40, cy, 30, 30);
      noStroke();
      trade.cmft.draw(basex + 65, cy - trade.cmft.height * 0.5, col.white, col.white);
      if (selected) sel = trade;
      textAlign(RIGHT);
      textSize(20);
      col.fill(
        trade.cost <= game.player.money ? CMFT.Decoration.colours.a : CMFT.Decoration.colours.c,
      );
      text(
        `$${trade.cost < 1 ? roundNum(trade.cost, 3) : shortenedNumber(trade.cost)}`,
        basex + 360,
        cy + 10,
      );
    }
    pop();
    // bought items
    cy = -(tradesPerPage + 1) * 20;
    rect(basex + 195 + 400, basey, 350 + 20, 420);
    text("Shopping List", basex + 195 + 400, basey - 230);
    push();
    textSize(15);
    textAlign(LEFT, CENTER);
    for (const [item, count] of this.#shoppingList) {
      cy += 40;
      const selected = pointInRect(ui.mouse.x, ui.mouse.y, basex + 195 + 400, cy, 350, 40);
      const i = Registries.items.tryGet(item),
        c = this.#trades.get(item);
      fill(selected ? 50 : 0);
      strokeWeight(4);
      col.stroke(col.accent);
      rect(basex + 195 + 400, cy, 350, 40);
      if (selected) {
        rect(basex + 195 + 400, cy, 340, 30);

        triangle(basex + 410, cy - 20, basex + 410, cy + 20, basex + 390, cy);
        textAlign(LEFT);
        text("SHIFT to remove 1 stack", basex + 790, cy - 10);
        text("CTRL to remove all", basex + 790, cy + 10);
      }
      rect(basex + 40 + 400, cy, 30, 30);
      ImageContainer.draw(i?.image ?? "error", basex + 40 + 400, cy, 30, 30);
      noStroke();
      c.cmft.draw(basex + 65 + 400, cy - c.cmft.height * 0.5, col.white, col.white);
      textAlign(RIGHT);
      col.fill(
        c.cost * count <= game.player.money ? CMFT.Decoration.colours.a : CMFT.Decoration.colours.c,
      );
      textSize(18);
      text(`×${count}`, basex + 360 + 400, cy - 8);
      text(`$${shortenedNumber(c.cost * count, 1)}`, basex + 360 + 400, cy + 10);
    }
    pop();
    // page controls
    textSize(25);
    textAlign(CENTER, CENTER);
    if (this.#page > 0) {
      rect(basex + 195 - 150, basey + 240, 40, 40);
      text("<", basex + 195 - 150, basey + 240);
    }
    rect(basex + 195, basey + 240, 240, 40);
    text(`Page ${this.#page + 1}/${this.#pages + 1}`, basex + 195, basey + 240);
    if (this.#page < this.#pages) {
      rect(basex + 195 + 150, basey + 240, 40, 40);
      text(">", basex + 195 + 150, basey + 240);
    }
    // buy controls
    rect(basex + 195 + 370, basey + 240, 310, 40);
    rect(basex + 195 + 560, basey + 240, 40, 40);
    if (pointInRect(ui.mouse.x, ui.mouse.y, basex + 195 + 400, cy, 350, 40))
      rect(basex + 195 + 560, basey + 240, 35, 35);
    col.fill(
      this.#listCost <= game.player.money ? CMFT.Decoration.colours.a : CMFT.Decoration.colours.c,
    );
    noStroke();
    text(
      `$${roundNum(this.#listCost, 2)}${this.#listCost > 1000 ? ` (${shortenedNumber(this.#listCost)})` : ""}`,
      basex + 195 + 370,
      basey + 240,
    );
    text(`✔️`, basex + 195 + 560, basey + 240);
    if (sel) sel.tooltip.draw(ui.mouse.x + 10, ui.mouse.y + 10, col.white, col.accent);
    pop();
  }
  /** @returns {[string, bool]} */
  getHoveredItem(basex, basey) {
    let cy = basey - (tradesPerPage + 1) * 20;
    for (const [item, trade] of this.#trades) {
      if (trade.page !== this.#page) continue;
      cy += 40;
      if (pointInRect(ui.mouse.x, ui.mouse.y, basex + 195, cy, 350, 40)) return [item, true];
    }
    cy = basey - (tradesPerPage + 1) * 20;
    for (const [item] of this.#shoppingList) {
      cy += 40;
      if (pointInRect(ui.mouse.x, ui.mouse.y, basex + 195 + 400, cy, 350, 40)) return [item, false];
    }
    return [null, false];
  }
  tryClick(basex, basey) {
    if (
      pointInRect(ui.mouse.x, ui.mouse.y, basex + 195 + 150, basey + 240, 40, 40) &&
      this.#page < this.#pages
    ) {
      this.#page++;
      return true;
    } else if (
      pointInRect(ui.mouse.x, ui.mouse.y, basex + 195 - 150, basey + 240, 40, 40) &&
      this.#page > 0
    ) {
      this.#page--;
      return true;
    } else if (pointInRect(ui.mouse.x, ui.mouse.y, basex + 195 + 560, basey + 240, 40, 40)) {
      if (game.player.money >= this.#listCost) this.buy();
      else Log.send("#c-Can't afford that!");
      return true;
    } else {
      const [item, isAdd] = this.getHoveredItem(basex, basey);
      if (!item) return false;
      // stuff
      if (isAdd) this.queue(item);
      else this.dequeue(item);
      return true;
    }
  }
  buy() {
    const spent = this.#listCost;
    game.player.money -= spent;
    this.#listCost = 0;
    const count = [...this.#shoppingList.values()].reduce((p, c) => p + c);
    Log.send(`#a-Bought ${count} items for \$${shortenedNumber(spent)}`);
    for (const [item, count] of this.#shoppingList) {
      const left = game.player.entity.inventory.addItem(item, count, true);
      DroppedItemStack.create(
        new ItemStack(item, left),
        game.player.entity.world,
        game.player.entity.x,
        game.player.entity.y,
        4,
        rnd.float(0, 360),
      );
    }
    this.#shoppingList.clear();

    // relation
    const npc = this.entity.registryName;
    const rel = game.player.relations.getRelation(this.entity);
    const m = Math.sqrt(Math.max(0.8 - Math.abs(rel), 0) * spent * count) * 0.00025;
    game.player.relations.addRelation(npc, m);
    Log.send(`#a-+${roundNum(m * 100, 2)}%#-- relation with #=-${this.entity.name}#-- for trading`);

    this.updateCosts();
  }
  dequeue(item) {
    item = `${item}`;
    if (keyIsDown(CONTROL)) {
      const count = this.#shoppingList.get(item);
      if (count) {
        this.#shoppingList.delete(item);
        this.#listCost -= (this.#trades.get(item)?.cost || 0) * count;
      }
    } else {
      const count = this.#shoppingList.get(item);
      const torem = keyIsDown(SHIFT) ? (this.#trades.get(item)?.stackSize ?? 100) : 1;
      if (count > torem) this.#shoppingList.set(item, count - torem);
      else this.#shoppingList.delete(item);
      this.#listCost -= (this.#trades.get(item)?.cost || 0) * Math.min(torem, count);
    }
  }
  queue(item) {
    item = `${item}`;
    const count = this.#shoppingList.get(item);
    const toadd = keyIsDown(SHIFT) ? (this.#trades.get(item)?.stackSize ?? 100) : 1;
    if (!count) {
      if (this.#shoppingList.size >= tradesPerPage) Log.send("#c-Too many item types in list.");
      else this.#shoppingList.set(item, toadd);
    } else this.#shoppingList.set(item, count + toadd);
    this.#listCost += (this.#trades.get(item)?.cost || 0) * toadd;
  }
}
