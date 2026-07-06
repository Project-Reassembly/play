import { delay } from "../../classes/timer.js";
import * as CMFT from "../../core/cmft.js";
import { col } from "../../core/color.js";
import { rnd } from "../../core/number.js";
import { PreloadRegistries } from "../../core/registry.js";
import {
  createCMFTComponent,
  createCustomComponent,
  createHealthbarComponent,
  createUIComponent,
  createUIImageComponent,
  ui,
  UIComponent,
} from "../../core/ui.js";
import { gen } from "../../play/game.js";
import { refreshDatabaseUI } from "./database.js";
import { newgame_handler } from "./new-game.js";
// black screen
let fade = 0;
ui.addReset("startable:true");
// title
createUIImageComponent(
  ["title"],
  [],
  0,
  -350,
  609,
  138,
  null,
  "title.project.accent",
  false,
  1,
  true,
).anchorLeft(60);

createUIComponent(["title"], [], 0, -250, 0, 0, "none", null, ">> REASSEMBLY", true, 75)
  .anchorLeft(60)
  .alignLeft()
  .setTextColour(col.mono(140)).font = "something";

ui.addReset("title-side", "welcome");
// side area
createUIImageComponent(["title"], ["title-side:art"], 450, -35, 700, 700, null, "icon.dev", true);
createUIComponent(
  ["title"],
  ["title-side:art"],
  450,
  300,
  0,
  0,
  "none",
  null,
  "[[ Insert artwork here ]]",
  true,
  30,
).setTextColour(col.accent);

createCMFTComponent(
  ["title"],
  ["title-side:welcome"],
  450,
  -35,
  700,
  700,
  "none",
  null,
  `                        #@bWelcome!#@-
========================================================
#--If this is your first time playing, check out the 
#@-controls menu#-- on the right --------------------------->#--

After that, #@-start a new game#-- with the buttons on the left.

The #>>icon.database#@-database#-- will populate over time as you get more items, and provides information beyond what you normally see in-game.
`,
  20,
)
  .setBackgroundColour(col.black)
  .setOutlineColour(col.accent)
  .setTextColour(col.white);

createCMFTComponent(
  ["title"],
  ["title-side:controls"],
  450,
  -35,
  700,
  700,
  "none",
  null,
  `                       #@bControls#@-
========================================================
#@bGeneral#@-
--------------------------------------------------------
#a-W/A/S/D#--        Move up/left/down/right
#@iHold #d-Alt#--       Move the camera without the player
#@iHold #d-Ctrl#--      Use a separate UI cursor
#a-B#--              Toggle #@-build/fight mode#--
#a-E#--              Toggle #@-inventory#--
#d-Ctrl#@-+#i-Scroll#--    Zoom the camera in/out
#a-Space#--          Pause/unpause the game
#i-LMB#@i with item#--  Throw item
#a-?#@i over item#--    Open database to item page

#@bFight Mode#@-
--------------------------------------------------------
#a-Up Arrow#--       Switch to #@-build mode#--
#i-LMB#--            Fire right-hand weapon
#i-RMB#--            Fire left-hand weapon
#@iHold #i-LMB#--       Charge right-hand attack
#@iHold #i-RMB#--       Charge left-hand attack
#d-Shift#@-+#i-LMB#--      Alternate-fire right-hand weapon
#d-Shift#@-+#i-RMB#--      Alternate-fire left-hand weapon

#@bBuild Mode#@-
--------------------------------------------------------
#a-Down Arrow#--     Switch to #@-fight mode#--.
#i-LMB#@i with item#--  Place item as block
#i-RMB#@i over block#-- Deconstruct block
#i-RMB#@i with item#--  Drop item stack
#a-Right Arrow#--    Cycle to next crafter recipe
#a-Left Arrow#--     Cycle to previous crafter recipe
#i-Scroll#--         Rotate block to place
#a-1/2/#@-...#a-/8/9/0#--  Swap held item with inventory slot
`,
  20,
)
  .setBackgroundColour(col.black)
  .setOutlineColour(col.accent)
  .setTextColour(col.white);

createUIImageComponent(
  ["title"],
  [],
  850,
  -300,
  50,
  50,
  () => UIComponent.setCondition("title-side", "controls"),
  "icon.controls",
  true,
).setOutlineColour(col.mono(60));
createUIImageComponent(
  ["title"],
  [],
  850,
  -230,
  50,
  50,
  () => UIComponent.setCondition("title-side", "art"),
  "icon.edit",
  true,
).setOutlineColour(col.mono(60));

// buttons

createUIComponent(["title"], [], -800, -110, 0, 0, "none", null, "", false, 75)
  .setTextColour(col.accent)
  .anchorLeft()
  .alignLeft()
  .define("text", () => ">>>>>>>>>".substring(0, 9 * (1 - fade / 255)));

createUIComponent(
  ["title"],
  ["startable:true"],
  -710,
  -100,
  300,
  75,
  "none",
  () => {
    UIComponent.setCondition("startable", "false");
    ui.timer.repeat((i) => (fade = i * 4), 64);
    ui.timer.do(() => {
      fade = 0;
      ui.menuState = "new-game";
      newgame_handler.show("start");
    }, 64);
  },
  "New Game",
  true,
  40,
)
  .setBackgroundColour(col.from(0, 0, 0))
  .setOutlineColour(col.from(60, 60, 60))
  .setTextColour(col.accent);

