import { Block } from "../../classes/block/block.js";
import { Container } from "../../classes/block/container.js";
import { DroppedItemStack } from "../../classes/item/dropped-itemstack.js";
import { deliverPlayer } from "../../classes/world/events/event-action.js";
import { col } from "../../core/color.js";
import { roundNum, shortenedNumber } from "../../core/number.js";
import {
  createBulletVisualiserComponent,
  createCustomComponent,
  createHealthbarComponent,
  createMultilineUIComponent,
  createUIComponent,
  createUIImageComponent,
  createUIInventoryComponent,
  ui,
  UIComponent
} from "../../core/ui.js";
import { game, gen, world } from "../../play/game.js";
import { Log } from "../../play/messaging.js";
import { Direction, totalSize } from "../../scaling.js";

//##############################################################

//                        INDICATORS

//##############################################################
// damage / low health overlay
createCustomComponent(["in-game"], [], 0, 0, 1920, 1080, null, () => {
  let b = UIComponent.evaluateCondition("mode", "build");
  let intensity = 1 - game.player.entity.health / game.player.entity.maxHealth;
  if (b) intensity *= 0.75;
  if (intensity > 0.5) {
    intensity = (intensity - 0.35) * 2;
    for (let i = 0; i < 5; i++) {
      let f = (frameCount * 0.1 + i) % 5;
      stroke(255, 0, 0, (255 - f * 51) * intensity);
      strokeWeight((5 - f) * 5);
      rect(0, 0, 1930 - f * 45 * intensity, 1090 - f * 45 * intensity);
    }
    stroke(255, 0, 0, 255 * intensity);
    strokeWeight(10 * intensity);
    rect(0, 0, 1920, 1080);
  }
});
// freecam
createCustomComponent(["in-game"], ["fc:true"], 0, 0, 1920, 1080, null, () => {
  let intensity = 0.3;
  for (let i = 0; i < 5; i++) {
    let f = (frameCount * 0.1 + i) % 5;
    stroke(0, 0, 0, (255 - f * 51) * intensity);
    strokeWeight((5 - f) * 2);
    rect(0, 0, 1930 - f * 45 * intensity, 1090 - f * 45 * intensity);
  }
  stroke(255, 0, 0, 255 * intensity);
  strokeWeight(10 * intensity);
  rect(0, 0, 1920, 1080);
});
// pause
createUIComponent(
  ["in-game"],
  ["paused:true"],
  0,
  0,
  225,
  45,
  "both",
  null,
  "Paused",
  true,
  30,
).anchorTop(85);
createUIComponent(["in-game"], ["paused:true"], 0, 0, 847.5, 15, "left", null, "", true, 20)
  .anchorRight()
  .anchorTop(100);
createUIComponent(["in-game"], ["paused:true"], 0, 0, 847.5, 15, "right", null, "", true, 20)
  .anchorLeft()
  .anchorTop(100);
//FPS
createUIComponent(["in-game"], [], 0, 20, 100, 35, "right", null, "[FPS]", true, 20)
  .alignLeft()
  .anchorLeft()
  .anchorTop()
  .define("text", () => Math.round(ui.currentFPS) + " fps");

//##############################################################

//                          HOTBAR

//##############################################################

//fight mode

createUIComponent(["in-game"], [], 0, 0, 530, 90, "trapezium", null, "", true, 20).anchorBottom();

createMultilineUIComponent(
  ["in-game"],
  ["mode:fight"],
  -140,
  210,
  0,
  0,
  "none",
  null,
  "NOTHING",
  true,
  18,
)
  .define(
    "text",
    () =>
      game.player.entity?.leftHand.get(0)?.getItem()?.getContextualisedInfo(game.player.entity) ??
      "",
  )
  .anchorBottom(100)
  .alignRight();

createUIInventoryComponent(["in-game"], ["mode:fight"], -45, 250, null, 1, 1, 55)
  .define("inventory", () => game.player.entity?.leftHand)
  .anchorBottom(45);

