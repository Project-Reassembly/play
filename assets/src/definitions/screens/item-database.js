import { discoverable, discovered } from "../../classes/interaction/discoverers.js";
import { Corporation } from "../../classes/item/corporation.js";
import { Item } from "../../classes/item/item.js";
import { PlaceableItem } from "../../classes/item/placeable.js";
import { col } from "../../core/color.js";
import { construct } from "../../core/constructor.js";
import { time } from "../../core/number.js";
import { Registries, TypeRegistries } from "../../core/registry.js";
import { createCMFTComponent, createUIComponent, createUIImageComponent, ui, UIComponent } from "../../core/ui.js";
import { refreshEntityDatabaseUI } from "./entity-database.js";

export function updateItemCollections() {
  discoverable.all.clear();
  discoverable.collections.clear();
  Registries.items.forEach((item, name) => {
    if (item.hidden) return;
    discoverable.all.add(name);
    const corp = item.corp ?? "";
    const current = discoverable.collections.get(corp);
    if (!current) discoverable.collections.set(corp, [name]);
    else current.push(name);
  });
  console.log(`Prepared ${discoverable.all.size} items for discovery, across ${discoverable.collections.size} collections`);
  discovered.deserialise();
  refreshDatabaseUI();
}

export function refreshDatabaseUI() {
  resetCollectionSelectors();
  resetItemSelectors();
}

// TODO: Make this serialise to local storage
// and also the actual database info
// remember the new cmft features

// BACK
ui.addReset("is-in-game-database", "false");
createUIComponent(
  ["database"],
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
  ["database"],
  ["is-in-game-database:false"],
  880,
  -500,
  120,
  40,
  "none",
  () => {
    ui.menuState = "entity-database";
    refreshEntityDatabaseUI();
  },
  "Entities",
  true,
  15,
)
  .setBackgroundColour(col.black)
  .setTextColour(col.accent);
