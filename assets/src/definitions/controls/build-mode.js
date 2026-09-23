import { Container } from "../../classes/block/container.js";
import { Inventory } from "../../classes/inventory.js";
import { keys } from "../../core/keys.js";
import { ui } from "../../core/ui.js";
import { game } from "../../play/game.js";
import { Log } from "../../play/messaging.js";
import { deselectItem, discoverable, discovered, refreshDatabaseUI, selectItem } from "../screens/item-database.js";
import { keybinds } from "./_list.js";

const build = keybinds.mode("build");

keybinds.mode("fight").shortcut.simple("activate-build-mode", keys.up, () => {
  ui.set("mode", "build");
});

build.shortcut.simple("cycle-block-config-up", keys.right, () => {
  let block = Container.selectedBlock ?? ui.hoveredBlock;
  if (!block) return;
  block.rightArrow();
});

build.shortcut.simple("cycle-block-config-down", keys.left, () => {
  let block = Container.selectedBlock ?? ui.hoveredBlock;
  if (!block) return;
  block.leftArrow();
});

build.shortcut.modified("open-current-database", keys.slash, { shift: true }, () => {
  if (Inventory.tooltip) {
    // Select hovered item
    const iname = Inventory.tooltip.item.registryName;
    if (discoverable.all.has(iname)) {
      if (discovered.all.has(iname)) {
        ui.menuState = "database";
        ui.set("is-in-game-database", "true");
        refreshDatabaseUI();
        selectItem(iname);
      } else Log.send("#>>icon.database#c-Item not discovered yet");
    } else Log.send("#>>icon.database#c-Item has no database entry");
  } else {
    // just open it
    ui.menuState = "database";
    ui.set("is-in-game-database", "true");
    refreshDatabaseUI();
    deselectItem();
  }
});

build.shortcut.simple("swap-slot-1", keys[1], () => game.player.entity.inventory.hotkeySlot(0));
build.shortcut.simple("swap-slot-2", keys[2], () => game.player.entity.inventory.hotkeySlot(1));
build.shortcut.simple("swap-slot-3", keys[3], () => game.player.entity.inventory.hotkeySlot(2));
build.shortcut.simple("swap-slot-4", keys[4], () => game.player.entity.inventory.hotkeySlot(3));
build.shortcut.simple("swap-slot-5", keys[5], () => game.player.entity.inventory.hotkeySlot(4));
build.shortcut.simple("swap-slot-6", keys[6], () => game.player.entity.inventory.hotkeySlot(5));
build.shortcut.simple("swap-slot-7", keys[7], () => game.player.entity.inventory.hotkeySlot(6));
build.shortcut.simple("swap-slot-8", keys[8], () => game.player.entity.inventory.hotkeySlot(7));
build.shortcut.simple("swap-slot-9", keys[9], () => game.player.entity.inventory.hotkeySlot(8));
build.shortcut.simple("swap-slot-10", keys[0], () => game.player.entity.inventory.hotkeySlot(9));
