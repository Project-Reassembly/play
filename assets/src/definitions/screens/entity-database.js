import { Entity } from "../../classes/entity/entity.js";
import { EquippedEntity } from "../../classes/entity/inventory-entity.js";
import { Player } from "../../classes/entity/player.js";
import { discoverableEntities, discoveredEntities } from "../../classes/interaction/discoverers.js";
import { InteractableEntity } from "../../classes/interaction/interactable-entity.js";
import { TradingManager } from "../../classes/interaction/trading.js";
import { Corporation } from "../../classes/item/corporation.js";
import { ItemStack } from "../../classes/item/item-stack.js";
import { Item } from "../../classes/item/item.js";
import { col } from "../../core/color.js";
import { construct, constructFromType } from "../../core/constructor.js";
import { time } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { createCMFTComponent, createUIComponent, createUIImageComponent, ui, UIComponent } from "../../core/ui.js";
import { refreshDatabaseUI } from "./item-database.js";

export function updateEntityCollections() {
  discoverableEntities.all.clear();
  discoverableEntities.teams.clear();
  Registries.entities.forEach((entity, name) => {
    if (entity.hidden) return;
    const team = entity.team;
    if (team && !Corporation.get(team)) return;
    discoverableEntities.all.add(name);
    const current = discoverableEntities.teams.get(team);
    if (!current) discoverableEntities.teams.set(team, [name]);
    else current.push(name);
  });
  console.log(`Prepared ${discoverableEntities.all.size} entities for discovery, across ${discoverableEntities.teams.size} teams`);
  discoveredEntities.deserialise();
  refreshEntityDatabaseUI();
}

export function refreshEntityDatabaseUI() {
  resetEntityTeamSelectors();
  resetEntitySelectors();
}

// BACK
createUIComponent(
  ["entity-database"],
  ["is-in-game-database:false"],
  -880,
  -500,
  120,
  40,
  "none",
  () => {
    ui.menuState = "title";
    ui.reset();
  },
  "< Back  ",
  true,
  15,
)
  .setBackgroundColour(col.black)
  .setTextColour(col.accent);
createUIComponent(
  ["entity-database"],
  ["is-in-game-database:false"],
  880,
  -500,
  120,
  40,
  "none",
  () => {
    ui.menuState = "database";
    refreshDatabaseUI();
  },
  "  Items ",
  true,
  15,
)
  .setBackgroundColour(col.black)
  .setTextColour(col.accent);
createUIComponent(
  ["entity-database"],
  ["is-in-game-database:true"],
  -880,
  -500,
  120,
  40,
  "none",
  () => {
    ui.menuState = "in-game";
  },
  "< Back  ",
  true,
  15,
)
  .setBackgroundColour(col.black)
  .setTextColour(col.accent);

// COLLECTION SELECTOR
ui.addReset("selected-collection", "*");
createUIComponent(["entity-database"], [], 675, -300, 500, 300, "none")
  .setBackgroundColour(col.black)
  .setOutlineColour(col.accent)
  .setTextColour(col.accent);
createUIComponent(["entity-database"], [], 675, -420, 0, 0, "none", null, "", true, 30)
  .define("text", () => {
    const coll = ui.get("selected-collection");
    return coll === "*" ?
        `All Entities (${discoveredEntities.all.size}/${discoverableEntities.all.size})`
      : `${coll === "" ? "Generic" : Corporation.aliasof(coll) || coll} (${discoveredEntities.teams.get(coll)?.length ?? 0}/${discoverableEntities.teams.get(coll)?.length ?? 0})`;
  })
  .setTextColour(col.accent);

