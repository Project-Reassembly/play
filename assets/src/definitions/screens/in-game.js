import {
  createUIComponent,
  UIComponent,
  createUIImageComponent,
  createUIInventoryComponent,
  createMultilineUIComponent,
} from "../../core/ui.js";
import { Block } from "../../classes/block/block.js";
import { ui } from "../../core/ui.js";
import {
  createPlayer,
  deliverPlayer,
  game,
  gen,
  world,
} from "../../play/game.js";
import { Container } from "../../classes/block/container.js";
import { DroppedItemStack } from "../../classes/item/dropped-itemstack.js";
import { shortenedNumber } from "../../core/number.js";
import { Log } from "../../play/messaging.js";
import { blockSize, chunkSize, totalSize, worldSize } from "../../scaling.js";
import { World } from "../../classes/world/world.js";
//##############################################################

//                        INDICATORS

//##############################################################
ui.reset();
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    ["paused:true"],
    0,
    0,
    150,
    30,
    "both",
    null,
    "Paused",
    true,
    20
  ),
  "y",
  { get: () => -height / 2 + 50 }
);
Object.defineProperties(
  createUIComponent(
    ["in-game"],
    ["paused:true"],
    0,
    0,
    150,
    15,
    "left",
    null,
    "",
    true,
    20
  ).anchorRight(),
  { y: { get: () => -height / 2 + 50 }, width: { get: () => width / 2 - 75 } }
);
Object.defineProperties(
  createUIComponent(
    ["in-game"],
    ["paused:true"],
    0,
    0,
    150,
    15,
    "right",
    null,
    "",
    true,
    20
  ).anchorLeft(),
  { y: { get: () => -height / 2 + 50 }, width: { get: () => width / 2 - 75 } }
);
//FPS
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    [],
    0,
    20,
    75,
    30,
    "right",
    null,
    "[FPS]",
    true,
    15
  ),
  "text",
  { get: () => Math.round(ui.currentFPS) + " fps" }
)
  .alignLeft()
  .anchorLeft()
  .anchorTop();
//##############################################################

//                          HOTBAR

//##############################################################
createUIComponent(
  ["in-game"],
  [],
  0,
  0,
  500,
  60,
  "trapezium",
  null,
  "",
  true,
  20
).anchorBottom();

createUIComponent(["in-game"], [], 295, 0, 80, 50, "reverse", () => {
  UIComponent.setCondition("menu:inventory");
}).anchorBottom();

createUIImageComponent(
  ["in-game"],
  [],
  295,
  0,
  50,
  50,
  null,
  "icon.chest",
  false,
  0.5
).anchorBottom();

createUIComponent(["in-game"], [], -295, 0, 80, 50, "both", () => {
  selectedDirection = keyIsDown(SHIFT)
    ? Block.direction.rotateAntiClockwise(selectedDirection)
    : Block.direction.rotateClockwise(selectedDirection);
}).anchorBottom();

let selectedDirection = Block.direction.UP;
export { selectedDirection };
Object.defineProperties(
  createUIImageComponent(
    ["in-game"],
    [],
    -295,
    0,
    50,
    50,
    null,
    "icon.arrow",
    false,
    0.5
  ).anchorBottom(),
  {
    rotation: {
      get: () => selectedDirection,
    },
  }
);

Object.defineProperty(
  createUIInventoryComponent(["in-game"], [], -95, 250, null, null, 5),
  "inventory",
  {
    get: () => game.player?.equipment,
  }
).anchorBottom(30);

//Weapon info, if any

Object.defineProperty(
  createMultilineUIComponent(
    ["in-game"],
    [],
    -110,
    230,
    0,
    0,
    "none",
    null,
    "NOTHING",
    true,
    13
  ),
  "text",
  {
    get: () =>
      game.player?.leftHand
        .get(0)
        ?.getItem()
        ?.getContextualisedInfo(game.player) ?? "",
  }
)
  .anchorBottom(45)
  .alignRight();
Object.defineProperty(
  createMultilineUIComponent(
    ["in-game"],
    [],
    110,
    230,
    0,
    0,
    "none",
    null,
    "NOTHING",
    true,
    13
  ),
  "text",
  {
    get: () =>
      game.player?.rightHand
        .get(0)
        ?.getItem()
        ?.getContextualisedInfo(game.player) ?? "",
  }
).anchorBottom(45);

