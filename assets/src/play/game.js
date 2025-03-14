const game = {
  saveslot: 1,
  //Control type
  control: "keyboard",
  /** @type {Player | null} Player entity */
  player: null,
  paused: false,
  get mouse() {
    return {
      x: ui.lastMousePos.x / ui.camera.zoom + ui.camera.x,
      blockX: Math.floor(
        (ui.lastMousePos.x / ui.camera.zoom + ui.camera.x) / Block.size
      ),
      y: ui.lastMousePos.y / ui.camera.zoom + ui.camera.y,
      blockY: Math.floor(
        (ui.lastMousePos.y / ui.camera.zoom + ui.camera.y) / Block.size
      ),
    };
  },
};
const world = new World();
const contentScale = 1;
let worldSize = Block.size * Chunk.size * World.size;
const borders = () => [0, 0, worldSize, worldSize];
let preloadTicks = 100;
let timePerFrame = 1000 / 60;
let framesToDraw = 0;
//Generation
let generationStarted = false;
let generating = false;
let genMsg = "Generating World...";
let genProgress = 0;
let genStageProgress = 0;
//
let freecam = false;
let freecamReturn = 0;
let camDiff = { x: 0, y: 0 };

if (!window.Worker) {
  const errmsg =
    "This browser does not support Web Workers; World generation cannot proceed.";
  console.error(errmsg);
  Log.send(errmsg, [255, 0, 0]);
}
/** @type {Worker | null} */
let worldGenWorker = null;
try {
  worldGenWorker = new Worker("assets/src/worker/generator.js", {
    name: "[World Gen]",
  });
} catch (error) {
  console.error("Could not create worker:", error);
  Log.send("World generation could not be started.", [255, 0, 0]);
}
let createdChunks = [[]];
let waitingForWorker = false;
//
let fonts = {};

//Worldgen analysis
let stats = {
  placed: Object.create(null),
  total: 0,
  failed: 0,
  structures: Object.create(null),
  structs: 0,
};

