import {
  createUIComponent,
} from "../../core/ui.js";
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