// mone
createUIComponent(
  ["in-game"],
  [],
  0,
  0,
  300,
  40,
  "trapezium",
  null,
  "",
  true,
  20
)
  .invert()
  .anchorBottom();
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    [],
    -100,
    0,
    0,
    0,
    "none",
    null,
    "",
    true,
    20
  ).anchorTop(20),
  "text",
  { get: () => "$" + shortenedNumber(game.money) }
);
//health
createUIComponent(["in-game"], [], 40, 0, 180, 20, "both")
  .anchorTop(10)
  .setBackgroundColour([0, 0, 0]);
Object.defineProperties(
  createUIComponent(["in-game"], [], 100, 0, 0, 20, "both")
    .anchorTop(10)
    .setBackgroundColour([255, 230, 0]),
  {
    width: { get: () => 180 * (game.player?.health / game.player?.maxHealth) },
    x: { get: () => -50 + 90 * (game.player?.health / game.player?.maxHealth) },
  }
);
createUIComponent(
  ["in-game"],
  [],
  0,
  0,
  0,
  0,
  "none",
  null,
  "Integrity",
  true,
  12
).anchorTop(20);
//##############################################################

//                       SELECTION

//##############################################################
// Selected block inventory controls
//Yoink all
Object.defineProperties(
  createUIComponent(
    ["in-game"],
    ["containerselected:true"],
    0,
    0,
    60,
    20,
    "left",
    () => {
      if (Container.selectedBlock instanceof Container) {
        Container.selectedBlock.inventory.transfer(game.player?.equipment);
        Container.selectedBlock.inventory.transfer(game.player?.inventory);
      }
    },
    "Loot",
    true,
    15
  ),
  {
    x: { get: () => (Container.selectedBlock?.uiX ?? 0) - 30 },
    y: { get: () => (Container.selectedBlock?.uiY ?? 0) + 40 },
  }
);
//Unyoink all
Object.defineProperties(
  createUIComponent(
    ["in-game"],
    ["containerselected:true"],
    0,
    0,
    60,
    20,
    "left",
    () => {
      if (Container.selectedBlock instanceof Container) {
        game.player?.equipment.transfer(Container.selectedBlock.inventory);
        game.player?.inventory.transfer(Container.selectedBlock.inventory);
      }
    },
    "Store",
    true,
    15
  ),
  {
    x: { get: () => (Container.selectedBlock?.uiX ?? 0) - 30 },
    y: { get: () => (Container.selectedBlock?.uiY ?? 0) + 15 },
  }
);
//Unyoink present
Object.defineProperties(
  createUIComponent(
    ["in-game"],
    ["containerselected:true"],
    0,
    0,
    70,
    20,
    "left",
    () => {
      if (Container.selectedBlock instanceof Container) {
        game.player?.equipment.transfer(
          Container.selectedBlock.inventory,
          true,
          (itemstack) =>
            Container.selectedBlock.inventory.hasItem(itemstack.item)
        );
        game.player?.inventory.transfer(
          Container.selectedBlock.inventory,
          true,
          (itemstack) =>
            Container.selectedBlock.inventory.hasItem(itemstack.item)
        );
      }
    },
    "Restock",
    true,
    15
  ),
  {
    x: { get: () => (Container.selectedBlock?.uiX ?? 0) - 35 },
    y: { get: () => (Container.selectedBlock?.uiY ?? 0) + 65 },
  }
);
//##############################################################

//                        INVENTORY

//##############################################################
createUIComponent(["in-game"], ["menu:inventory"], -200, 0, 500, 400);
createUIComponent(["in-game"], ["menu:inventory"], 200, 0, 300, 500);
createUIComponent(
  ["in-game"],
  ["menu:inventory"],
  -400,
  -225,
  100,
  50,
  "none",
  () => {
    UIComponent.setCondition("menu:none");
  },
  "X",
  false,
  40
);
createUIComponent(
  ["in-game"],
  ["menu:inventory"],
  -150,
  -225,
  400,
  50,
  "none",
  null,
  "Inventory",
  false,
  30
);

Object.defineProperty(
  createUIInventoryComponent(
    ["in-game"],
    ["menu:inventory"],
    -420,
    -160,
    null,
    null,
    10
  ),
  "inventory",
  {
    get: () => game.player?.inventory,
  }
);

