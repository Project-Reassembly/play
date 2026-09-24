import { col } from "../../core/color.js";
import { createUIComponent, ui } from "../../core/ui.js";
ui.addReset("debugging:false");

ui.reset();
createUIComponent(
  ["new-game", "ide"],
  [],
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
  .setTextColour(col.accent)
  .setOutlineColour(col.accent);

