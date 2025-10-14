import {
  createUIComponent,
  UIComponent,
  createUIImageComponent,
  createUIInventoryComponent,
  createMultilineUIComponent,
  createHealthbarComponent,
} from "../../core/ui.js";
import { Block } from "../../classes/block/block.js";
import { ui } from "../../core/ui.js";
import { deliverPlayer, game, gen, world } from "../../play/game.js";
import { Container } from "../../classes/block/container.js";
import { DroppedItemStack } from "../../classes/item/dropped-itemstack.js";
import { roundNum, shortenedNumber } from "../../core/number.js";
import { Log } from "../../play/messaging.js";
import { totalSize } from "../../scaling.js";
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

//fight mode

createUIComponent(
  ["in-game"],
  [],
  0,
  0,
  400,
  60,
  "trapezium",
  null,
  "",
  true,
  20
).anchorBottom();

Object.defineProperty(
  createMultilineUIComponent(
    ["in-game"],
    ["mode:fight"],
    -85,
    210,
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
  .anchorBottom(55)
  .alignRight();

Object.defineProperty(
  createUIInventoryComponent(
    ["in-game"],
    ["mode:fight"],
    -35,
    250,
    null,
    1,
    1,
    40
  ),
  "inventory",
  {
    get: () => game.player?.leftHand,
  }
).anchorBottom(30);
Object.defineProperty(
  createUIInventoryComponent(
    ["in-game"],
    ["mode:fight"],
    35,
    250,
    null,
    1,
    1,
    40
  ),
  "inventory",
  {
    get: () => game.player?.rightHand,
  }
).anchorBottom(30);

Object.defineProperty(
  createMultilineUIComponent(
    ["in-game"],
    ["mode:fight"],
    60,
    210,
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
).anchorBottom(55);

//fight mode, ammo part
createUIComponent(
  ["in-game"],
  ["mode:fight"],
  0,
  0,
  315,
  60,
  "left",
  null,
  "",
  true,
  20
)
  .anchorRight(-127)
  .rotate(-Math.PI / 2);

createUIComponent(
  ["in-game"],
  ["mode:build"],
  0,
  0,
  315,
  60,
  "left",
  null,
  "",
  true,
  20
)
  .anchorRight(-177)
  .rotate(-Math.PI / 2);

Object.defineProperty(
  createUIInventoryComponent(
    ["in-game"],
    ["mode:fight"],
    0,
    -100,
    null,
    null,
    1
  ),
  "inventory",
  {
    get: () => game.player?.ammo,
  }
).anchorRight(30);

createUIComponent(
  ["in-game"],
  ["mode:fight"],
  0,
  -140,
  0,
  0,
  "none",
  null,
  "Ammo",
  true,
  20
).anchorRight(30);

//build mode
createUIComponent(
  ["in-game"],
  ["mode:build"],
  0,
  0,
  540,
  60,
  "trapezium",
  null,
  "",
  true,
  20
).anchorBottom();

createUIComponent(
  ["in-game"],
  ["mode:fight"],
  0,
  0,
  540,
  60,
  "trapezium",
  null,
  "",
  true,
  20
).anchorBottom(-57);

createUIComponent(
  ["in-game"],
  ["mode:build"],
  315,
  0,
  80,
  50,
  "reverse",
  () => {
    UIComponent.setCondition("menu:inventory");
  }
).anchorBottom();

createUIImageComponent(
  ["in-game"],
  ["mode:build"],
  315,
  0,
  50,
  50,
  null,
  "icon.chest",
  false,
  0.5
).anchorBottom();

createUIComponent(["in-game"], ["mode:build"], -315, 0, 80, 50, "both", () => {
  selectedDirection = keyIsDown(SHIFT)
    ? Block.direction.rotateAntiClockwise(selectedDirection)
    : Block.direction.rotateClockwise(selectedDirection);
}).anchorBottom();

let selectedDirection = Block.direction.UP;
export { selectedDirection };

Object.defineProperties(
  createUIImageComponent(
    ["in-game"],
    ["mode:build"],
    -315,
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
  createUIInventoryComponent(
    ["in-game"],
    ["mode:build"],
    -215,
    250,
    null,
    1,
    10
  ),
  "inventory",
  {
    get: () => game.player?.inventory,
  }
).anchorBottom(30);

//indicators
createUIImageComponent(
  ["in-game"],
  ["mode:build"],
  400,
  0,
  50,
  50,
  () => UIComponent.setCondition("mode:fight"),
  "icon.arrow",
  false,
  0.5
)
  .anchorBottom()
  .rotate(Math.PI / 2);

createUIImageComponent(
  ["in-game"],
  ["mode:fight"],
  400,
  0,
  50,
  50,
  () => UIComponent.setCondition("mode:build"),
  "icon.arrow",
  false,
  0.5
)
  .anchorBottom(-20)
  .rotate(-Math.PI / 2);

//universal
// mone
createUIComponent(["in-game"], [], 0, 0, 100, 40, "left", null, "", true, 20)
  .invert()
  .anchorBottom()
  .anchorRight();
Object.defineProperty(
  createUIComponent(["in-game"], [], 0, 0, 0, 0, "none", null, "", true, 20)
    .anchorTop(20)
    .anchorRight(50),
  "text",
  { get: () => "$" + shortenedNumber(game.money) }
);

Object.defineProperties(
  createUIComponent(
    ["in-game"],
    [],
    10,
    10,
    200,
    0,
    "none",
    null,
    "Name Here",
    true,
    18
  )
    .anchorLeft(40)
    .anchorBottom(75)
    .setBackgroundColour([0, 0, 0]),
  {
    text: { get: () => game.player?.name },
    width: { get: () => textWidth(game.player?.name ?? "e") },
  }
);
Object.defineProperties(
  createUIImageComponent(
    ["in-game"],
    [],
    10,
    10,
    25,
    25,
    null,
    "error",
    false,
    1
  )
    .anchorLeft(10)
    .anchorBottom(65)
    .setBackgroundColour([0, 0, 0]),
  {
    image: {
      get: () =>
        game.player?.registryName.includes("iti")
          ? "icon.iti"
          : game.player?.registryName.includes("peti")
          ? "icon.peti"
          : game.player?.registryName.includes("ccc")
          ? "icon.ccc"
          : "scrap",
    },
  }
);
//healthbar
Object.defineProperties(
  createHealthbarComponent(
    ["in-game"],
    [],
    10,
    10,
    200,
    20,
    "reverse",
    null,
    "HP",
    true,
    15,
    () => game.player,
    [[255, 200, 0]]
  )
    .anchorLeft(50)
    .anchorBottom(10)
    .setBackgroundColour([0, 0, 0]),

  {
    text: {
      get: () =>
        "HP | " +
        roundNum(
          game.player?.health * game.player?.attributes.getValue("health")
        ) +
        "/" +
        roundNum(
          game.player.maxHealth * game.player?.attributes.getValue("health")
        ),
    },
    width: { get: () => width / 5 },
  }
);
//shield bar
Object.defineProperties(
  createHealthbarComponent(
    ["in-game"],
    [],
    10,
    10,
    200,
    20,
    "reverse",
    null,
    "",
    true,
    15,
    () => game.player,
    [[0, 255, 255, 150]]
  )
    .anchorLeft(50)
    .anchorBottom(10)
    .setBackgroundColour([0, 0, 0, 0])
    .setGetters("shield", "_lastMaxShield")
    .setOutlineColour([0, 0, 0, 0]),
  {
    width: { get: () => width / 5 },
    text: {
      get: () =>
        game.player?.shield > 0
          ? "Shield | " +
            roundNum(game.player?.shield) +
            "/" +
            game.player?._lastMaxShield
          : "",
    },
  }
);
//energy bar
Object.defineProperties(
  createHealthbarComponent(
    ["in-game"],
    [],
    10,
    10,
    200,
    20,
    "reverse",
    null,
    "Energy",
    true,
    15,
    () => game.player,
    [
      [100, 255, 255],
      [0, 255, 255],
      [0, 200, 200],
    ]
  )
    .anchorLeft(25)
    .anchorBottom(35)
    .setBackgroundColour([0, 0, 0])
    .setGetters("energy", "maxEnergy"),
  {
    text: {
      get: () =>
        "Energy | " +
        roundNum(game.player?.energy) +
        "/" +
        game.player.maxEnergy,
    },
    width: { get: () => width / 5 },
  }
);

//##############################################################

//                       BOSS BAR

//##############################################################

Object.defineProperties(
  createHealthbarComponent(
    ["in-game"],
    ["boss:yes"],
    10,
    10,
    200,
    20,
    "both",
    null,
    "Boss HP",
    true,
    15,
    () => world.firstBoss(),
    [[255, 0, 0]]
  )
    .anchorTop(10)
    .setBackgroundColour([0, 0, 0]),
  {
    width: { get: () => width * 0.667 },
    text: { get: () => world.firstBoss()?.name },
  }
);
Object.defineProperties(
  createHealthbarComponent(
    ["in-game"],
    ["boss:yes"],
    10,
    10,
    200,
    20,
    "both",
    null,
    "",
    true,
    15,
    () => world.firstBoss(),
    [[0, 255, 255, 150]]
  )
    .anchorTop(10)
    .setBackgroundColour([0, 0, 0, 0])
    .setGetters("shield", "_lastMaxShield")
    .setOutlineColour([0, 0, 0, 0]),
  {
    width: { get: () => width * 0.667 },
    text: {
      get: () =>
        world.firstBoss()?.shield > 0
          ? world.firstBoss().name + " [Shield]"
          : "",
    },
  }
);

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
        Container.selectedBlock.inventory.transfer(
          game.player?.ammo,
          true,
          (ist) => game.player?.ammo?.hasItem(ist.item)
        );
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
        game.player?.ammo.transfer(Container.selectedBlock.inventory);
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
        game.player?.ammo.transfer(
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
createUIComponent(["in-game"], ["menu:inventory"], 230, 0, 360, 500);
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
    game.player?.ammo.transfer(game.player?.inventory, true);
  },
  "Store Ammunition",
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
    game.player?.inventory.transfer(game.player?.ammo, true, (stack) =>
      game.player.ammo.hasItem(stack.item)
    );
  },
  "Refill Ammo",
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
        DroppedItemStack.create(
          stack,
          world,
          game.player?.x,
          game.player?.y,
          5
        ),
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
    -320,
    90,
    null,
    null,
    2
  ),
  "inventory",
  {
    get: () => game.player?.assemblyInventory,
  }
);

createUIComponent(
  ["in-game"],
  ["menu:inventory"],
  -100,
  110,
  250,
  90,
  "none",
  () => game.player?.nextRecipe()
);
Object.defineProperty(
  createMultilineUIComponent(
    ["in-game"],
    ["menu:inventory"],
    -220,
    70,
    0,
    0,
    "none",
    null,
    "txt",
    true,
    20
  ),
  "text",
  {
    get: () => game.player?.getRecipeInfo(),
  }
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
    get: () => game.player?.ammo,
  }
);