createUIComponent(
  ["in-game"],
  ["menu:inventory"],
  -375,
  -20,
  100,
  30,
  "both",
  () => {
    game.player?.inventory.autoStack();
  },
  "Stack All",
  true,
  15
);

createUIComponent(
  ["in-game"],
  ["menu:inventory"],
  -240,
  -20,
  150,
  30,
  "both",
  () => {
    game.player?.inventory.sortByRegistryName();
  },
  "Sort By: Name",
  true,
  15
);

createUIComponent(
  ["in-game"],
  ["menu:inventory"],
  -80,
  -20,
  150,
  30,
  "both",
  () => {
    game.player?.inventory.sortByCount();
  },
  "Sort By: Count",
  true,
  15
);

createUIComponent(
  ["in-game"],
  ["menu:inventory"],
  -80,
  20,
  150,
  30,
  "both",
  () => {
    game.player?.equipment.transfer(game.player?.inventory, true);
  },
  "Store Equipment",
  true,
  15
);
createUIComponent(
  ["in-game"],
  ["menu:inventory"],
  -240,
  20,
  150,
  30,
  "both",
  () => {
    game.player?.inventory.transfer(game.player?.equipment, true);
  },
  "Equip First",
  true,
  15
);
createUIComponent(
  ["in-game"],
  ["menu:inventory"],
  -375,
  20,
  100,
  30,
  "both",
  () => {
    game.player?.inventory.iterate(
      (stack) =>
        DroppedItemStack.create(stack, world, game.player?.x, game.player?.y, 5),
      true
    );
    game.player?.inventory.clear();
  },
  "Dump",
  true,
  15
);

Object.defineProperty(
  createUIInventoryComponent(
    ["in-game"],
    ["menu:inventory"],
    100,
    -200,
    null,
    null,
    5
  ),
  "inventory",
  {
    get: () => game.player?.equipment,
  }
);

//90, 25
Object.defineProperty(
  createUIInventoryComponent(
    ["in-game"],
    ["menu:inventory"],
    90,
    25,
    null,
    null,
    2
  ),
  "inventory",
  {
    get: () => game.player?.rightHand,
  }
);
Object.defineProperty(
  createUIInventoryComponent(
    ["in-game"],
    ["menu:inventory"],
    300,
    25,
    null,
    null,
    2
  ),
  "inventory",
  {
    get: () => game.player?.leftHand,
  }
);
//Body parts
Object.defineProperty(
  createUIImageComponent(
    ["in-game"],
    ["menu:inventory"],
    195,
    -75,
    100,
    100,
    null,
    "error",
    false,
    1,
    true
  ).rotate(Block.dir.DOWN),
  "image",
  {
    get: () => game.player?.headPart?.image ?? "error",
  }
);
Object.defineProperty(
  createUIImageComponent(
    ["in-game"],
    ["menu:inventory"],
    195,
    25,
    100,
    100,
    null,
    "error",
    false,
    1,
    true
  ).rotate(Block.dir.DOWN),
  "image",
  {
    get: () => game.player?.bodyPart?.image ?? "error",
  }
);
Object.defineProperty(
  createUIImageComponent(
    ["in-game"],
    ["menu:inventory"],
    195,
    125,
    100,
    100,
    null,
    "error",
    false,
    1,
    true
  ).rotate(Block.dir.DOWN),
  "image",
  {
    get: () => game.player?.legsPart?.image ?? "error",
  }
);
Object.defineProperty(
  createUIImageComponent(
    ["in-game"],
    ["menu:inventory"],
    195,
    125,
    100,
    100,
    null,
    "error",
    false,
    1,
    true
  )
    .rotate(Block.dir.DOWN)
    .invert(),
  "image",
  {
    get: () => game.player?.legsPart?.image ?? "error",
  }
);
//Held stuff
Object.defineProperties(
  createUIImageComponent(
    ["in-game"],
    ["menu:inventory"],
    255,
    25,
    100,
    100,
    null,
    "error",
    false,
    1,
    true
  )
    .rotate(Block.dir.DOWN)
    .invert(),
  {
    image: {
      get: () =>
        game.player
          ? (
              game.player?.leftHand.get(0)?.getItem()?.component ??
              game.player?.armType
            )?.image
          : "error",
    },
    width: {
      get: () =>
        game.player
          ? (
              game.player?.leftHand.get(0)?.getItem()?.component ??
              game.player?.armType
            )?.width * 3.33
          : 0,
    },
    height: {
      get: () =>
        game.player
          ? (
              game.player?.leftHand.get(0)?.getItem()?.component ??
              game.player?.armType
            )?.height * 3.33
          : 0,
    },
  }
);
Object.defineProperties(
  createUIImageComponent(
    ["in-game"],
    ["menu:inventory"],
    135,
    25,
    100,
    100,
    null,
    "error",
    false,
    1,
    true
  ).rotate(Block.dir.DOWN),
  {
    image: {
      get: () =>
        game.player
          ? (
              game.player?.rightHand.get(0)?.getItem()?.component ??
              game.player?.armType
            )?.image
          : "error",
    },
    width: {
      get: () =>
        game.player
          ? (
              game.player?.rightHand.get(0)?.getItem()?.component ??
              game.player?.armType
            )?.width * 3.33
          : 0,
    },
    height: {
      get: () =>
        game.player
          ? (
              game.player?.rightHand.get(0)?.getItem()?.component ??
              game.player?.armType
            )?.height * 3.33
          : 0,
    },
  }
);

