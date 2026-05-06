import * as CMFT from "../../core/cmft.js";
import { col } from "../../core/color.js";
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
  .setTextColour(col.from(255, 170, 0));

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
  .setTextColour(col.from(230, 170, 0));

createUIComponent(
  ["new-game"],
  ["ng-stage:corp"],
  0,
  -20,
  75,
  75,
  "none",
  () => {
    UIComponent.setCondition("page:0");
  },
  "0",
  true,
  45,
)
  .anchorRight(50)
  .setBackgroundColour(col.from(0, 0, 0))
  .setOutlineColour(col.from(60, 60, 60))
  .setTextColour(col.from(230, 170, 0));

createUIComponent(
  ["new-game"],
  ["ng-stage:corp"],
  0,
  80,
  75,
  75,
  "none",
  () => {
    UIComponent.setCondition("page:1");
  },
  "1",
  true,
  45,
)
  .anchorRight(50)
  .setBackgroundColour(col.from(0, 0, 0))
  .setOutlineColour(col.from(60, 60, 60))
  .setTextColour(col.from(230, 170, 0));

function corpsel(
  id,
  name = id,
  descr = "",
  page = 0,
  xOffset = 0,
  nameScale = 1,
  corpcol = col.from(255, 255, 255),
  items = [],
  disabled = false,
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
    name
      .split("\n")
      .map((x) => "     " + x)
      .join("\n"),
    true,
    30 * nameScale,
  )
    .setBackgroundColour(col.from(0, 0, 0))
    .setOutlineColour(col.from(60, 60, 60))
    .setTextColour(corpcol);
  let pdef = Registries.entities.get(id + "-player");
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
      (disabled ? "\n\n🟪Preview, not selectable." :
      `\n\n🟨Player Stats:⬜\n🟦 ${pdef.name}⬜\n  ${
        pdef.health ?? 100
      } max health\n  ${pdef.armour ?? 0} armour\n  ${
        pdef.speed ?? 5
      } speed\n🟨Loadout:⬜${items.map((i) => "\n  " + i)}`),
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
    .define("text", () => (creation.corporation == id ? ">> [ Chosen ] <<" : "Choose"));
}

corpsel(
  "iti",
  "InfiniTech\nIndustries",
  "Large tech company, based on Earth.\n\nDelivers quality products at a fairly affordable price, although some consider them a luxury company.\n\nRun by humans, staffed by constructs.",
  0,
  0,
  1,
  CMFT.Decoration.colours.i,
  ["Laser Pistol"],
);
corpsel(
  "peti",
  "   Prototypical and Experimental\n   Technologies Institution",
  "Small yet growing organisation manufacturing new types of technology.\nThey don't bother testing properly, so their tech may be unstable.\n\nThey have mostly military contracts, although criminal organisations have taken an interest in their tech too.",
  0,
  -500,
  0.6,
  CMFT.Decoration.colours.p,
  ["Charged Laser Blaster"],
  true,
);
corpsel(
  "ccc",
  " Chronological Creations\n Corporation",
  "A now-independent branch of InfiniTech Industries, focused on space-time manipulation.\nThe self-employed time police.",
  0,
  500,
  0.8,
  CMFT.Decoration.colours.h,
  [],
  true,
);
corpsel(
  "scrap",
  "United Recyclers\n of Our World",
  "Stranded on this planet long ago,\ntheir original technology was lost\nto time.\nNow they defend it with\nmakeshift weapons and tools.\n\n🟥Challenge class:⬜\n🟥  - No money, bartering instead⬜\n🟥  - No corporate NPCs⬜\n🟥  - No launch/landing pads⬜",
  1,
  0,
  1,
  CMFT.Decoration.colours.f,
  ["Scrap Shooter", "Scrap Bullet x1000"],
  true,
);

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