createUIInventoryComponent(["in-game"], ["mode:fight"], 45, 250, null, 1, 1, 55)
  .define("inventory", () => game.player.entity?.rightHand)
  .anchorBottom(45);

createMultilineUIComponent(
  ["in-game"],
  ["mode:fight"],
  80,
  210,
  0,
  0,
  "none",
  null,
  "NOTHING",
  true,
  18,
)
  .define(
    "text",
    () =>
      game.player.entity?.rightHand.get(0)?.getItem()?.getContextualisedInfo(game.player.entity) ??
      "",
  )
  .anchorBottom(100);

//fight mode, ammo part
createUIComponent(["in-game"], ["mode:fight"], 0, 0, 400, 80, "left", null, "", true, 20)
  .anchorRight(-155)
  .rotate(-Math.PI / 2);

createUIComponent(["in-game"], ["mode:build"], 0, 0, 400, 80, "left", null, "", true, 20)
  .anchorRight(-227)
  .rotate(-Math.PI / 2);

createUIInventoryComponent(["in-game"], ["mode:fight"], 0, -120, null, null, 1, 50)
  .define("inventory", () => game.player.entity?.ammo)
  .anchorRight(45);

createUIComponent(
  ["in-game"],
  ["mode:fight"],
  0,
  -170,
  0,
  0,
  "none",
  null,
  "Ammo",
  true,
  30,
).anchorRight(45);

//build mode
createUIComponent(
  ["in-game"],
  ["mode:build"],
  0,
  0,
  740,
  75,
  "trapezium",
  null,
  "",
  true,
  20,
).anchorBottom();

createUIComponent(
  ["in-game"],
  ["mode:fight"],
  0,
  0,
  740,
  75,
  "trapezium",
  null,
  "",
  true,
  20,
).anchorBottom(-63);

createUIComponent(["in-game"], ["mode:build"], 420, 0, 80, 50, "reverse", () => {
  if (!UIComponent.evaluateCondition("menu", "inventory"))
    UIComponent.setCondition("menu", "inventory");
  else UIComponent.setCondition("menu", "none");
}).anchorBottom();

createUIImageComponent(
  ["in-game"],
  ["mode:build"],
  420,
  0,
  50,
  50,
  null,
  "icon.chest",
  false,
  0.5,
).anchorBottom();

createUIComponent(["in-game"], ["mode:build"], -420, 0, 80, 50, "both", () => {
  selectedDirection =
    keyIsDown(SHIFT) ?
      Direction.rotateAntiClockwise(selectedDirection)
    : Direction.rotateClockwise(selectedDirection);
}).anchorBottom();

export let selectedDirection = Direction.UP;
export function rotateSelCW() {
  selectedDirection = Direction.rotateClockwise(selectedDirection);
}
export function rotateSelACW() {
  selectedDirection = Direction.rotateAntiClockwise(selectedDirection);
}

createUIImageComponent(["in-game"], ["mode:build"], -420, 0, 50, 50, null, "icon.arrow", false, 0.5)
  .anchorBottom()
  .define("rotation", () => selectedDirection);

createUIInventoryComponent(["in-game"], ["mode:build"], -270, 250, null, 1, 10, 50)
  .define("inventory", () => game.player.entity?.inventory)
  .anchorBottom(37.5);

//indicators
createUIImageComponent(
  ["in-game"],
  ["mode:build"],
  500,
  0,
  50,
  50,
  () => UIComponent.setCondition("mode", "fight"),
  "icon.arrow",
  false,
  0.5,
)
  .anchorBottom()
  .rotate(Math.PI / 2);

createUIImageComponent(
  ["in-game"],
  ["mode:fight"],
  500,
  0,
  50,
  50,
  () => UIComponent.setCondition("mode", "build"),
  "icon.arrow",
  false,
  0.5,
)
  .anchorBottom(-20)
  .rotate(-Math.PI / 2);

//universal
// mone
createUIComponent(["in-game"], [], 0, 0, 150, 60, "left", null, "", true, 20)
  .invert()
  .anchorBottom()
  .anchorRight();