function makeDummyEntityTeams(count) {
  for (let i = 0; i < count; i++) {
    discoverableEntities.teams.set(`dummy-${i}`, []);
  }
  resetEntityTeamSelectors();
}
globalThis.dummycol = makeDummyEntityTeams;
/** @type {UIComponent[]} */
const csels = [];
function resetEntityTeamSelectors() {
  let px = 460,
    py = -365;
  csels.forEach(s => ui.disconnect(s));
  csels.splice(0);
  for (const [name, coll] of discoverableEntities.teams) {
    csels.push(
      createUIImageComponent(
        ["entity-database"],
        [],
        px,
        py,
        50,
        50,
        function () {
          if (ui.is("selected-collection", name)) {
            ui.set("selected-collection", "*");
            csels.forEach(s => s.setOutlineColour(col.accent));
            resetEntitySelectors();
            return;
          }
          ui.set("selected-collection", name);
          csels.forEach(s => s.setOutlineColour(col.mono(60)));
          this.setOutlineColour(col.accent);
          resetEntitySelectors();
        },
        name === "" ? "icon.interaction" : Corporation.iconof(name),
      )
        .setBackgroundColour(col.black)
        .setOutlineColour(col.accent),
    );
    px += 60;
    if (px > 880) {
      px = 460;
      py += 60;
    }
    if (py > -185) {
      console.error("Too many entity teams to display in database - max 32");
      break;
    }
  }
  console.log(
    `Added ${Math.min(discoverableEntities.teams.size, 32)} teams ${discoverableEntities.teams.size > 32 ? `(of ${discoverableEntities.teams.size} defined) ` : ""}to database`,
  );
}
// ITEM SELECTOR
ui.addReset("selected-entity", "");
createUIComponent(["entity-database"], [], 675, 150, 500, 600, "none")
  .setBackgroundColour(col.black)
  .setOutlineColour(col.accent)
  .setTextColour(col.accent);

/** @type {UIComponent[]} */
const isels = [];
let pages = 0;
function resetEntitySelectors() {
  ui.set("entity-database-page", "0");
  let px = 478,
    py = -95,
    page = 0;
  isels.forEach(s => ui.disconnect(s));
  isels.splice(0);
  const coll = ui.get("selected-collection");
  const teamEntities = coll === "*" ? discoverableEntities.all : (discoverableEntities.teams.get(coll) ?? []);
  for (const iname of teamEntities) {
    const found = discoveredEntities.all.has(iname);
    const def = Registries.entities.get(iname),
      entity = construct(def, "entity");
    isels.push(
      found ?
        createUIImageComponent(
          ["entity-database"],
          [`item-database-page:${page}`],
          px,
          py,
          88,
          88,
          function () {
            ui.set("selected-entity", iname);
            isels.forEach(s => s.setOutlineColour(col.mono(60)));
            this.setOutlineColour(col.accent);
            const team = def?.team ?? "";
            updateEntityDescrPanels(def?.name ?? iname, team, Corporation.colorof(team), entity, def);
          },
          entity.uiImage,
        ).setOutlineColour(col.mono(60))
      : createUIImageComponent(["entity-database"], [`item-database-page:${page}`], px, py, 88, 88, null, "icon.question").setOutlineColour(
          col.mono(60),
        ),
    );
    px += 98;
    if (px > 880) {
      px = 478;
      py += 98;
    }
    if (py > 425) {
      px = 478;
      py = -95;
      page++;
    }
  }
  pages = page;
}

export function selectEntity(iname) {
  const def = Registries.entities.get(iname);
  ui.set("selected-entity", iname);
  isels.forEach(s => s.setOutlineColour(col.mono(60)));
  updateEntityDescrPanels(def?.name ?? iname, def?.team, Corporation.colorof(team), construct(def, "entity"), def);
}
export function deselectEntity() {
  ui.set("selected-entity", "");
  isels.forEach(s => s.setOutlineColour(col.mono(60)));
  updateEntityDescrPanels();
}
createUIComponent(["entity-database"], [], 675, 420, 0, 0, "none", null, "", true, 30)
  .define("text", () => `Page ${+ui.get("entity-database-page") + 1}/${pages + 1}`)
  .setTextColour(col.accent);
createUIComponent(
  ["entity-database"],
  [],
  455,
  420,
  30,
  30,
  "none",
  () => {
    const current = +ui.get("entity-database-page");
    if (current > 0) ui.set("entity-database-page", current - 1);
  },
  "<",
  true,
  30,
)
  .setBackgroundColour(col.black)
  .setOutlineColour(col.accent)
  .setTextColour(col.accent);
createUIComponent(
  ["entity-database"],
  [],
  890,
  420,
  30,
  30,
  "none",
  () => {
    const current = +ui.get("entity-database-page");
    if (current < pages) ui.set("entity-database-page", current + 1);
  },
  ">",
  true,
  30,
)
  .setBackgroundColour(col.black)
  .setOutlineColour(col.accent)
  .setTextColour(col.accent);