createUIComponent(
  ["database"],
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
createUIComponent(["database"], [], 675, -300, 500, 300, "none")
  .setBackgroundColour(col.black)
  .setOutlineColour(col.accent)
  .setTextColour(col.accent);
createUIComponent(["database"], [], 675, -420, 0, 0, "none", null, "", true, 30)
  .define("text", () => {
    const coll = ui.get("selected-collection");
    return coll === "*" ?
        `All Items (${discovered.all.size}/${discoverable.all.size})`
      : `${coll === "" ? "Generic" : Corporation.aliasof(coll) || coll} Collection (${discovered.collections.get(coll)?.length ?? 0}/${discoverable.collections.get(coll)?.length ?? 0})`;
  })
  .setTextColour(col.accent);

function makeDummyCollections(count) {
  for (let i = 0; i < count; i++) {
    discoverable.collections.set(`dummy-${i}`, []);
  }
  resetCollectionSelectors();
}
globalThis.dummycol = makeDummyCollections;
/** @type {UIComponent[]} */
const csels = [];
function resetCollectionSelectors() {
  let px = 460,
    py = -365;
  csels.forEach(s => ui.disconnect(s));
  csels.splice(0);
  for (const [name, coll] of discoverable.collections) {
    csels.push(
      createUIImageComponent(
        ["database"],
        [],
        px,
        py,
        50,
        50,
        function () {
          if (ui.is("selected-collection", name)) {
            ui.set("selected-collection", "*");
            csels.forEach(s => s.setOutlineColour(col.accent));
            resetItemSelectors();
            return;
          }
          ui.set("selected-collection", name);
          csels.forEach(s => s.setOutlineColour(col.mono(60)));
          this.setOutlineColour(col.accent);
          resetItemSelectors();
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
      console.error("Too many item collections to display in database- max 32");
      break;
    }
  }
  console.log(
    `Added ${Math.min(discoverable.collections.size, 32)} collections ${discoverable.collections.size > 32 ? `(of ${discoverable.collections.size} defined) ` : ""}to database`,
  );
}
// ITEM SELECTOR
ui.addReset("selected-item", "");
createUIComponent(["database"], [], 675, 150, 500, 600, "none").setBackgroundColour(col.black).setOutlineColour(col.accent).setTextColour(col.accent);

/** @type {UIComponent[]} */
const isels = [];
let pages = 0;
function resetItemSelectors() {
  ui.set("item-database-page", "0");
  let px = 460,
    py = -115,
    page = 0;
  isels.forEach(s => ui.disconnect(s));
  isels.splice(0);
  const coll = ui.get("selected-collection");
  const collection = coll === "*" ? discoverable.all : (discoverable.collections.get(coll) ?? []);
  for (const iname of collection) {
    const found = discovered.all.has(iname);
    const def = Registries.items.get(iname);
    isels.push(
      found ?
        createUIImageComponent(
          ["database"],
          [`item-database-page:${page}`],
          px,
          py,
          50,
          50,
          function () {
            ui.set("selected-item", iname);
            isels.forEach(s => s.setOutlineColour(col.mono(60)));
            this.setOutlineColour(col.accent);
            const corp = def?.corp ?? "";
            updateDescrPanels(
              def?.name ?? iname,
              corp,
              Corporation.colorof(corp) || Item.getColourFromRarity(def?.rarity ?? 0),
              def?.image ?? "error",
              construct(def, "item"),
              def,
            );
          },
          def.image ?? "error",
        ).setOutlineColour(col.mono(60))
      : createUIImageComponent(["database"], [`item-database-page:${page}`], px, py, 50, 50, null, "icon.question").setOutlineColour(col.mono(60)),
    );
    px += 60;
    if (px > 880) {
      px = 460;
      py += 60;
    }
    if (py > -115 + 60 * 9) {
      px = 460;
      py = -115;
      page++;
    }
  }
  pages = page;
}

export function selectItem(iname) {
  const def = Registries.items.get(iname);
  ui.set("selected-item", iname);
  isels.forEach(s => s.setOutlineColour(col.mono(60)));
  const corp = def?.corp ?? "";
  updateDescrPanels(
    def?.name ?? iname,
    corp,
    Corporation.colorof(corp) || Item.getColourFromRarity(def?.rarity ?? 0),
    def?.image ?? "error",
    construct(def, "item"),
    def,
  );
}
export function deselectItem() {
  ui.set("selected-item", "");
  isels.forEach(s => s.setOutlineColour(col.mono(60)));
  updateDescrPanels();
}
createUIComponent(["database"], [], 675, 420, 0, 0, "none", null, "", true, 30)
  .define("text", () => `Page ${+ui.get("item-database-page") + 1}/${pages + 1}`)
  .setTextColour(col.accent);
createUIComponent(
  ["database"],
  [],
  455,
  420,
  30,
  30,
  "none",
  () => {
    const current = +ui.get("item-database-page");
    if (current > 0) ui.set("item-database-page", current - 1);
  },
  "<",
  true,
  30,
)
  .setBackgroundColour(col.black)
  .setOutlineColour(col.accent)
  .setTextColour(col.accent);
createUIComponent(
  ["database"],
  [],
  890,
  420,
  30,
  30,
  "none",
  () => {
    const current = +ui.get("item-database-page");
    if (current < pages) ui.set("item-database-page", current + 1);
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
createUIImageComponent(["database"], [], -890, -380, 185, 185, null, "icon.database.large", false)
  .setBackgroundColour(col.black)
  .define("image", () => stages[Math.floor((discovered.all.size * 3) / discoverable.all.size)]);
createUIComponent(["database"], [], -890, -380, 0, 0, "none", null, "", true, 30)
  .setBackgroundColour(col.black)
  .setTextColour(col.white)
  .define("text", () => `${Math.round((discovered.all.size / discoverable.all.size) * 100)}%`);

// DETAIL VIEWER

createUIComponent(["database"], [], -200, 0, 1200, 900).setBackgroundColour(col.black).setOutlineColour(col.accent);
// deselect
function close() {
  updateDescrPanels();
  ui.set("selected-item", "");
  isels.forEach(c => c.setOutlineColour(col.mono(60)));
}
let c_close = createUIImageComponent(["database"], [], 360, -412, 40, 40, null, "icon.cross").setOutlineColour(col.mono(60));
// name
let c_name = createCMFTComponent(["database"], [], -200, -420, 1180, 50, "none", null, "", 40)
  .removeBackground()
  .removeOutline()
  .setTextColour(col.accent);
// descr
let c_desc = createCMFTComponent(["database"], [], -475, -275, 600, 200, "none", null, "", 20)
  .removeBackground()
  .setOutlineColour(col.accent)
  .setTextColour(col.white);
// techy descr
let c_tech = createCMFTComponent(["database"], [], 115, -275, 530, 200, "none", null, "", 20)
  .removeBackground()
  .setOutlineColour(col.accent)
  .setTextColour(col.white);
// basic detail
let c_norm = createCMFTComponent(["database"], [], 115, 135, 530, 580, "none", null, "", 20)
  .removeBackground()
  .setOutlineColour(col.accent)
  .setTextColour(col.white);
// details
let c_ext = createCMFTComponent(["database"], [], -475, 135, 600, 580, "none", null, "", 20)
  .removeBackground()
  .setOutlineColour(col.accent)
  .setTextColour(col.white);

function updateDescrPanels(
  name = "",
  corp = "",
  rarity = col.accent,
  image = "error",
  /** @type {Item?} */ item = null,
  /** @type {Integrate.Unconstructed<Item>?} */ uncon = null,
) {
  if (!item) {
    c_norm.text = c_tech.text = c_ext.text = "";
    c_name.text = "#-b       <<       Block/Item Database        >>";
    c_desc.text = "#a-Select some content#-- to view its details!";
    c_close.setOutlineColour(col.mono(60));
    c_close.press = null;
    c_close.interactive = false;
    return;
  }
  c_close.setOutlineColour(col.accent);
  c_close.press = close;
  c_close.interactive = true;

  c_name.text = `[#>>${image}#--] #@b${name}#--`;
  c_name.rarityColour = rarity;

  const color = "#" + col.hex(Corporation.colorof(corp) || col.white);
  const icolor = Registries.images.tryGet(image)?.color || col.white;
  let s = `#abStandard Details#a-\n------------------------------------------
#>>icon.database#=-Collection:${corp ? `#[${Corporation.colorof(corp)}]- ${Corporation.aliasof(corp)}` : `#-- Generic`}
#=-Maximum Stack Size:#-- ${item.stackSize}
#a-Average Sell Value:#-- \$${shortenedNumber(item.marketValue, 4, 4, false)}
#a-Stack Sell Value:#-- \$${shortenedNumber(item.marketValue * item.stackSize, 4, 4, false)}
#=-Rarity:#-- ${corp ? `#@-${Corporation.aliasof(corp)}#--/#[${Item.getColourFromRarity(item.rarity)}]-${item.rarity}` : `#@-${item.rarity}`}
${corp ? `#=-Manufacturer:#-- #[${Corporation.colorof(corp)}]-${Corporation.nameof(corp)}` : "#=-No Set Manufacturer"}
`;
  if (item instanceof PlaceableItem) {
    const block = item.getBlock();
    if (block) {
      s += `\n#3bBlock Equivalent\n------------------------------------------\n#r-Technical Information:\n #>>icon.int#n-Type:#-- ${block.type ?? "block"} #=-(#e-${TypeRegistries.default.get(block.type ?? "block").name}#=-)\n #n-Registry Name:#-- ${item.registryName}\n\n#=-Basic Information:\n #c-${block.health ?? 100}#-- health\n`;
      if (block.armour) {
        s += ` #6-${block.armour}#-- armour\n`;
        if (block.armourToughness) s += `  (#g-${block.armourToughness}#-- toughness)\n`;
      }
      if (block.shield) s += ` #i-${block.shield ?? 0}#-- initial shield\n`;
      if (block.shieldRating) s += ` #b-${block.shieldRating}#-- shield rating\n`;
      if (block.maxPower) {
        s += ` #e-${shortenedNumber(block.maxPower)}#-- max power\n`;
        if (block.powerDraw)
          s += ` #e-${shortenedNumber(block.powerDraw * 60)}/s#-- power use #=-(#h-${time(block.maxPower / block.powerDraw)}#-- off-grid time#=-)\n`;
      }
    } else s += `\n#c-Block [${item.block}] failed to load (are you missing a mod?)`;
  }
  if (item.details) s += `\n#7i${item.details}`;
  c_norm.text = s;
  c_norm.rarityColour = rarity;

  c_tech.text = `#rbTechnical Details#r-\n------------------------------------------
#>>icon.int#n-Type:#-- ${item.type ?? "item"} #=-(#e-${item.constructor.name}#=-)
#n-Registry Name:#-- ${item.registryName}
#=-Corporation/Team ID:${corp ? ` #>>${Corporation.iconof(corp)}#--#[${Corporation.colorof(corp)}]-${corp}` : "#=- none"}
#l-Name/Image Colour:#[${color}]- \\${color} #--/ #[${col.withA(icolor, 255)}]-\\#${col.hex(icolor)}
#r-Image Name:#-- ${image}`;

  c_desc.text = "#=bDescription#=-\n-----------------------------------------------\n#--" + uncon.description ?? "<no description provided>";
  c_ext.text =
    "#ibExtended Details#i-\n-----------------------------------------------\n#--"
    + (item.createExtendedDetails() || "<no additional information provided>");
}
updateDescrPanels();

globalThis.discoverall = () => discovered.discover(...discoverable.all);