createUIComponent(["in-game"], [], 0, 0, 0, 0, "none", null, "", true, 30)
  .anchorTop(30)
  .anchorRight(75)
  .define("text", () => "$" + shortenedNumber(game.player.money, 2, 4));
// bottom left corner deco
createUIComponent(["in-game"], ["mode:fight"], 0, 0, 100, 150, "right", null, "", true, 20)
  .anchorTop()
  .anchorLeft()
  .invert();
createUIComponent(["in-game"], ["mode:build"], 0, 0, 100, 90, "right", null, "", true, 20)
  .anchorTop()
  .anchorLeft()
  .invert();

createUIComponent(["in-game"], ["mode:fight"], 10, 10, 200, 0, "none", null, "Name Here", true, 30)
  .anchorLeft(60)
  .anchorBottom(145)
  .setBackgroundColour(col.from(0, 0, 0))
  .rotate(-0.1)
  .define("text", () => game.player.entity?.name)
  .define("width", () => textWidth(game.player.entity?.name ?? "e"));

createUIImageComponent(["in-game"], [], 10, 10, 50, 50, null, "error", false, 1)
  .anchorLeft(10)
  .anchorBottom(10)
  .setBackgroundColour(col.from(0, 0, 0))
  .define("image", () => "icon." + game.player.entity.team);

//healthbar
createHealthbarComponent(
  ["in-game"],
  ["mode:fight"],
  10,
  10,
  384,
  30,
  "reverse",
  null,
  "HP",
  true,
  25,
  () => game.player.entity,
  [col.from(255, 200, 0)],
)
  .anchorLeft(75)
  .anchorBottom(50)
  .setBackgroundColour(col.from(0, 0, 0))
  .rotate(-0.1)
  .define("text", () =>
    game.player.entity?.shield > 0 ?
      ""
    : `HP | ${shortenedNumber(game.player.entity?.health * game.player.entity?.attributes.getValue("health"), 2, 4)}/${shortenedNumber(game.player.entity.maxHealth * game.player.entity?.attributes.getValue("health"), 2, 4)}`,
  );
//shield bar
createHealthbarComponent(
  ["in-game"],
  ["mode:fight"],
  10,
  10,
  384,
  30,
  "reverse",
  null,
  "Shield",
  true,
  25,
  () => game.player.entity,
  [],
)
  .anchorLeft(75)
  .anchorBottom(50)
  .rotate(-0.1)
  .removeBackground()
  .removeOutline()
  .setGetters("shield", "_lastMaxShield")
  .define("text", () =>
    game.player.entity?.shield > 0 ?
      "Shield | " +
      shortenedNumber(game.player.entity?.shield, 2, 4) +
      "/" +
      shortenedNumber(game.player.entity?._lastMaxShield, 2, 4)
    : "",
  )
  .define("healthbarColours", () => [game.player.entity?.useYellowShield ? col.yellow : col.cyan]);
//energy bar
createHealthbarComponent(
  ["in-game"],
  ["mode:fight"],
  10,
  10,
  384,
  30,
  "reverse",
  null,
  "Energy",
  true,
  25,
  () => game.player.entity,
  [col.from(0, 255, 255)],
)
  .anchorLeft(50)
  .anchorBottom(100)
  .rotate(-0.1)
  .setBackgroundColour(col.from(0, 0, 0))
  .setGetters("energy", "maxEnergy")
  .define(
    "text",
    () =>
      "Energy | " +
      shortenedNumber(game.player.entity?.energy, 2, 4) +
      "/" +
      shortenedNumber(game.player.entity.maxEnergy, 2, 4),
  );