worldGenWorker.onmessage = (ev) => {
  if (ev.data === "finish") {
    console.log("Generation finished.");
    genMsg = "Entering World";
    createPlayer();
    ui.camera.x = game.player.x;
    ui.camera.y = game.player.y;
    for (let tick = 0; tick < preloadTicks; tick++) world.tickAll();
    generating = false;
    worldGenWorker.terminate();
    //Worldgen stats
    let log = "\n";
    stats.total = Object.values(stats.placed).reduce((a, b) => a + b, 0);
    stats.structs = Object.values(stats.structures).reduce((a, b) => a + b, 0);
    log += "\n#### WORLD GENERATED ####";
    log += "\n//// World Breakdown ////";
    log += "\n--- Tiles and Blocks: ---";
    for (let key in stats.placed) {
      let val = stats.placed[key];
      log +=
        "\n| " +
        key +
        ": " +
        val +
        " (" +
        roundNum((val / stats.total) * 100, 2) +
        "%)";
    }
    log += "\n" + stats.total + " total blocks";
    log +=
      "\n" +
      stats.failed +
      " failed placements (" +
      roundNum((stats.failed / stats.total) * 100, 2) +
      "%)";
    log += "\n------ Structures: ------";
    for (let key in stats.structures) {
      let val = stats.structures[key];
      log += "\n| " + key + ": " + val;
    }
    log += "\n" + stats.structs + " total structures";
    log += "\n-------------------------";
    log += "\n#########################";

    console.log(log);
  } else if (typeof ev.data === "object") {
    if (ev.data.type === "genstage") {
      genMsg = ev.data.stage;
    }
    if (ev.data.type === "progress") {
      genProgress = ev.data.progress;
    }
    if (ev.data.type === "progress-stage") {
      genStageProgress = ev.data.progress;
    }
    if (ev.data.type === "chunk") {
      let def = ev.data.def;
      let chunk = new Chunk();
      for (let tile of def.chunk) {
        //Create block, and overwrite properties
        try {
          Object.assign(
            chunk.addBlock(tile.block, tile.x, tile.y, "tiles"),
            def.construction ?? {}
          );

          stats.placed[tile.block] ??= 0;
          stats.placed[tile.block]++;
        } catch (e) {
          console.warn("Worldgen Error:\n" + e);
          stats.failed++;

          stats.placed["(" + tile.block + ")"] ??= 0;
          stats.placed["(" + tile.block + ")"]++;
        }
      }
      chunk.world = world;
      chunk.x = def.i;
      chunk.y = def.j;
      world.chunks[def.j][def.i] = chunk;
    }
    if (ev.data.type === "build") {
      let def = ev.data.def;
      let successful = true;
      for (let block of def.blocks) {
        //Create block, and overwrite properties
        if (
          world.isPositionFree(ev.data.x + block.x, ev.data.y + block.y) &&
          (!ev.data.target ||
            world.getBlock(
              ev.data.x + block.x,
              ev.data.y + block.y,
              "tiles"
            ) === ev.data.target)
        )
          try {
            Object.assign(
              world.placeAt(
                block.block,
                ev.data.x + block.x,
                ev.data.y + block.y,
                ev.data.layer ?? "blocks"
              ),
              def.construction ?? {}
            );

            stats.placed[block.block] ??= 0;
            stats.placed[block.block]++;
          } catch (e) {
            console.warn("Worldgen Error:\n" + e);
            successful = false;
            stats.failed++;

            stats.placed["(" + block.block + ")"] ??= 0;
            stats.placed["(" + block.block + ")"]++;
          }
      }
      stats.structures[
        successful ? ev.data.name : "(" + ev.data.name + ")"
      ] ??= 0;
      stats.structures[successful ? ev.data.name : "(" + ev.data.name + ")"]++;
    }
    if (ev.data.type === "place") {
      if (
        (ev.data.layer !== "blocks" ||
          world.isPositionFree(ev.data.x, ev.data.y)) &&
        (!ev.data.target ||
          world.getBlock(ev.data.x, ev.data.y, "tiles") === ev.data.target)
      )
        try {
          Object.assign(
            world.placeAt(ev.data.block, ev.data.x, ev.data.y, ev.data.layer),
            ev.data.construction ?? {}
          );

          stats.placed["[Ore] " + ev.data.block] ??= 0;
          stats.placed["[Ore] " + ev.data.block]++;
        } catch (e) {
          console.warn("Worldgen Error:\n" + e);
          stats.failed++;

          stats.placed["[Ore] (" + ev.data.block + ")"] ??= 0;
          stats.placed["[Ore] (" + ev.data.block + ")"]++;
        }
    }
  }
};

worldGenWorker.onerror = (ev) => {
  let errmsg =
    "[World Gen] Error: \n" +
    ev.message +
    "\n - in " +
    ev.filename +
    " at " +
    ev.lineno +
    ":" +
    ev.colno;
  console.error(errmsg);
  if (ev instanceof Event) ev.preventDefault();
  Log.send(errmsg, [255, 0, 0]);
};

worldGenWorker.onmessageerror = (ev) => {
  console.warn("Message could not be deserialised.");
};

async function preload() {
  Registry.images.forEachAsync((name, el) => el.load());
  fonts.ocr = loadFont("assets/font/ocr_a_extended.ttf");
  fonts.darktech = loadFont("assets/font/darktech_ldr.ttf");
}
//Set up the canvas, using the previous function
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.addEventListener("contextmenu", (event) => event.preventDefault());
  rectMode(CENTER);
  imageMode(CENTER);
  colorMode("rgb", 255);
  textFont(fonts.darktech);
}

async function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}

async function generateWorld(seed) {
  generationStarted = true;
  generating = true;
  genProgress = 0;
  genMsg = "Generating World...";
  world.prepareForGeneration();
  console.log("Generation started");
  worldGenWorker.postMessage({ type: "generate", seed: seed });
  framesToDraw = 0;
}

//Change the size if the screen size changes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function frameSkippingFunction(func) {
  if (framesToDraw > 1000) {
    framesToDraw = 0;
    return;
  }
  let st = framesToDraw;
  for (let fr = 0; fr < st - 1; fr += 1) {
    func();
    framesToDraw--;
  }
}

