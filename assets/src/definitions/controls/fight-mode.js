import { keys } from "../../core/keys.js";
import { ui } from "../../core/ui.js";
import { game } from "../../play/game.js";
import { keybinds } from "./manager.js";

const fight = keybinds.mode("fight");

keybinds.mode("build").shortcut.simple("activate-fight-mode", keys.down, () => {
  if (ui.is("mode", "build")) ui.set("mode", "fight");
  else ui.set("mode", "build");
});

fight.shortcut.simple("swap-weapons", keys[1], () => {
  const l = game.player.entity.leftHand.get(0);
  const r = game.player.entity.rightHand.get(0);
  game.player.entity.leftHand.set(0, r);
  game.player.entity.rightHand.set(0, l);
});
fight.shortcut.simple("swap-weapon-left", keys[2], () => game.player.entity.leftHand.hotkeySlot(0));
fight.shortcut.simple("swap-weapon-right", keys[3], () => game.player.entity.rightHand.hotkeySlot(0));