//build mode energy bar
createHealthbarComponent(
  ["in-game"],
  ["mode:build"],
  10,
  10,
  384,
  30,
  "reverse",
  null,
  "Energy",
  true,
  25,
  () => game.player.entity,
  [col.from(0, 255, 255)],
)
  .anchorLeft(85)
  .anchorBottom(40)
  .setBackgroundColour(col.from(0, 0, 0))
  .setGetters("energy", "maxEnergy")
  .define(
    "text",
    () =>
      "Energy | " +
      shortenedNumber(game.player.entity?.energy, 2, 4) +
      "/" +
      shortenedNumber(game.player.entity.maxEnergy, 2, 4),
  );

//##############################################################

//                       BOSS BAR

//##############################################################

createHealthbarComponent(
  ["in-game"],
  ["boss:yes"],
  10,
  10,
  1280,
  30,
  "both",
  null,
  "Boss HP",
  true,
  25,
  () => world.boss,
  [col.from(255, 0, 0)],
)
  .anchorTop(10)
  .setBackgroundColour(col.from(0, 0, 0))
  .define(
    "text",
    () => `${world.boss.name} | ${roundNum((world.boss.health / world.boss.maxHealth) * 100, 2)}%`,
  );
createHealthbarComponent(
  ["in-game"],
  ["boss:yes"],
  10,
  10,
  1280,
  30,
  "both",
  null,
  "",
  true,
  25,
  () => world.boss,
  [],
)
  .anchorTop(10)
  .setBackgroundColour(col.from(0, 0, 0, 0))
  .setGetters("shield", "_lastMaxShield")
  .setOutlineColour(col.from(0, 0, 0, 0))
  .define("text", () =>
    world.firstBoss()?.shield > 0 ?
      `${world.boss.name} | ${roundNum((world.boss.health / world.boss.maxHealth) * 100, 2)}% [Shield ${roundNum((world.boss.shield / world.boss._lastMaxShield) * 100, 2)}%]`
    : "",
  )
  .define("healthbarColours", () => [world.boss.useYellowShield ? col.yellow : col.cyan]);

//##############################################################

//                       SELECTION

//##############################################################
// Selected block inventory controls
//Yoink all
createUIComponent(
  ["in-game"],
  ["containerselected:true", "mode:build"],
  0,
  0,
  60,
  20,
  "left",
  () => {
    if (Container.selectedBlock instanceof Container) {
      Container.selectedBlock.inventory.transfer(game.player.entity?.ammo, true, (ist) =>
        game.player.entity?.ammo?.hasItem(ist.item),
      );
      Container.selectedBlock.inventory.transfer(game.player.entity?.inventory);
    }
  },
  "Loot",
  true,
  15,
)
  .define("x", () => (Container.selectedBlock?.uiCornerX ?? 0) - 30)
  .define("y", () => (Container.selectedBlock?.uiCornerY ?? 0) + 40);

//Unyoink all
createUIComponent(
  ["in-game"],
  ["containerselected:true", "mode:build"],
  0,
  0,
  60,
  20,
  "left",
  () => {
    if (Container.selectedBlock instanceof Container) {
      game.player.entity?.ammo.transfer(Container.selectedBlock.inventory);
      game.player.entity?.inventory.transfer(Container.selectedBlock.inventory);
    }
  },
  "Store",
  true,
  15,
)
  .define("x", () => (Container.selectedBlock?.uiCornerX ?? 0) - 30)
  .define("y", () => (Container.selectedBlock?.uiCornerY ?? 0) + 15);

//Unyoink present
createUIComponent(
  ["in-game"],
  ["containerselected:true", "mode:build"],
  0,
  0,
  70,
  20,
  "left",
  () => {
    if (Container.selectedBlock instanceof Container) {
      game.player.entity?.ammo.transfer(Container.selectedBlock.inventory, true, (itemstack) =>
        Container.selectedBlock.inventory.hasItem(itemstack.item),
      );
      game.player.entity?.inventory.transfer(Container.selectedBlock.inventory, true, (itemstack) =>
        Container.selectedBlock.inventory.hasItem(itemstack.item),
      );
    }
  },
  "Restock",
  true,
  15,
)
  .define("x", () => (Container.selectedBlock?.uiCornerX ?? 0) - 35)
  .define("y", () => (Container.selectedBlock?.uiCornerY ?? 0) + 65);


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
    UIComponent.setCondition("menu", "none");
  },
  "X",
  false,
  40,
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
  30,
);

