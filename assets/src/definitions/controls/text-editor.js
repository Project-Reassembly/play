import { keys, mods } from "../../core/keys.js";
import { ui } from "../../core/ui.js";
import { exec } from "../../lib/isl/cli.js";
import { ExecutionContext } from "../../lib/isl/core.js";
import { game } from "../../play/game.js";
import { keybinds } from "./_list.js";

let histIndex = 0;
let hist = [];
keybinds.ui.shortcut.simple("open-command-line", keys.slash, () => {
  ui.set("texteditor", "true");
  ui.texteditor.title = "Command Line";
  ui.texteditor.isCommandLine = true;
  ui.texteditor.keyTriggered = true;
  ui.texteditor.save = command => {
    exec(
      command,
      game.player?.entity ? new ExecutionContext(game.player.entity.x, game.player.entity.y, game.player.entity) : new ExecutionContext(0, 0, null),
    );
    hist.unshift(command);
    histIndex = -1;
  };
});
keybinds.texteditor.shortcut.simple("previous-command", keys.up, () => {
  if (ui.texteditor.isCommandLine) {
    let last = hist[++histIndex];
    if (last !== undefined) ui.texteditor.text = last;
    else histIndex--;
  }
});
keybinds.texteditor.shortcut.simple("next-command", keys.down, () => {
  if (ui.texteditor.isCommandLine) {
    let last = hist[--histIndex];
    if (last !== undefined) ui.texteditor.text = last;
    else histIndex++;
  }
});
keybinds.texteditor.shortcut.simple(
  "remove-character",
  keys.backspace,
  () => (ui.texteditor.text = ui.texteditor.text.substring(0, ui.texteditor.text.length - 1)),
);
keybinds.texteditor.shortcut.modified("copy", keys.c, mods.ctrl, () => navigator.clipboard.writeText(ui.texteditor.text));
keybinds.texteditor.shortcut.modified("cut", keys.x, mods.ctrl, () =>
  navigator.clipboard.writeText(ui.texteditor.text).then(x => (ui.texteditor.text = "")),
);
keybinds.texteditor.shortcut.modified("paste", keys.v, mods.ctrl, () =>
  navigator.clipboard.readText(ui.texteditor.text).then(v => (ui.texteditor.text = v)),
);
keybinds.texteditor.shortcut.modified("clear", keys.delete, mods.ctrl, () => (ui.texteditor.text = ""));

keybinds.texteditor.shortcut.simple("close", keys.escape, () => ui.set("texteditor", "false"));
keybinds.texteditor.shortcut.simple("accept", keys.enter, () => ui.endEdit());
