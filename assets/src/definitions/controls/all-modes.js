import { keys } from "../../core/keys.js";
import { ui } from "../../core/ui.js";
import { game, loadGame, saveGame } from "../../play/game.js";
import { keybinds } from "./_list.js";

keybinds.game.shortcut.simple("pause", keys.space, () => {
  if (game.paused) {
    game.paused = false;
    ui.set("paused", "false");
  } else {
    game.paused = true;
    ui.set("paused", "true");
  }
});

keybinds.game.shortcut.simple("toggle-mode", keys.b, () => {
  ui.set("mode", "fight");
});

keybinds.game.shortcut.modified("save", keys.j, { ctrl: true }, saveGame);
keybinds.game.shortcut.modified("load", keys.k, { ctrl: true }, loadGame);

keybinds.game.shortcut.simple("inventory", keys.e, () => {
  if (ui.is("menu", "inventory")) ui.set("menu", "none");
  else ui.set("menu", "inventory");
});