createUIImageComponent(
  ["in-game"],
  ["menu:inventory"],
  360,
  -200,
  40,
  40,
  null,
  "icon.bullet",
  false
);

Object.defineProperty(
  createUIInventoryComponent(
    ["in-game"],
    ["menu:inventory"],
    360,
    -72,
    null,
    5,
    1
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
    if (game.money < 1200) return;
    game.money -= 1200;
    Log.send("Spent $1200 on [Basic Respawn]", [80, 200, 80]);
    UIComponent.setCondition("dead:no");
    deliverPlayer(null, totalSize / 2, totalSize / 2, true, false);
  },
  ">> New Player <<\nSend a new robot\nwith the basic\nITI equipment\nto the drop\npoint.\n\n$1200",
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
    UIComponent.setCondition("dead:no");
    deliverPlayer(
      null,
      totalSize / 2,
      totalSize / 2,
      false,
      false,
      "scrap-player"
    );
  },
  ">> Scrap Player <<\nSend a robot\nmade of scrap\nto the drop\npoint.\n\nFree",
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
    if (game.money < 2000) return;
    game.money -= 2000;
    Log.send("Spent $2000 on [Convenience Respawn]", [80, 200, 80]);
    UIComponent.setCondition("dead:no");
    deliverPlayer(null, game.player?.x, game.player?.y, true, false);
  },
  "> Convenience <\n>>> Respawn <<<\nSend a new robot\nwith the basic\nITI equipment\nto the point\nwhere you died.\n\n$2000",
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
