import { keys, mods } from "../../core/keys.js";
import { ui } from "../../core/ui.js";
import { game, loadGame, saveGame } from "../../play/game.js";
import { keybinds } from "./manager.js";

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
  if (ui.is("mode", "build")) ui.set("mode", "fight");
  else ui.set("mode", "build");
});

keybinds.game.shortcut.modified("save", keys.j, { ctrl: true }, saveGame);
keybinds.game.shortcut.modified("load", keys.k, { ctrl: true }, loadGame);

keybinds.game.shortcut.simple("inventory", keys.e, () => {
  if (ui.is("menu", "inventory")) ui.set("menu", "none");
  else ui.set("menu", "inventory");
});

keybinds.game.binding("freecam", keys.alt, mods.none, {
  press() {
    ui.set("fc", "true");
  },
  release() {
    ui.set("fc", "false");
  },
});

keybinds.game.control.modified("move-up", keys.w, mods.ignore, () => ui.is("fc", "true") && (ui.camera.y -= 5));
keybinds.game.control.modified("move-down", keys.s, mods.ignore, () => ui.is("fc", "true") && (ui.camera.y += 5));
keybinds.game.control.modified("move-left", keys.a, mods.ignore, () => ui.is("fc", "true") && (ui.camera.x -= 5));
keybinds.game.control.modified("move-right", keys.d, mods.ignore, () => ui.is("fc", "true") && (ui.camera.x += 5));
