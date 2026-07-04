import { delay } from "../../classes/timer.js";
import * as CMFT from "../../core/cmft.js";
import { col } from "../../core/color.js";
import { rnd } from "../../core/number.js";
import { PreloadRegistries } from "../../core/registry.js";
import {
  createCustomComponent,
  createHealthbarComponent,
  createUIComponent,
  createUIImageComponent,
  ui,
  UIComponent,
} from "../../core/ui.js";
import { gen } from "../../play/game.js";
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

// art bit
createUIImageComponent(["title"], [], 450, -35, 700, 700, null, "icon.dev", true);
createUIComponent(
  ["title"],
  [],
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

// buttons

createUIComponent(["title"], [], -800, -60, 0, 0, "none", null, "", false, 75)
  .setTextColour(col.accent)
  .anchorLeft()
  .alignLeft()
  .define("text", () => ">>>>>>>>>".substring(0, 9 * (1 - fade / 255)));

createUIComponent(
  ["title"],
  ["startable:true"],
  -710,
  -50,
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

createUIComponent(["title"], [], -800, 40, 0, 0, "none", null, "", false, 75)
  .setTextColour(col.accent)
  .anchorLeft()
  .alignLeft()
  .define("text", () => ">>>>>>>>>".substring(0, 9 * (1 - fade / 255)));

createUIComponent(
  ["title"],
  ["startable:true"],
  -710,
  50,
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
Object.defineProperty(globalThis, "f", { get: () => fade });
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
  ["title"],
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
  ["title"],
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