const stages = ["icon.database.large", "icon.database.one-third", "icon.database.two-thirds", "icon.database.complete"];
// PROGRESS
createUIImageComponent(["entity-database"], [], -890, -380, 185, 185, null, "icon.database.large", false)
  .setBackgroundColour(col.black)
  .define("image", () => stages[Math.floor((discoveredEntities.all.size * 3) / discoverableEntities.all.size)]);
createUIComponent(["entity-database"], [], -890, -380, 0, 0, "none", null, "", true, 30)
  .setBackgroundColour(col.black)
  .setTextColour(col.white)
  .define("text", () => `${Math.round((discoveredEntities.all.size / discoverableEntities.all.size) * 100)}%`);

// DETAIL VIEWER

createUIComponent(["entity-database"], [], -200, 0, 1200, 900).setBackgroundColour(col.black).setOutlineColour(col.accent);
// deselect
function close() {
  updateEntityDescrPanels();
  ui.set("selected-entity", "");
  isels.forEach(c => c.setOutlineColour(col.mono(60)));
}
let c_close = createUIImageComponent(["entity-database"], [], 360, -412, 40, 40, null, "icon.cross").setOutlineColour(col.mono(60));
// name
let c_name = createCMFTComponent(["entity-database"], [], -200, -420, 1180, 50, "none", null, "", 40)
  .removeBackground()
  .removeOutline()
  .setTextColour(col.accent);
// descr
let c_desc = createCMFTComponent(["entity-database"], [], -475, -275, 600, 200, "none", null, "", 20)
  .removeBackground()
  .setOutlineColour(col.accent)
  .setTextColour(col.white);
// techy descr
let c_tech = createCMFTComponent(["entity-database"], [], 115, -275, 530, 200, "none", null, "", 20)
  .removeBackground()
  .setOutlineColour(col.accent)
  .setTextColour(col.white);
// basic detail
let c_detail_right = createCMFTComponent(["entity-database"], [], 115, 135, 530, 580, "none", null, "", 20)
  .removeBackground()
  .setOutlineColour(col.accent)
  .setTextColour(col.white);
// details
let c_detail_left = createCMFTComponent(["entity-database"], [], -475, 135, 600, 580, "none", null, "", 20)
  .removeBackground()
  .setOutlineColour(col.accent)
  .setTextColour(col.white);

