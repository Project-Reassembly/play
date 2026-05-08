import { col } from "../../core/color.js";
import { createUIComponent, ui } from "../../core/ui.js";
ui.addReset("debugging:false")

ui.reset();

createUIComponent(
  ["title", "new-game", "in-game"],
  ["debugging:true"],
  0,520,1920,20,"none",null,"Waiting for debug action...",true,15
).setBackgroundColour(col.accent).setTextColour(col.black).setOutlineColour(col.black)