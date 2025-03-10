//##############################################################

//                        INDICATORS

//##############################################################
UIComponent.setCondition("paused:false");
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
UIComponent.setCondition("menu:none");
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
  createUIInventoryComponent(
    ["in-game"],
    [],
    -95,
    250,
    null,
    null,
    5,
    undefined,
    "equipment"
  ),
  "entity",
  {
    get: () => game.player,
  }
).anchorBottom(30);

//Weapon info, if any

Object.defineProperty(
  createMultilineUIComponent(
    ["in-game"],
    [],
    -235,
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
    get: () => game.player.leftHand.get(0)?.getItem()?.getContextualisedInfo(game.player) ?? "",
  }
).anchorBottom(45);
Object.defineProperty(
  createMultilineUIComponent(
    ["in-game"],
    [],
    125,
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
    get: () => game.player.rightHand.get(0)?.getItem()?.getContextualisedInfo(game.player) ?? "",
  }
).anchorBottom(45);

//Selected block
Object.defineProperties(
  createUIInventoryComponent(
    ["in-game"],
    [],
    -35,
    200,
    new Container(),
    null,
    10,
    undefined
  ),
  {
    block: {
      get: () => Container.selectedBlock,
    },
    x: {
      get: () => -width / 2 + 75,
    },
    cols: {
      get: () => Math.floor(width / 100) - 1,
    },
  }
)
  .anchorBottom(95)
  .invert();
Object.defineProperties(
  createUIImageComponent(
    ["in-game"],
    [],
    -35,
    200,
    40,
    40,
    null,
    "error",
    false,
    1
  ),
  {
    image: {
      get: () => Container.selectedBlock?.image || "icon.cross",
    },
    x: {
      get: () => -width / 2 + 25,
    },
  }
).anchorBottom(75);

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
  "entity",
  {
    get: () => game.player,
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
    game.player.inventory.autoStack();
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
    game.player.inventory.sortByRegistryName();
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
    game.player.inventory.sortByCount();
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
    game.player.equipment.transfer(game.player.inventory, true);
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
    game.player.inventory.transfer(game.player.equipment, true);
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
    game.player.inventory.iterate(
      (stack) =>
        DroppedItemStack.create(stack, world, game.player.x, game.player.y, 5),
      true
    );
    game.player.inventory.clear();
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
    5,
    undefined,
    "equipment"
  ),
  "entity",
  {
    get: () => game.player,
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
    2,
    undefined,
    "rightHand"
  ),
  "entity",
  {
    get: () => game.player,
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
    2,
    undefined,
    "leftHand"
  ),
  "entity",
  {
    get: () => game.player,
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
    false
  ),
  "image",
  {
    get: () => game.player?.components[1]?.image ?? "error",
  }
);
