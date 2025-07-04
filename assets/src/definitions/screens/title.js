import { createUIComponent } from "../../core/ui.js";
import { gen } from "../../play/game.js";
import { ui } from "../../core/ui.js";
createUIComponent(
  ["title"],
  [],
  0,
  0,
  100,
  50,
  "none",
  () => {
    gen.mode = "create";
    ui.menuState = "in-game";
  },
  "New",
  true,
  30
)
  .setBackgroundColour([0, 0, 0])
  .setOutlineColour([60, 60, 60])
  .setTextColour([230, 170, 0]);

createUIComponent(
  ["title"],
  [],
  0,
  60,
  100,
  50,
  "none",
  () => {
    gen.mode = "load";
    ui.menuState = "in-game";
  },
  "Load",
  true,
  30
)
  .setBackgroundColour([0, 0, 0])
  .setOutlineColour([60, 60, 60])
  .setTextColour([230, 170, 0]);

createUIComponent(
  ["title"],
  [],
  0,
  -140,
  0,
  0,
  "none",
  null,
  ">>> Project: <<<\n< Reassembly >",
  false,
  50
).setTextColour([230, 170, 0]);

let versiongetter = false;
Object.defineProperty(
  createUIComponent(["title"], [], 0, -140, 0, 0, "none", null, "", true, 15)
    .setTextColour([230, 170, 0])
    .anchorBottom(80),
  "text",
  {
    get: () =>
      "<version " +
      gameVersion +
      (isPreview ? "-pre" + preNumber : "") +
      "-js>\n" +
      (versiongetter ? "Reload page, update available" : ""),
  }
);
//update info every 5 hours
setInterval(() => {
  console.log("[v] Checking for update...");
  let oldver = gameVersion;
  let oldpre = preNumber;
  getVer();
  console.log("[v] Got data:");
  if (gameVersion !== oldver || preNumber !== oldpre) {
    console.log("  Update available!");
    versiongetter = true;
  } else {
    console.log("  No update available.");
    versiongetter = false;
  }
  gameVersion = oldver;
  preNumber = oldpre;
}, 18_000_000);
