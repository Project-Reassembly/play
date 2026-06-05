import { Corporation } from "../../classes/item/corporation.js";
import { ItemStack } from "../../classes/item/item-stack.js";
import * as CMFT from "../../core/cmft.js";
import { col } from "../../core/color.js";
import { constructFromType } from "../../core/constructor.js";
import { CutsceneHandler } from "../../core/cutscene.js";
import { clamp } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import {
  createCustomComponent,
  createMultilineUIComponent,
  createUIComponent,
  createUIImageComponent,
  ui,
  UIComponent,
} from "../../core/ui.js";
import Integrate from "../../lib/integrate.js";
import { drawNeutralBackground, gen } from "../../play/game.js";

export const creation = { corporation: "iti", name: "world name" };

export const newgame_handler = new CutsceneHandler((t) => UIComponent.setCondition(`${t}`));

ui.addReset("ng-stage:cs");

// createUIComponent(["new-game"], [], 0, 0, 0, 0, "none", null, "New Game", false, 50)
//   .anchorTop(120)
//   .setTextColour(col.from(230,170,0,));

createCustomComponent(["new-game"], ["ng-stage:cs"], 0, 0, 0, 0, null, () => {
  newgame_handler.draw();
});

//#region Intro
let t = 0,
  introHeight = 0;
createCustomComponent(["new-game"], ["ng-stage:intro"], 0, 0, 0, 0, null, () => {
  if (t == 108) {
    gen.mode = "create";
    ui.menuState = "in-game";
  } else {
    introHeight = clamp(t - 108, -108, 0) * 10;
    t += 2;
    drawNeutralBackground(introHeight);
  }
});
createUIComponent(
  ["new-game"],
  ["ng-stage:intro"],
  0,
  0,
  0,
  0,
  null,
  null,
  "Preparing...",
  false,
  50,
)
  .define("y", () => introHeight)
  .setTextColour(col.accent);

//#endregion
//#region Corporation
ui.addReset("page:0");

createUIComponent(
  ["new-game"],
  ["ng-stage:corp"],
  0,
  0,
  0,
  0,
  "none",
  null,
  "Where are you from?",
  true,
  30,
)
  .anchorTop(220)
  .setTextColour(col.accent);

function corpsel(
  id,
  name = id,
  descr = "",
  page = 0,
  xOffset = 0,
  nameScale = 1,
  corpcol = col.white,
  // items = [],
  disabled = false,
  player = "",
) {
  createUIComponent(
    ["new-game"],
    ["page:" + page, "ng-stage:corp"],
    xOffset,
    -230,
    450,
    82.5,
    "none",
    null,
    CMFT.Collection.createWrapped(name, Math.ceil(23 / nameScale))
      .text()
      .split("\n")
      .map((x) => "     " + x)
      .join("\n"),
    true,
    24 * nameScale,
  )
    .setBackgroundColour(col.from(0, 0, 0))
    .setOutlineColour(col.from(60, 60, 60))
    .setTextColour(corpcol);
  let pdef = Registries.entities.tryGet(player);
  /**@type {Integrate.Unconstructed<ItemStack>[][]} */
  const i =
    pdef ?
      [pdef.rightHand, pdef.leftHand, pdef.inventory, pdef.ammo, pdef.equipment].map((x) => x ?? [])
    : [];
  createMultilineUIComponent(
    ["new-game"],
    ["page:" + page, "ng-stage:corp"],
    xOffset,
    25,
    450,
    412.5,
    "none",
    null,
    // fuck it we ball
    CMFT.Collection.createWrapped(descr, 35).text() +
      (disabled ? "\n\n🟪WIP, not yet playable."
      : pdef ?
        `\n\n🟨Player Stats:⬜\n🟦 ${pdef.name}⬜\n  ${
          pdef.health ?? 100
        } max health\n  ${pdef.armour ?? 0} armour\n  ${
          pdef.speed ?? 5
        } speed\n🟨Loadout:⬜\n${i.flatMap((i) => i.map((s) => `  ${constructFromType(s, ItemStack).toString(true)}`)).join("\n")}`
      : "\n\n🟥Not playable."),
    true,
    22.5,
  )
    .setBackgroundColour(col.from(0, 0, 0))
    .setOutlineColour(col.from(60, 60, 60))
    .setTextColour(col.from(255, 255, 255));

  createUIImageComponent(
    ["new-game"],
    ["page:" + page, "ng-stage:corp"],
    xOffset - 185,
    -230,
    75,
    75,
    null,
    "icon." + id,
    false,
  );
  if (!disabled)
    createUIComponent(
      ["new-game"],
      ["page:" + page, "ng-stage:corp"],
      xOffset,
      275,
      450,
      70,
      "none",
      () => {
        creation.corporation = id;
      },
      "(Preview)",
      false,
      30,
    )
      .setBackgroundColour(col.from(0, 0, 0))
      .setOutlineColour(col.from(60, 60, 60))
      .setTextColour(corpcol)
      .define("text", () => (creation.corporation === id ? ">> [ Chosen ] <<" : "Choose"));
}