createUIInventoryComponent(["in-game"], ["menu:inventory"], -420, -160, null, null, 10).define(
  "inventory",
  () => game.player.entity?.inventory,
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
    game.player.entity?.inventory.autoStack();
  },
  "Stack All",
  true,
  15,
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
    game.player.entity?.inventory.sortByRegistryName();
  },
  "Sort By: Name",
  true,
  15,
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
    game.player.entity?.inventory.sortByCount();
  },
  "Sort By: Count",
  true,
  15,
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
    game.player.entity?.ammo.transfer(game.player.entity?.inventory, true);
  },
  "Store Ammunition",
  true,
  15,
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
    game.player.entity?.inventory.transfer(game.player.entity?.ammo, true, (stack) =>
      game.player.entity.ammo.hasItem(stack.item),
    );
  },
  "Refill Ammo",
  true,
  15,
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
    game.player.entity?.inventory.iterate(
      (stack) =>
        DroppedItemStack.create(stack, world, game.player.entity?.x, game.player.entity?.y, 5),
      true,
    );
    game.player.entity?.inventory.clear();
  },
  "Dump",
  true,
  15,
);

// assembly

createUIInventoryComponent(["in-game"], ["menu:inventory"], -400, 90, null, null, 2).define(
  "inventory",
  () => game.player.entity?.assemblyInventory,
);
createUIInventoryComponent(["in-game"], ["menu:inventory"], -275, 110, null, null, 1).define(
  "inventory",
  () => game.player.entity?.assemblyResult,
);

createMultilineUIComponent(
  ["in-game"],
  ["menu:inventory"],
  -100,
  110,
  250,
  90,
  "none",
  () => game.player.entity?.nextRecipe(),
  "txt",
  true,
  20,
).define("text", () => game.player.entity?.getRecipeInfo());

createHealthbarComponent(
  ["in-game"],
  ["menu:inventory"],
  -100,
  180,
  250,
  20,
  "none",
  null,
  "Progress",
  true,
  15,
  () => game.player.entity,
).setGetters("_progress", "_maxprog");

// ammo invs

createUIInventoryComponent(["in-game"], ["menu:inventory"], 100, -200, null, null, 5).define(
  "inventory",
  () => game.player.entity?.ammo,
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
  false,
);

// extra invs

createUIInventoryComponent(["in-game"], ["menu:inventory"], 360, -72, null, 5, 1).define(
  "inventory",
  () => game.player.entity?.equipment,
);

//90, 25
createUIInventoryComponent(["in-game"], ["menu:inventory"], 90, 25, null, null, 2).define(
  "inventory",
  () => game.player.entity?.rightHand,
);
createUIInventoryComponent(["in-game"], ["menu:inventory"], 300, 25, null, null, 2).define(
  "inventory",
  () => game.player.entity?.leftHand,
);
//Body parts
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
  true,
)
  .rotate(Block.dir.DOWN)
  .define("image", () => game.player.entity?.headPart?.image ?? "error");

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
  true,
)
  .rotate(Block.dir.DOWN)
  .define("image", () => game.player.entity?.bodyPart?.image ?? "error");

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
  true,
)
  .rotate(Block.dir.DOWN)
  .define("image", () => game.player.entity?.legsPart?.image ?? "error");

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
  true,
)
  .rotate(Block.dir.DOWN)
  .invert()
  .define("image", () => game.player.entity?.legsPart?.image ?? "error");