//##############################################################

//                        TEXT EDITOR

//##############################################################
export let cmdHistory = [];
//Command Line Input
Object.defineProperties(
  createUIComponent(
    ["in-game"],
    ["texteditor:true"],
    0,
    0,
    500,
    40,
    "both"
  ).anchorBottom(100),
  {
    width: {
      get: () => {
        textSize(20);
        return Math.max(400, textWidth(ui.texteditor.text) + 100);
      },
    },
  }
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
    20
  ).anchorBottom(100),
  {
    text: {
      get: () => ui.texteditor.text + "_",
    },
  }
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
    "editor title",
    true,
    20
  ).anchorBottom(130),
  {
    text: {
      get: () => ui.texteditor.title,
    },
  }
);

//##############################################################

//                       DEATH SCREEN

//##############################################################
createUIComponent(["in-game"], ["dead:yes"], 0, 30, 600, 340, "none");
createUIComponent(
  ["in-game"],
  ["dead:yes"],
  0,
  -170,
  700,
  60,
  "both",
  null,
  "You Died",
  false,
  50
);
createUIComponent(
  ["in-game"],
  ["dead:yes"],
  0,
  -100,
  0,
  0,
  "none",
  null,
  "Choose Respawn Option:",
  true,
  20
);
createUIComponent(
  ["in-game"],
  ["dead:yes"],
  -175,
  25,
  150,
  200,
  "none",
  () => {
    if (game.money < 1000) return;
    game.money -= 1000;
    Log.send("Spent $1000 on [Basic Respawn]", [80, 200, 80]);
    UIComponent.setCondition("dead:no");
    deliverPlayer(null, totalSize / 2, totalSize / 2, true, false);
  },
  ">> New Player <<\nSend a new robot\nwith the basic\nscrap equipment\nto the drop\npoint.\n\n$1000",
  true,
  15
);
createUIComponent(
  ["in-game"],
  ["dead:yes"],
  0,
  25,
  150,
  200,
  "none",
  () => {
    if (game.money < 5000) return;
    game.money -= 5000;
    Log.send("Spent $5000 on [Rebuild Respawn]", [80, 200, 80]);
    UIComponent.setCondition("dead:no");
    deliverPlayer(game.player, totalSize / 2, totalSize / 2, true, false);
  },
  ">> Fix Player <<\nRe-send a clone\nof your current\nrobot to the\ndrop point.\n\n$5000",
  true,
  15
);
createUIComponent(
  ["in-game"],
  ["dead:yes"],
  175,
  25,
  150,
  200,
  "none",
  () => {
    if (game.money < 7500) return;
    game.money -= 7500;
    Log.send("Spent $7500 on [Convenience Respawn]", [80, 200, 80]);
    UIComponent.setCondition("dead:no");
    deliverPlayer(game.player, game.player?.x, game.player?.y, true, false);
  },
  "> Convenience <\n>>> Respawn <<<\nSend a new robot\nwith the basic\nscrap equipment\nto the point\nwhere you died.\n\n$7500",
  true,
  15
);
createUIComponent(
  ["in-game"],
  ["dead:yes"],
  0,
  175,
  200,
  30,
  "none",
  () => {
    world.reset();
    game.reset();
    gen.reset();
    ui.reset();
  },
  "End Game",
  true,
  15
);
