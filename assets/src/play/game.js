const game = {
  saveslot: 1,
  //Control type
  control: "keyboard",
  /** @type {EquippedEntity | null} Player entity */
  player: null,
  paused: false,
  get mouse() {
    return {
      x: ui.mouse.x + ui.camera.x,
      blockX: Math.floor((ui.mouse.x + ui.camera.x) / Block.size),
      y: ui.mouse.y + ui.camera.y,
      blockY: Math.floor((ui.mouse.y + ui.camera.y) / Block.size),
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
if (!window.Worker) {
  const errmsg =
    "This browser does not support Web Workers; World generation cannot proceed.";
  console.error(errmsg);
  Log.send(errmsg, [255, 0, 0]);
}
let worldGenWorker;
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

worldGenWorker.onmessage = (ev) => {
  if (ev.data === "finish") {
    genMsg = "Entering World";
    createPlayer();
    ui.camera.x = game.player.x;
    ui.camera.y = game.player.y;
    for (let tick = 0; tick < preloadTicks; tick++) world.tickAll();
    generating = false;
  } else if (typeof ev.data === "object") {
    if (ev.data.type === "progress") {
      genProgress = ev.data.progress;
    }
    if (ev.data.type === "row") {
      console.log(
        "Generator returned row of " + ev.data.defs.length + " chunks"
      );
      for (let def of ev.data.defs) {
        let chunk = new Chunk();
        for (let tile of def.chunk) {
          chunk.addBlock(tile.block, tile.x, tile.y, "tiles");
        }
        chunk.world = world;
        chunk.x = def.i;
        chunk.y = def.j;
        world.chunks[def.j][def.i] = chunk;
      }
      console.log("Chunk row loaded.");
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

async function generateWorld() {
  generationStarted = true;
  generating = true;
  genProgress = 0;
  genMsg = "Generating World...";
  world.prepareForGeneration();
  console.log("Generation started");
  worldGenWorker.postMessage({ type: "generate" });
  // await delay(100);
  // world.generateTiles().then(async () => {
  //   genMsg = "Entering World";
  //   createPlayer();
  //   ui.camera.x = game.player.x;
  //   ui.camera.y = game.player.y;
  //   for (let tick = 0; tick < preloadTicks; tick++) world.tickAll();
  //   await delay(100);
  //   generating = false;
  // });
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

function draw() {
  try {
    frame();
  } catch (error) {
    Log.send("[" + error.constructor.name + "]" + error.message, [255, 0, 0]);
  }
}

function frame() {
  //Draw the void
  background(128 + Math.sin(frameCount / 120) * 128, 255);
  if (generating) {
    push();
    fill(0);
    stroke(255);
    strokeWeight(3);
    textAlign(CENTER);
    textSize(50);
    text(genMsg, width / 2, height / 2);
    fill(0);
    rectMode(CENTER);
    rect(width / 2, height / 2 + 60, width * 0.6, 30);
    fill(255, 0, 0);
    let w = width * 0.6 * genProgress;
    rectMode(CORNER);
    rect(width * 0.2, height / 2 + 45, w, 30);
    pop();
  } else {
    //Frameskip stuff
    framesToDraw += deltaTime / timePerFrame;
    push();
    translate(width / 2, height / 2);
    //Draw everything else
    if (ui.menuState === "in-game") {
      if (!generationStarted) {
        generateWorld();
        return;
      }
      gameFrame();
    }
    fpsUpdate();
    uiFrame();
    if (!ui.waitingForMouseUp) mouseInteraction();
    pop();
    Log.draw();
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
  //Tick UI
  updateUIActivity();
  tickUI();
  //Reset mouse held status
  if (ui.waitingForMouseUp && !mouseIsPressed) ui.waitingForMouseUp = false;
  //Draw UI and mouse pos
  drawUI();
  showMousePos();
  if (generationStarted && !generating && ui.menuState === "in-game") {
    let hoveredBlock = world.getBlock(game.mouse.blockX, game.mouse.blockY);
    if (hoveredBlock) {
      hoveredBlock.drawTooltip(ui.mouse.x, ui.mouse.y);
    }
  }
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
  if (!game.paused) {
    frameSkippingFunction(() => {
      movePlayer();
      world.tickAll();
    });
    ui.camera.x = game.player.x;
    ui.camera.y = game.player.y;
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
  if (
    keyIsDown(87) &&
    game.player.y > borders()[1] /* Top */ + game.player.hitSize
  ) {
    //If 'W' pressed
    game.player.y -= game.player.speed;
  }
  if (
    keyIsDown(83) &&
    game.player.y < borders()[3] /* Bottom */ - game.player.hitSize
  ) {
    //If 'S' pressed
    game.player.y += game.player.speed;
  }
  if (
    keyIsDown(65) &&
    game.player.x > borders()[0] /* Left */ + game.player.hitSize
  ) {
    //If 'A' pressed
    game.player.x -= game.player.speed;
  }
  if (
    keyIsDown(68) &&
    game.player.x < borders()[2] /* Right */ - game.player.hitSize
  ) {
    //If 'D' pressed
    game.player.x += game.player.speed;
  }
}

function updateUIActivity() {
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
  Log.tick();
}

function showMousePos() {
  push();
  if (ui.menuState === "in-game" && keyIsDown(SHIFT)) {
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
  stroke(255);
  strokeWeight(2);
  line(ui.mouse.x - mouseSize, ui.mouse.y, ui.mouse.x + mouseSize, ui.mouse.y);
  line(ui.mouse.x, ui.mouse.y - mouseSize, ui.mouse.x, ui.mouse.y + mouseSize);
  pop();
}

function createPlayer() {
  /** @type {EquippedEntity} */
  let player = construct({
    type: "equipped-entity",
    x: worldSize / 2,
    y: worldSize / 2,
    name: "player",
    health: 200,
    components: [
      {
        type: "component",
        width: 50,
        height: 50,
      },
    ],
    team: "player",
    hitSize: 25, //Always at least half of the smallest dimension
    speed: 3,
  });
  player.inventory.addItem("scrap", 27);
  player.inventory.addItem("stone", 99);
  player.inventory.addItem("scrap-assembler");
  player.addToWorld(world);
  game.player = player;

  world.placeAt(
    "large-assembler",
    Math.floor(game.player.x / Block.size),
    Math.floor(game.player.y / Block.size)
  );

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
  let block = world.getBlock(game.mouse.blockX, game.mouse.blockY);
  if (!block) return;
  //Break breakables
  if (block.dropItem) {
    if (Inventory.mouseItemStack.item === "nothing") {
      if (!block.break(BreakType.deconstruct)) return;
      world.break(game.mouse.blockX, game.mouse.blockY);
      Inventory.mouseItemStack = new ItemStack(
        block.dropItem ?? "nothing",
        block.dropCount ?? 1
      );
      if (block === Container.selectedBlock) {
        Container.selectedBlock = null;
      }
    } else if (
      (Inventory.mouseItemStack.item === block.dropItem ?? "nothing") &&
      Inventory.mouseItemStack.count <
        (Registry.items.get(block.dropItem ?? "nothing").stackSize ?? 99)
    ) {
      if (!block.break(BreakType.deconstruct)) return;
      world.break(game.mouse.blockX, game.mouse.blockY);
      Inventory.mouseItemStack.count++;
      if (block === Container.selectedBlock) {
        Container.selectedBlock = null;
      }
    }
  }
}
function interact() {
  let heldItem = Inventory.mouseItemStack.getItem();
  let clickedBlock = world.getBlock(game.mouse.blockX, game.mouse.blockY);
  //If space is free
  if (!clickedBlock) {
    //Place items on free space
    if (heldItem instanceof PlaceableItem) {
      heldItem.place(
        Inventory.mouseItemStack,
        game.mouse.blockX,
        game.mouse.blockY
      );
    } else {
      Container.selectedBlock = null;
    }
  } else {
    //If block is interacted with
    Container.selectedBlock = clickedBlock;
  }
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
  key = key.toString().toLowerCase();
  if (key === "p") {
    //Pause / unpause
    togglePause();
  } else if (key === "escape") {
    if (!UIComponent.evaluateCondition("menu:none")) {
      UIComponent.setCondition("menu:none");
    }
  } else if (key === "e") {
    //Inventory
    if (UIComponent.evaluateCondition("menu:inventory"))
      UIComponent.setCondition("menu:none");
    else UIComponent.setCondition("menu:inventory");
  } else if (key === "1") {
    game.player.equipment.hotkeySlot(0, true);
  } else if (key === "2") {
    game.player.equipment.hotkeySlot(1, true);
  } else if (key === "3") {
    game.player.equipment.hotkeySlot(2, true);
  } else if (key === "4") {
    game.player.equipment.hotkeySlot(3, true);
  } else if (key === "5") {
    game.player.equipment.hotkeySlot(4, true);
  } else if (key === "f12" || key === "f11") return true; //allow devtools or fullscreen

  return false; //Prevent any default behaviour
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