let errored = false;
function draw() {
  Log.tick();
  try {
    //Draw the void
    background(128 + Math.sin(frameCount / 120) * 128, 255);
    if (!errored) frame();
  } catch (error) {
    errored = true;
    console.error(error);
    Log.send("Project: Reassembly has encountered an error:", [255, 50, 50]);
    Log.send(
      "   [" + error.constructor.name + "] " + error.message,
      [255, 0, 0]
    );
    error.stack
      .split("\n")
      .slice(1)
      .forEach((el) => Log.send("  " + el, [255, 30, 30]));
    Log.send("Press [Space] to continue", [255, 50, 50]);
    addEventListener("keydown", fixError);
    noLoop();
    loop();
  }
  Log.draw();
}
function fixError(ev) {
  if (ev.key === " ") {
    errored = false;
    removeEventListener("keydown", fixError);
  }
}

function frame() {
  if (generating) {
    push();
    textFont(fonts.darktech);
    fill(0);
    stroke(255);
    strokeWeight(3);
    textAlign(CENTER);
    textSize(50);
    text(genMsg, width / 2, height / 2);
    fill(0);
    rectMode(CENTER);
    rect(width / 2, height / 2 + 60, width * 0.6, 30);
    rect(width / 2, height / 2 + 120, width * 0.4, 20);
    fill(255, 0, 0);
    let w = width * 0.6 * genProgress;
    let w2 = width * 0.4 * genStageProgress;
    rectMode(CORNER);
    rect(width * 0.2, height / 2 + 45, w, 30);
    rect(width * 0.3, height / 2 + 110, w2, 20);
    textFont(fonts.ocr);
    textAlign(CENTER, CENTER);
    fill(255);
    noStroke();
    textSize(18);
    text((genProgress * 100).toFixed(2) + "%", width / 2, height / 2 + 60);
    textSize(12);
    text(
      "Stage " +
        Registry.worldgen.size * genStageProgress +
        "/" +
        Registry.worldgen.size,
      width / 2,
      height / 2 + 120
    );
    pop();
  } else {
    //Frameskip stuff
    framesToDraw += deltaTime / timePerFrame;
    push();
    translate(width / 2, height / 2);
    //Draw everything else
    if (ui.menuState === "in-game") {
      if (!generationStarted) {
        generateWorld(64927391); //2147483647
        return;
      }
      gameFrame();
    }
    fpsUpdate();
    uiFrame();
    if (!ui.waitingForMouseUp) mouseInteraction();
    pop();
  }
}

function fpsUpdate() {
  //calculate FPS
  if (frameRate() && ui?.previousFPS) {
    ui.previousFPS.push(frameRate());
    if (ui.previousFPS.length > 30) {
      ui.previousFPS.splice(0, 1);
    }
    const sum = ui.previousFPS.reduce((a, b) => a + b, 0);
    const avg = sum / ui.previousFPS.length || 0;
    ui.currentFPS = avg;
  }
  //
}

function uiFrame() {
  Inventory.tooltip = null;
  //Tick UI
  UIComponent.setCondition("containerselected:" + !!Container.selectedBlock);
  updateUIActivity();
  tickUI();
  //Reset mouse held status
  if (ui.waitingForMouseUp && !mouseIsPressed) ui.waitingForMouseUp = false;
  //Draw UI and mouse pos
  if (generationStarted && !generating && ui.menuState === "in-game") {
    ui.hoveredBlock = world.getBlock(game.mouse.blockX, game.mouse.blockY);
    if (ui.hoveredBlock) ui.hoveredBlock.highlight();
    let conblock = Container.selectedBlock;
    if (conblock) {
      conblock.highlight(true);
      conblock.drawTooltip(
        conblock.uiX + Block.size * ui.camera.zoom,
        conblock.uiY
      );
    }
  }
  drawUI();
  Inventory.drawMIS(40);
  Inventory.drawTooltip();
  showMousePos();
  //Off-screen box, for zooming
  push();
  noFill();
  stroke(255);
  strokeWeight(5);
  rect(0, 0, width * ui.camera.zoom + 5, height * ui.camera.zoom + 5);
  pop();
}

