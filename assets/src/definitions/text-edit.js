import { col } from "../core/color.js";
import { createUIComponent, ui } from "../core/ui.js";

//##############################################################

//                        TEXT EDITOR

//##############################################################
export let cmdHistory = [];
Object.defineProperties(
  createUIComponent(["in-game"], ["texteditor:true"], 0, 0, 500, 40, "both").anchorBottom(100),
  {
    width: {
      get: () => {
        textSize(20);
        return Math.max(400, textWidth(ui.texteditor.text) + 100);
      },
    },
  },
);
Object.defineProperties(
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
  ).anchorBottom(100),
  { text: { get: () => ui.texteditor.text + "_" } },
);
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

createUIComponent(["new-game"], ["texteditor:true"], 0, 0, 1920, 1080, "none")
  .setBackgroundColour(col.from(0, 0, 0, 200))
  .removeOutline();

createUIComponent(["new-game"], ["texteditor:true"], 0, 0, 500, 40, "both")
  .anchorBottom(100)
  .setBackgroundColour(col.black)
  .setOutlineColour(col.mono(60))
  .define("width", () => {
    textSize(20);
    return Math.max(400, textWidth(ui.texteditor.text) + 100);
  });
Object.defineProperties(
  createUIComponent(
    ["new-game"],
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
    .setTextColour(col.accent),
  { text: { get: () => ui.texteditor.text + "_" } },
);
Object.defineProperties(
  createUIComponent(
    ["new-game"],
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
    .setTextColour(col.accent),
  { text: { get: () => ui.texteditor.title } },
);
