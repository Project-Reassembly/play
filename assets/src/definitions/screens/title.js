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

Object.defineProperty(
  createUIComponent(
    ["title"],
    [],
    0,
    -140,
    500,
    50,
    "none",
    checkUpdate,
    "",
    true,
    15
  )
    .setTextColour([230, 170, 0])
    .anchorBottom(80)
    .setBackgroundColour([0, 0, 0, 0])
    .setOutlineColour([0, 0, 0, 0]),
  "text",
  {
    get: () =>
      "<version " +
      gameVersion +
      (isPreview ? "-pre" + preNumber : "") +
      "-js>" +
      (versiongetter ? "\nReload page, update available" : ""),
  }
);
//update info every hour
setInterval(checkUpdate, 3_600_000);