function gameFrame() {
  push();
  frameSkippingFunction(() => {
    if (!game.paused) {
      respawnTimer.tick();
      movePlayer();
      world.tickAll();
    }
  });
  if (!freecam && freecamReturn <= 0) {
    ui.camera.x = game.player.x;
    ui.camera.y = game.player.y;
  }
  if (!freecam && freecamReturn >= 0) {
    freecamReturn -= 0.05;
    ui.camera.x -= camDiff.x * 0.05;
    ui.camera.y -= camDiff.y * 0.05;
  }
  scale(ui.camera.zoom);
  rotate(radians(ui.camera.rotation));
  translate(-ui.camera.x, -ui.camera.y);
  world.drawAll();

  push();
  noFill();
  strokeWeight(10);
  stroke(255, 0, 0);
  rectMode(CORNERS);
  rect(...borders());
  pop();

  pop();
}

function movePlayer() {
  if (keyIsDown(SHIFT) || game.player.dead) {
    freecam = true;
    if (keyIsDown(87)) {
      ui.camera.y -= 5;
    }
    if (keyIsDown(83)) {
      ui.camera.y += 5;
    }
    if (keyIsDown(65)) {
      ui.camera.x -= 5;
    }
    if (keyIsDown(68)) {
      ui.camera.x += 5;
    }
  } else {
    if (freecam) {
      freecamReturn = 1;
      camDiff.x = ui.camera.x - game.player.x;
      camDiff.y = ui.camera.y - game.player.y;
    }
    freecam = false;
    if (
      keyIsDown(87) &&
      game.player.y > borders()[1] /* Top */ + game.player.hitSize
    ) {
      //If 'W' pressed
      game.player.move(0, -game.player.speed);
    }
    if (
      keyIsDown(83) &&
      game.player.y < borders()[3] /* Bottom */ - game.player.hitSize
    ) {
      //If 'S' pressed
      game.player.move(0, game.player.speed);
    }
    if (
      keyIsDown(65) &&
      game.player.x > borders()[0] /* Left */ + game.player.hitSize
    ) {
      //If 'A' pressed
      game.player.move(-game.player.speed, 0);
    }
    if (
      keyIsDown(68) &&
      game.player.x < borders()[2] /* Right */ - game.player.hitSize
    ) {
      //If 'D' pressed
      game.player.move(game.player.speed, 0);
    }
  }
}

function updateUIActivity() {
  if (!keyIsDown(CONTROL))
    ui.lastMousePos = {
      x: mouseX - width / 2,
      y: mouseY - height / 2,
    };
  //Check each component, but only do it once.
  for (let component of ui.components) {
    component.updateActivity();
  }
}

function drawUI() {
  for (let component of ui.components) {
    if (component.active) {
      component.draw();
    }
  }
}

function tickUI() {
  for (let component of ui.components) {
    if (component.active && component.isInteractive) {
      component.checkMouse();
    }
  }
}

function showMousePos() {
  push();
  if (ui.menuState === "in-game" && keyIsDown(ALT)) {
    textAlign(CENTER, CENTER);
    textFont(fonts.ocr);
    stroke(0);
    strokeWeight(2);
    textSize(20);
    fill(255, 150, 150);
    text(
      "UI X:" + Math.round(ui.mouse.x) + " Y:" + Math.round(ui.mouse.y),
      ui.mouse.x,
      ui.mouse.y - 60
    );
    fill(0, 200, 255);
    text(
      "Player X:" +
        Math.round(game.player.x) +
        " Y:" +
        Math.round(game.player.y),
      ui.mouse.x,
      ui.mouse.y - 40
    );
    fill(255);
    text(
      "Mouse X:" + Math.round(game.mouse.x) + " Y:" + Math.round(game.mouse.y),
      ui.mouse.x,
      ui.mouse.y - 20
    );
  }
  const mouseSize = 15;
  stroke(255, 0, 0);
  strokeWeight(2);
  line(
    ui.lastMousePos.x - mouseSize,
    ui.lastMousePos.y,
    ui.lastMousePos.x + mouseSize,
    ui.lastMousePos.y
  );
  line(
    ui.lastMousePos.x,
    ui.lastMousePos.y - mouseSize,
    ui.lastMousePos.x,
    ui.lastMousePos.y + mouseSize
  );
  stroke(255);
  line(ui.mouse.x - mouseSize, ui.mouse.y, ui.mouse.x + mouseSize, ui.mouse.y);
  line(ui.mouse.x, ui.mouse.y - mouseSize, ui.mouse.x, ui.mouse.y + mouseSize);
  pop();
}