//Held stuff
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
  true,
)
  .rotate(Block.dir.DOWN)
  .invert()
  .define("image", () =>
    game.player.entity ?
      (game.player.entity?.leftHand.get(0)?.getItem()?.component ?? game.player.entity?.armType)
        ?.image
    : "error",
  )
  .define("width", () =>
    game.player.entity ?
      (game.player.entity?.leftHand.get(0)?.getItem()?.component ?? game.player.entity?.armType)
        ?.width * 3.33
    : 0,
  )
  .define("height", () =>
    game.player.entity ?
      (game.player.entity?.leftHand.get(0)?.getItem()?.component ?? game.player.entity?.armType)
        ?.height * 3.33
    : 0,
  );

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
  true,
)
  .rotate(Block.dir.DOWN)
  .define("image", () =>
    game.player.entity ?
      (game.player.entity?.rightHand.get(0)?.getItem()?.component ?? game.player.entity?.armType)
        ?.image
    : "error",
  )
  .define("width", () =>
    game.player.entity ?
      (game.player.entity?.rightHand.get(0)?.getItem()?.component ?? game.player.entity?.armType)
        ?.width * 3.33
    : 0,
  )
  .define("height", () =>
    game.player.entity ?
      (game.player.entity?.rightHand.get(0)?.getItem()?.component ?? game.player.entity?.armType)
        ?.height * 3.33
    : 0,
  );

//##############################################################

//                       DEATH SCREEN

//##############################################################
createUIComponent(["in-game"], ["dead:yes"], 0, 30, 600, 340, "none");
createUIComponent(["in-game"], ["dead:yes"], 0, -170, 700, 60, "both", null, "You Died", false, 50);
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
  20,
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
    if (game.player.money < 1200) return;
    game.player.money -= 1200;
    Log.send("#a-Spent $1200 on [#@-Basic Respawn#a-]");
    UIComponent.setCondition("dead", "no");
    deliverPlayer(
      null,
      totalSize / 2,
      totalSize / 2,
      false,
      game.player.entity.team,
      undefined,
      true,
    );
  },
  ">> New Player <<\nSend a new robot\nwith the basic\ncorp equipment\nto the drop\npoint.\n\n$1200",
  true,
  15,
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
    UIComponent.setCondition("dead", "no");
    deliverPlayer(null, totalSize / 2, totalSize / 2, false, "scrap", undefined, true);
  },
  ">> Scrap Player <<\nSend a robot\nmade of scrap\nto the drop\npoint.\n\nFree",
  true,
  15,
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
    if (game.player.money < 2000) return;
    game.player.money -= 2000;
    Log.send("#a-Spent $2000 on [#@-Convenience Respawn#a-]");
    UIComponent.setCondition("dead", "no");
    deliverPlayer(
      null,
      game.player.entity?.x,
      game.player.entity?.y,
      false,
      game.player.entity.team,
      undefined,
      true,
    );
  },
  "> Convenience <\n>>> Respawn <<<\nSend a new robot\nwith the basic\ncorp equipment\nto the point\nwhere you died.\n\n$2000",
  true,
  15,
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
    ui.menuState = "title";
  },
  "End Game",
  true,
  15,
);
//##############################################################

//                        DOCUMENTATION