function updateEntityDescrPanels(
  name = "",
  corp = "",
  rarity = col.accent,
  /** @type {Entity?} */ entity = null,
  /** @type {Integrate.Unconstructed<Entity>?} */ uncon = null,
) {
  if (!entity) {
    c_detail_right.text = c_tech.text = c_detail_left.text = "";
    c_name.text = "#-b       <<         Entity Database          >>";
    c_desc.text = "#a-Select some content#-- to view its details!";
    c_close.setOutlineColour(col.mono(60));
    c_close.press = null;
    c_close.interactive = false;
    return;
  }
  c_close.setOutlineColour(col.accent);
  c_close.press = close;
  c_close.interactive = true;

  c_name.text = `[#>>${entity.uiImage}#--] #@b${name}#--`;
  c_name.rarityColour = rarity || col.accent;

  const color = "#" + col.hex(Corporation.colorof(corp) || col.white);
  const icolor = Registries.images.tryGet(entity.uiImage)?.color || col.white;
  let s = `#abStandard Details#a-\n-----------------------------------------------
${Corporation.get(corp) ? `#=-Affiliation:#-- #[${Corporation.colorof(corp)}]-${Corporation.nameof(corp)}` : "#=-No Corporate Affiliation"}

#=-Defensive Capability:
 #c-${entity.health ?? 100}#-- health
`;

  if (entity.armour) {
    s += ` #6-${entity.armour}#-- armour\n`;
    if (entity.armourToughness) s += `  (#g-${entity.armourToughness}#-- toughness)\n`;
  }
  if (entity.shield) s += ` #i-${entity.shield ?? 0}#-- initial shield\n`;
  if (entity.shieldRating) s += ` #b-${entity.shieldRating}#-- shield rating\n`;
  if (entity instanceof Player) {
    s += `\n#=-Power Information:\n #e-${shortenedNumber(entity.maxPower)}#-- max power\n #e-${shortenedNumber(entity.passivePowerUse * 60)}/s#-- passive power use #=-(#h-${time(entity.maxPower / entity.passivePowerUse)}#-- off-grid time#=-)\n #e-${shortenedNumber(entity.assemblerPowerUse * 60)}/s#-- assembler power use #=-(#h-${time(entity.maxPower / entity.assemblerPowerUse, 1)}#-- off-grid time#=-)\n`;
  }

  c_detail_left.text = s;
  c_detail_left.rarityColour = rarity;

  c_tech.text = `#rbTechnical Details#r-\n------------------------------------------
#>>icon.int#n-Type:#-- ${entity.type ?? "entity"} #=-(#e-${entity.constructor.name}#=-)
#n-Registry Name:#-- ${entity.registryName}
#=-Corporation/Team ID:${corp ? ` #>>${Corporation.iconof(corp)}#--#[${Corporation.colorof(corp)}]-${corp}` : "#=- none"}
#l-(Team/UI) Colour:#[${color}]- \\${color} #--/ #[${col.withA(icolor, 255)}]-\\#${col.hex(icolor)}
#r-Image Name:#-- ${entity.uiImage}`;

  c_desc.text = "#=bDescription#=-\n-----------------------------------------------\n#--" + uncon.description ?? "<no description provided>";
  let edt = "#ibAdditional Details#i-\n------------------------------------------\n#--";

  if (entity instanceof EquippedEntity) {
    const lh = entity.leftHand.get(0),
      rh = entity.rightHand.get(0),
      acc = entity.equipment.storage,
      inv = entity.inventory.storage,
      ammo = entity.ammo.storage;
    let dt = "";
    const wlh = willShow(lh),
      wrh = willShow(rh);
    if (wlh || wrh) {
      dt += "#=-Weapons:\n";
      if (wlh) dt += ` #e-Left Arm: ${itemLine(lh)}\n`;
      if (wrh) dt += ` #e-Right Arm: ${itemLine(rh)}\n`;
    }
    if (acc && acc.some(v => willShow(v))) {
      dt += `#=-Accessories:\n`;
      for (const a of acc) {
        if (!willShow(a)) continue;
        dt += ` ${itemLine(a)}\n`;
      }
    }
    if (ammo && ammo.some(v => willShow(v))) {
      dt += `#=-Ammunition:\n`;
      for (const m of ammo) {
        if (!willShow(m)) continue;
        dt += ` ${itemLine(m)}\n`;
      }
    }
    if (inv && inv.some(v => willShow(v))) {
      dt += `#=-Inventory:\n`;
      for (const i of inv) {
        if (!willShow(i)) continue;
        dt += ` ${itemLine(i)}\n`;
      }
    }
    if (dt) edt += dt;
    else edt += "#=-No Items\n";
  }

  if (entity instanceof InteractableEntity) {
    edt += "\n";
    if (uncon.reactions) edt += "#=-Reacts to environment\n";
    if (uncon.dialogue) edt += "#=-Can be talked to\n";
    if (uncon.trades) {
      edt += "#=-Can be traded with:\n";
      const trader = constructFromType({ trades: uncon.trades }, TradingManager),
        cx = +uncon.tradeCostX ?? 1;
      for (const [item, info] of trader.currentTrades) {
        edt += ` ${itemLine(new ItemStack(item))}#e- for #a-\$${shortenedNumber((Registries.items.get(item)?.marketValue ?? 0) * cx)}\n`;
      }
    }
  }
  c_detail_right.text = edt;

  if (entity instanceof Player) c_name.text += ` #=-[#a-Player#=-]`;
  if (entity.isBoss) c_name.text += ` #=-[#c-Boss#=-]`;

  if (uncon.details) c_detail_left.text += `\n#7i${uncon.details}`;
}
function willShow(istk) {
  return !!(istk && istk.getItem());
}
/** @param {ItemStack} istk  */
function itemLine(istk) {
  const item = istk.getItem();
  return item ?
      `#e-${
        istk.min !== undefined && istk.max !== undefined ? `${istk.min}-${istk.max} `
        : istk.count > 1 ? `${istk.count} `
        : ""
      }#>>${item.image}#[${coli(item)}]-${item.name}${istk.dropChance !== 1 ? ` #c-(${istk.dropChance * 100}% drop)` : ""}`
    : "";
}
function coli(item) {
  return Corporation.colorof(item.corp) || Item.getColourFromRarity(item.rarity);
}

updateEntityDescrPanels();

globalThis.discoverallentities = () => discoveredEntities.discover(...discoverableEntities.all);
globalThis.forgetallentities = () => {
  discoveredEntities.all.clear();
  discoveredEntities.serialise();
};