function createPlayer() {
  /** @type {Player} */
  let player = construct({
    type: "player",
    x: worldSize / 2,
    y: worldSize / 2,
    name: "Player",
    health: 100,
    components: [
      {
        image: "entity.scrap-sentinel.head",
        width: 32,
        height: 32,
      },
      {
        image: "entity.scrap-sentinel.body",
        width: 32,
        height: 32,
      },
      {
        type: "leg-component",
        image: "entity.scrap-sentinel.legs",
        width: 32,
        height: 32,
      },
    ],
    team: "player",
    width: 25,
    height: 25,
    speed: 3,
  });
  player.inventory.addItem("scrap", 35);
  player.inventory.addItem("stone", 99);
  player.inventory.addItem("scrap-assembler");
  player.addToWorld(world);
  player.setSpawn();
  game.player = player;

  //Change to an accessor property
  Object.defineProperty(player, "target", {
    get: () => {
      return game.mouse;
    }, //This way, I only have to set it once.
  });
  world.particles.push(
    new WaveParticle(
      player.x,
      player.y,
      120,
      0,
      1920,
      [255, 0, 0],
      [255, 0, 0, 0],
      100,
      0
    )
  );
}

function mouseInteraction() {
  if (
    ui.menuState === "in-game" &&
    mouseIsPressed &&
    !ui.waitingForMouseUp &&
    UIComponent.evaluateCondition("menu:none")
  ) {
    if (ui.mouseButton === "right") secondaryInteract();
    else interact();
  }
}

function secondaryInteract() {
  if (Inventory.mouseItemStack.item === "nothing") {
    let block = world.getBlock(game.mouse.blockX, game.mouse.blockY);
    if (block)
      if (block.dropItem) {
        //Break breakables

        if (!block.break(BreakType.deconstruct)) return;
        world.break(game.mouse.blockX, game.mouse.blockY);
        if (block === Container.selectedBlock) {
          Container.selectedBlock = null;
        }
        return;
      }
    if (
      game.player.rightHand.get(0) instanceof ItemStack &&
      game.player.rightHand.get(0).getItem() instanceof Equippable
    )
      game.player.rightHand.get(0).getItem().use(game.player, true);
    if (
      game.player.leftHand.get(0) instanceof ItemStack &&
      game.player.leftHand.get(0).getItem() instanceof Equippable
    )
      game.player.leftHand.get(0).getItem().use(game.player, true);
  } else {
    DroppedItemStack.create(
      Inventory.mouseItemStack,
      world,
      game.player.x,
      game.player.y,
      10,
      game.player.direction + rnd(-10, 10)
    );
    Inventory.mouseItemStack.clear();
  }
}