//##############################################################
setTimeout(
  () =>
    createBulletVisualiserComponent(
      [
        /* "in-game", "title" */
      ],
      [],
      0,
      0,
      1000,
      400,
      "none",
      null,
      {
        lifetime: 15,
        light: 70,
        direction: 0,
        speed: 20,
        trail: true,
        hitSize: 3,
        // decel: -1,
        trailShape: "rhombus",
        trailColours: [[0, 200, 255, 200]],
        trailLight: 70,
        knockback: 3,
        status: "plasma-burn",
        statusDuration: 360,
        drawer: { shape: "rhombus", fill: [0, 255, 255], width: 12, height: 4, image: false },
        damage: [
          { type: "laser", amount: 20, spread: 5 },
          { amount: 10, spread: 3, radius: 20 },
          {},
          {},
          {},
          {},
        ],
        despawnEffect: "laser-caster-explosion~20",
        fire: {
          damage: 5,
          interval: 10,
          effect: "laser-caster-fire",
          status: "plasma-burn",
          lifetime: 180,
        },
        fires: 1,
        fragNumber: 6,
        fragSpread: 180,
        fragBullet: {
          targetType: "nearest",
          trackingRange: 100,
          light: 50,
          trailLight: 50,
          knockback: 0.5,
          turnSpeed: 20,
          lifetime: 10,
          speed: 10,
          trail: true,
          pierce: 1,
          hitSize: 1.5,
          trailShape: "rhombus",
          status: "plasma-burn",
          statusDuration: 60,
          trailColours: [
            [0, 255, 255, 255],
            [0, 200, 255, 255],
            [0, 0, 255, 100],
          ],
          drawer: {
            shape: "rhombus",
            fill: "cyan", //[0, 255, 255],
            width: 6,
            height: 2,
            image: false,
          },
          damage: [{ type: "laser", amount: 8, spread: 2 }],
          despawnEffect: "laser-caster-frag",
          intervalNumber: 2,
          intervalTime: 4,
          intervalSpacing: 130,
          intervalSpread: 15,
          intervalBullet: {
            speed: 9,
            decel: 0.6,
            lifetime: 12,
            hitSize: 2.5,
            trailColours: [[80, 62, 55, 100]],
            damage: [{ amount: 6, type: "ballistic", spread: 3 }],
            drawer: { shape: "rhombus", fill: "#cd9f8b", width: 6, height: 4, image: false },
            fragNumber: 1,
            fragDirection: 180,
            fragBullet: {
              speed: 0,
              lifetime: 0,
              damage: [{ amount: 6, type: "ballistic", spread: 3 }],
              fragNumber: 4,
              fragSpread: 45,
              fragBullet: {
                lifetime: 30,
                extraUpdates: 29,
                light: 70,
                speed: 10,
                decel: 0.2,
                trail: true,
                hitSize: 3,
                conditionalPierce: true,
                trailShape: "rhombus",
                trailInterval: 4,
                trailColours: [
                  [0, 255, 255],
                  [0, 0, 255, 0],
                ],
                hitEffect: "laser-caster-frag",
                status: "plasma-burn",
                statusDuration: 20,
                trailLife: 30,
                knockback: 1.5,
                drawer: { hidden: true },
                damage: [{ type: "laser", amount: 6 }],
                despawnEffect: "none",
                fragNumber: 1,
                fragBullet: {
                  speed: 0,
                  lifetime: 0,
                  damage: [{ amount: 6, type: "ballistic", spread: 3 }],
                  fragNumber: 4,
                  fragSpread: 45,
                  fragBullet: {
                    lifetime: 30,
                    extraUpdates: 1,
                    light: 70,
                    speed: 10,
                    decel: 0.2,
                    trail: true,
                    hitSize: 3,
                    conditionalPierce: true,
                    trailShape: "rhombus",
                    trailInterval: 4,
                    trailColours: [
                      [0, 255, 255],
                      [0, 0, 255, 0],
                    ],
                    hitEffect: "laser-caster-frag",
                    status: "plasma-burn",
                    statusDuration: 20,
                    trailLife: 30,
                    knockback: 1.5,
                    drawer: { hidden: true },
                    damage: [{ type: "laser", amount: 6 }],
                    despawnEffect: "none",
                  },
                },
                intervalNumber: 10,
                intervalDirection: 135,
                intervalBullet: {
                  lifetime: 30,
                  extraUpdates: 29,
                  light: 70,
                  speed: 10,
                  decel: 0.2,
                  trail: true,
                  hitSize: 3,
                  conditionalPierce: true,
                  trailShape: "rhombus",
                  trailInterval: 4,
                  trailColours: [
                    [0, 255, 255],
                    [0, 0, 255, 0],
                  ],
                  hitEffect: "laser-caster-frag",
                  status: "plasma-burn",
                  statusDuration: 20,
                  trailLife: 30,
                  knockback: 1.5,
                  drawer: { hidden: true },
                  damage: [{ type: "laser", amount: 6 }],
                  despawnEffect: "none",
                },
              },
            },
          },
        },
      },
    ),
  1,
);
