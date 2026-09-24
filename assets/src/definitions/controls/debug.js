import { keys } from "../../core/keys.js";
import { ui } from "../../core/ui.js";
import { mods } from "../../lib/mod-list.js";
import { debug } from "../../play/debug.js";
import { Log } from "../../play/messaging.js";
import { keybinds } from "./manager.js";

let oldm = "build";
keybinds.game.binding("debug-trigger", keys.f3, mods.none, {
  press() {
    if (!ui.is("mode", "debug")) {
      oldm = ui.get("mode");
      ui.set("mode", "debug");
    }
  },
  release() {
    ui.set("mode", oldm ?? "build");
  },
});

const debugKeys = keybinds.mode("debug");

debugKeys.shortcut.simple("debug.hitboxes", keys.b, () => {
  debug.hitboxes = !debug.hitboxes;
  Log.send(`#7-[#@-Debug#7-] Hitboxes ${debug.hitboxes ? "shown" : "hidden"}`);
});
debugKeys.shortcut.simple("debug.ai", keys.a, () => {
  debug.ai = !debug.ai;
  Log.send(`#7-[#@-Debug#7-] AI targets and areas ${debug.ai ? "shown" : "hidden"}`);
});
debugKeys.shortcut.simple("debug.chunk-borders", keys.c, () => {
  debug.chunkBorders = !debug.chunkBorders;
  Log.send(`#7-[#@-Debug#7-] Chunk borders ${debug.chunkBorders ? "shown" : "hidden"}`);
});
debugKeys.shortcut.simple("debug.tools", keys.t, () => {
  ui.set("debug-tools", ui.is("debug-tools", "true") ? "false" : "true");
  Log.send(`#7-[#@-Debug#7-] Debug tools ${ui.is("debug-tools", "true") ? "shown" : "hidden"}`);
});
debugKeys.shortcut.simple("debug.region-borders", keys.r, () => {
  debug.regionBorders = !debug.regionBorders;
  Log.send(`#7-[#@-Debug#7-] Evaluation region borders ${debug.regionBorders ? "shown" : "hidden"}`);
});
debugKeys.shortcut.simple("debug.cursor-position", keys.p, () => {
  debug.position = !debug.position;
  Log.send(`#7-[#@-Debug#7-] Cursor position ${debug.position ? "shown" : "hidden"}`);
});
debugKeys.shortcut.simple("debug.text-blocks", keys.x, () => {
  debug.text = !debug.text;
  Log.send(`#7-[#@-Debug#7-] Text blocks ${debug.text ? "shown" : "hidden"}`);
});
debugKeys.shortcut.simple("debug.dialogue-flags", keys.f, () => {
  debug.flags = !debug.flags;
  Log.send(`#7-[#@-Debug#7-] Dialogue flags ${debug.flags ? "shown" : "hidden"}`);
  game.player.dialogue.forEach(c => c.updateNode());
});
debugKeys.shortcut.simple("debug.disable", keys.escape, () => {
  for (const key in debug) {
    debug[key] = false;
  }
  Log.send(`#7-[#@-Debug#7-] Disabled everything.`);
});

debugKeys.shortcut.simple("debug.help", keys.h, () => {
  Log.send(`#7-[#@-Debug#7-] Shortcut list:`);
  Log.send(` #=-F3+B#-- Toggle hitboxes`);
  Log.send(` #=-F3+A#-- Toggle AI targets/areas`);
  Log.send(` #=-F3+C#-- Toggle chunk borders`);
  Log.send(` #=-F3+R#-- Toggle evaluation regions`);
  Log.send(` #=-F3+P#-- Toggle positions`);
  Log.send(` #=-F3+X#-- Toggle text blocks`);
  Log.send(` #=-F3+F#-- Toggle dialogue flags`);
  Log.send(` #=-F3+T#-- Toggle extra tools (on title screen)`);
  Log.send(` #=-F3+H#-- Show this list`);
  Log.send(` #=-F3+Esc#-- Disable everything`);
});