function interact() {
  let heldItem = Inventory.mouseItemStack.getItem();
  let clickedBlock = world.getBlock(game.mouse.blockX, game.mouse.blockY);
  if (
    clickedBlock &&
    clickedBlock.interaction(game.player, Inventory.mouseItemStack)
  )
    return;
  let clickedTile =
    world.getBlock(game.mouse.blockX, game.mouse.blockY, "floor") ??
    world.getBlock(game.mouse.blockX, game.mouse.blockY, "tiles");
  //If space is free, and buildable
  if (clickedTile?.buildable) {
    //Place items on free space
    if (heldItem instanceof PlaceableItem) {
      heldItem.place(
        Inventory.mouseItemStack,
        game.mouse.blockX,
        game.mouse.blockY,
        selectedDirection
      );
      return;
    }
  }
  //If clicked again
  if (clickedBlock && clickedBlock === Container.selectedBlock) {
    Container.selectedBlock = null;
    ui.waitingForMouseUp = true;
    return;
  }
  //If block is (not) interacted with
  if (clickedBlock && clickedBlock.selectable) {
    Container.selectedBlock = clickedBlock;
    ui.waitingForMouseUp = true;
    return;
  } else {
    if (Container.selectedBlock) {
      Container.selectedBlock = null;
      ui.waitingForMouseUp = true;
      return;
    }
  }
  if (
    game.player.rightHand.get(0) instanceof ItemStack &&
    game.player.rightHand.get(0).getItem() instanceof Equippable
  )
    game.player.rightHand.get(0).getItem().use(game.player);
  if (
    game.player.leftHand.get(0) instanceof ItemStack &&
    game.player.leftHand.get(0).getItem() instanceof Equippable
  )
    game.player.leftHand.get(0).getItem().use(game.player);
}

function playerDies() {
  ui.menuState = "you-died";
  //Reset world and game
  reset();
}

function reset() {
  world.entities.splice(0);
  world.particles.splice(0);
  world.bullets.splice(0);
  game.level = 1;
  game.paused = false;

  for (let slot of game.player.weaponSlots) {
    slot.clear(); //Remove any weapons
  }

  //garbage collect player
  game.player = null;
}

//Triggers on any key press
function keyPressed() {
  //CAPS LOCK doesn't matter
  key = key.toString().toLowerCase();
  //hold grave to log keys
  if (keyIsDown("`")) console.log(key);

  //Hotkeys
  if (key === " ")
    //Pause / unpause
    togglePause();
  else if (key === "escape" && !UIComponent.evaluateCondition("menu:none"))
    UIComponent.setCondition("menu:none");
  else if (key === "e") {
    //Inventory
    if (UIComponent.evaluateCondition("menu:inventory"))
      UIComponent.setCondition("menu:none");
    else UIComponent.setCondition("menu:inventory");
  }
  //Hotkeys
  else if (key === "1") game.player.equipment.hotkeySlot(0, true);
  else if (key === "2") game.player.equipment.hotkeySlot(1, true);
  else if (key === "3") game.player.equipment.hotkeySlot(2, true);
  else if (key === "4") game.player.equipment.hotkeySlot(3, true);
  else if (key === "5") game.player.equipment.hotkeySlot(4, true);
  //DevTools and fullscreen
  else if (key === "f12" || key === "f11") return true;
  //Recipe controls
  else if (key === "arrowright") nextRecipe();
  else if (key === "arrowleft") prevRecipe();
  //Prevent any default behaviour
  return false;
}

const zoomSpeed = 0.025;
/**@param {WheelEvent} ev  */
function mouseWheel(ev) {
  //CTRL + scroll to zoom
  if (ev.ctrlKey)
    ui.camera.zoom = clamp(ui.camera.zoom + ev.delta * zoomSpeed, 1, 5);
  //scroll normally to change block placement direction
  else
    selectedDirection = (
      ev.delta > 0 ? Block.dir.rotateAntiClockwise : Block.dir.rotateClockwise
    )(selectedDirection);
  return false;
}

function nextRecipe() {
  let block = ui.hoveredBlock ?? Container.selectedBlock;
  if (!block) return;
  if (block instanceof Crafter) {
    block.changeRecipe();
    block._recipe++;
    if (block._recipe >= block.recipes.length) block._recipe = 0;
  }
}

function prevRecipe() {
  let block = ui.hoveredBlock ?? Container.selectedBlock;
  if (!block) return;
  if (block instanceof Crafter) {
    block.changeRecipe();
    block._recipe--;
    if (block._recipe < 0) block._recipe = block.recipes.length - 1;
  }
}

function pause() {
  game.paused = true;
  UIComponent.setCondition("paused:true");
}
function unpause() {
  game.paused = false;
  UIComponent.setCondition("paused:false");
}
function togglePause() {
  if (game.paused) {
    unpause();
  } else {
    pause();
  }
}
function mousePressed() {
  return false;
}