createUIComponent(["title"], [], -800, -10, 0, 0, "none", null, "", false, 75)
  .setTextColour(col.accent)
  .anchorLeft()
  .alignLeft()
  .define("text", () => ">>>>>>>>>".substring(0, 9 * (1 - fade / 255)));

createUIComponent(
  ["title"],
  ["startable:true"],
  -710,
  0,
  300,
  75,
  "none",
  () => {
    UIComponent.setCondition("startable", "false");
    ui.timer.repeat((i) => (fade = i * 4), 64);
    ui.timer.do(() => {
      fade = 0;
      gen.mode = "load";
      ui.menuState = "in-game";
    }, 64);
  },
  "Load Game",
  true,
  40,
)
  .setBackgroundColour(col.from(0, 0, 0))
  .setOutlineColour(col.from(60, 60, 60))
  .setTextColour(col.accent);

createUIComponent(["title"], [], -800, 90, 0, 0, "none", null, "", false, 75)
  .setTextColour(col.accent)
  .anchorLeft()
  .alignLeft()
  .define("text", () => ">>>>>>>>>".substring(0, 9 * (1 - fade / 255)));

createUIComponent(
  ["title"],
  ["startable:true"],
  -710,
  100,
  300,
  75,
  "none",
  () => {
    UIComponent.setCondition("startable", "false");
    refreshDatabaseUI();
    ui.menuState = "database";
  },
  "  Database",
  true,
  40,
)
  .setBackgroundColour(col.from(0, 0, 0))
  .setOutlineColour(col.from(60, 60, 60))
  .setTextColour(col.accent);

createUIImageComponent(
  ["title"],
  ["startable:true"],
  -820,
  100,
  75,
  75,
  () => {
    UIComponent.setCondition("startable", "false");
    resetItemSelectors();
    resetColl();
    ui.menuState = "database";
  },
  "icon.database",
  false,
);

// tools

createUIComponent(
  ["title"],
  ["debug-tools:true"],
  -800,
  240,
  0,
  0,
  "none",
  null,
  ">>>>>>>>>",
  false,
  75,
)
  .setTextColour(col.accent)
  .anchorLeft()
  .alignLeft();

ui.addReset("debug-tools:false");

createUIComponent(
  ["title"],
  ["debug-tools:true"],
  -860,
  250,
  125,
  75,
  "none",
  () => {
    ui.menuState = "ide";
  },
  "Entity\nScripter",
  true,
  20,
)
  .setBackgroundColour(col.from(0, 0, 0))
  .setOutlineColour(col.from(60, 60, 60))
  .setTextColour(col.accent);

// helpline

createUIComponent(["title"], [], 0, 0, 0, 0, "none", null, "Project Helpline", true, 20)
  .setTextColour(col.accent)
  .anchorBottom(170)
  .anchorLeft(120);

createUIComponent(["title"], [], 0, 0, 1515, 60, "none", null, "", true, 20)
  .setTextColour(col.from(255, 255, 255))
  .anchorBottom(90)
  .anchorLeft(20)
  .setBackgroundColour(col.from(0, 0, 0))
  .setOutlineColour(col.accent);

createCustomComponent(["title"], [], 0, 0, 0, 0, null, () => {
  let drawer = tips[tip];
  if (drawer) {
    drawer.draw(-930, 400, col.white, col.accent);
  }
});

let tip = 0;
/** @type {CMFT.Drawer[]} */
let tips = [];
export async function setupTips() {
  tips = (await CMFT.Loader.drawer("assets/src/definitions/tips.scmft", 20, 123)).map((c) =>
    c.noBG(),
  );
  tip = rnd.idx(tips);

  randomiseTips();
}
async function randomiseTips() {
  while (true) {
    tip++;
    if (tip > tips.length) tip = 0;
    const t = tips[tip];
    await delay(t?.width * 10 ?? 0);
  }
}

createUIComponent(["title"], [], 0, 0, 200, 50, "none", checkUpdate, "", true, 20)
  .setTextColour(col.accent)
  .anchorBottom(100)
  .anchorRight(80)
  .removeOutline()
  .removeBackground()
  .define(
    "text",
    () =>
      `<version ${gameVersion}${isPreview ? `-pre${preNumber}` : ""}-js>${versiongetter ? "\nReload page, update available" : ""}`,
  );

createUIComponent(["title"], [], 0, 0, 1920, 1080).define("backgroundColour", () => fade);
//update info every day
setInterval(checkUpdate, 86_400_000);

UIComponent.setCondition("show-load", "true");
export const loadStats = {
  totalImages: PreloadRegistries.images.size,
  totalCutscenes: PreloadRegistries.cutscenes.size,
  images: 0,
  cutscenes: 0,
  hide() {
    UIComponent.setCondition("show-load", "false");
  },
};
createUIComponent(["title"], ["show-load:true"], 0, 0, 1920, 1080).setBackgroundColour(150);
createHealthbarComponent(
  ["title", "new-game", "ide", "database", "in-game"],
  ["show-load:true"],
  0,
  -20,
  1000,
  20,
  "both",
  null,
  "Loading images...",
  true,
  15,
  loadStats,
).setGetters("images", "totalImages");
createHealthbarComponent(
  ["title", "new-game", "ide", "database", "in-game"],
  ["show-load:true"],
  0,
  20,
  1000,
  20,
  "both",
  null,
  "Loading cutscenes...",
  true,
  15,
  loadStats,
).setGetters("cutscenes", "totalCutscenes");
