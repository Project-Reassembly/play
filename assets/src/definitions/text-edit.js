import { col } from "../core/color.js";
import { createUIComponent, ui } from "../core/ui.js";

//##############################################################

//                   (BASIC) TEXT EDITOR

//##############################################################
export let cmdHistory = [];
createUIComponent(["in-game"], ["texteditor:true"], 0, 0, 500, 40, "both")
  .anchorBottom(100)
  .define("width", () => {
    textSize(20);
    return Math.max(400, textWidth(ui.texteditor.text) + 100);
  });
createUIComponent(
  ["in-game"],
  ["texteditor:true"],
  0,
  0,
  0,
  40,
  "none",
  null,
  "editor text",
  true,
  20,
)
  .anchorBottom(100)
  .define("text", () => ui.texteditor.text + "_");
createUIComponent(
  ["in-game"],
  ["texteditor:true"],
  0,
  0,
  0,
  40,
  "none",
  null,
  "editor title",
  true,
  20,
)
  .anchorBottom(130)
  .define("text", () => ui.texteditor.title);

// differently styled outside of a game
createUIComponent(
  ["title", "new-game", "database", "ide"],
  ["texteditor:true"],
  0,
  0,
  500,
  40,
  "both",
)
  .anchorBottom(100)
  .setBackgroundColour(col.black)
  .setOutlineColour(col.accent)
  .define("width", () => {
    textSize(20);
    return Math.max(400, textWidth(ui.texteditor.text) + 100);
  });
createUIComponent(
  ["title", "new-game", "database", "ide"],
  ["texteditor:true"],
  0,
  0,
  0,
  40,
  "none",
  null,
  "editor text",
  true,
  20,
)
  .anchorBottom(100)
  .setTextColour(col.accent)
  .define("text", () => ui.texteditor.text + "_");
createUIComponent(
  ["title", "new-game", "database", "ide"],
  ["texteditor:true"],
  0,
  0,
  0,
  40,
  "none",
  null,
  "editor title",
  true,
  20,
)
  .anchorBottom(130)
  .setTextColour(col.accent)
  .define("text", () => ui.texteditor.title);
