import { keys } from "../../core/keys.js";
import { ui } from "../../core/ui.js";
import { keybinds } from "./manager.js";

keybinds.ui.shortcut.simple("close-any", keys.escape, () => {
  if (!ui.is("menu", "none")) ui.set("menu", "none");
});