// corpsel(
//   "iti",
//   "InfiniTech\nIndustries",
//   "Large tech company, based on Earth.\n\nDelivers quality products at a fairly affordable price, although some consider them a luxury company.\n\nRun by humans, staffed by constructs.",
//   0,
//   0,
//   1,
//   CMFT.Decoration.colours.i,
//   ["Laser Pistol"],
// );
// corpsel(
//   "peti",
//   "   Prototypical and Experimental\n   Technologies Institution",
//   "",
//   0,
//   -500,
//   0.6,
//   CMFT.Decoration.colours.p,
//   ["Charged Laser Blaster"],
//   true,
// );
// corpsel(
//   "ccc",
//   " Chronological Creations\n Corporation",
//   "A now-independent branch of InfiniTech Industries, focused on space-time manipulation.\nThe self-employed time police.",
//   0,
//   500,
//   0.8,
//   CMFT.Decoration.colours.h,
//   [],
//   true,
// );
// corpsel(
//   "scrap",
//   "United Recyclers\n of Our World",
//   "Stranded on this planet long ago,\ntheir original technology was lost\nto time.\nNow they defend it with\nmakeshift weapons and tools.\n\n🟥Challenge class:⬜\n🟥  - No money, bartering instead⬜\n🟥  - No corporate NPCs⬜\n🟥  - No launch/landing pads⬜",
//   1,
//   0,
//   1,
//   CMFT.Decoration.colours.f,
//   ["Scrap Shooter", "Scrap Bullet x1000"],
//   true,
// );

export function selectors() {
  let xoff = -500,
    p = 0;
  Registries.corps.forEach((c, n) => {
    const crp = constructFromType(c, Corporation);
    corpsel(
      n,
      crp.name,
      crp.description,
      p,
      xoff,
      crp.namescale,
      crp.color,
      // crp.player.map((c) => constructFromType(c, ItemStack).toString(true)),
      !crp.playable,
      crp.player,
    );
    xoff += 500;
    if (xoff > 500) {
      xoff = -500;
      p++;
    }
  });

  if (!(p === 0 || (p === 1 && xoff === -500)))
    for (let i = 0; i <= p; i++)
      createUIComponent(
        ["new-game"],
        ["ng-stage:corp"],
        0,
        (-p / 2 + i) * 100,
        75,
        75,
        "none",
        () => {
          UIComponent.setCondition(`page:${i}`);
        },
        `${i + 1}`,
        true,
        45,
      )
        .anchorRight(50)
        .setBackgroundColour(col.black)
        .setOutlineColour(col.mono(60))
        .setTextColour(col.accent);
}

//#endregion
//#region Confirm

createUIComponent(
  ["new-game"],
  ["ng-stage:corp"],
  0,
  0,
  225,
  75,
  "none",
  () => {
    newgame_handler.show(`corp-${creation.corporation}`);
    UIComponent.setCondition("ng-stage:cs");
  },
  "Confirm",
  true,
  40,
)
  .anchorBottom(110)
  .setBackgroundColour(col.from(0, 0, 0))
  .setOutlineColour(col.from(60, 60, 60))
  .setTextColour(col.from(230, 170, 0));

createUIComponent(
  ["new-game"],
  ["ng-stage:cs"],
  0,
  0,
  225,
  75,
  "none",
  () => {
    newgame_handler.interrupt();
  },
  "Skip",
  true,
  20,
)
  .anchorBottom(110)
  .anchorRight(110)
  .removeBackground()
  .removeOutline()
  .setTextColour(col.from(230, 170, 0));

//#endregion

// gen.mode = "create";
// ui.menuState = "in-game";
