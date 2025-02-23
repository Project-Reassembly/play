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
    30,
    150,
    60,
    "right",
    null,
    "[FPS]",
    true,
    30
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

createUIComponent(
  ["in-game"],
  [],
  -295,
  0,
  80,
  50,
  "both",
  () => {}
).anchorBottom();

createUIImageComponent(
  ["in-game"],
  [],
  -295,
  0,
  50,
  50,
  null,
  "icon.cross",
  false,
  0.5
).anchorBottom();

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

Object.defineProperties(
  createUIInventoryComponent(
    ["in-game"],
    [],
    -35,
    200,
    new Container(),
    null,
    2,
    undefined
  ),
  {
    block: {
      get: () => Container.selectedBlock,
    },
    x: {
      get: () => 24*Container.selectedBlock?.inventorySize ?? 0
    }
  }
).anchorBottom(95);

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
    game.player.autoStack();
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
    game.player.sortByRegistryName();
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
    game.player.sortByCount();
  },
  "Sort By: Count",
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
