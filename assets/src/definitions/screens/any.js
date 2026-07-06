import { col } from "../../core/color.js";
import { createUIComponent, ui } from "../../core/ui.js";
ui.addReset("debugging:false");

ui.reset();
createUIComponent(
  ["new-game", "ide", "database"],
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
createUIComponent(
  ["title", "new-game", "in-game", "ide", "database"],
  ["debugging:true"],
  0,
  520,
  1920,
  20,
  "none",
  null,
  "",
  true,
  15,
)
  .define(
    "text",
    () =>
      `${ui.menuState
        .split("-")
        .map((x) => x[0].toUpperCase() + x.substring(1))
        .join(" ")} | Waiting for debug action...`,
  )
  .setBackgroundColour(col.accent)
  .setTextColour(col.black)
  .setOutlineColour(col.black);
