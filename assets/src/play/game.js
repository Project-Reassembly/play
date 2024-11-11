const game = {
  saveslot: 1,
  //Control type
  control: "keyboard",
  /** @type {Entity | null} Player entity */
  player: null,
  paused: false,
  get mouse() {
    return {
      x: ui.mouse.x + ui.camera.x,
      y: ui.mouse.y + ui.camera.y,
    };
  },
};
const world = new World();
const contentScale = 1;
let worldSize = 2000;
const borders = () => [
  -worldSize / 2,
  -worldSize / 2,
  worldSize / 2,
  worldSize / 2,
];

let fonts = {};

async function preload() {
  Registry.images.forEachAsync((name, el) => el.load());
  fonts.ocr = loadFont("assets/font/ocr_a_extended.ttf");
  fonts.darktech = loadFont("assets/font/darktech_ldr.ttf");
}
//Set up the canvas, using the previous function
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  rectMode(CENTER);
  imageMode(CENTER);
  textFont(fonts.darktech);
  world.generateTiles(worldSize / Block.size / Chunk.size + 6);
}
//Change the size if the screen size changes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//p5's draw function - called 60 times per second
function draw() {
  push();
  translate(width / 2, height / 2);
  //Draw the void
  background(128 + Math.sin(frameCount / 120) * 128, 255);
  //Draw everything else
  if (ui.menuState === "in-game") {
    gameFrame();
  }
  uiFrame();
  if (!ui.waitingForMouseUp) mouseInteraction();
  pop();
}

function uiFrame() {
  //Tick, then draw the UI
  updateUIActivity();
  tickUI();
  drawUI();
  //Reset mouse held status
  if (ui.waitingForMouseUp && !mouseIsPressed) ui.waitingForMouseUp = false;
  if (keyIsDown(SHIFT)) showMousePos();
}

function gameFrame() {
  push();
  translate(-ui.camera.x, -ui.camera.y);
  rotate(ui.camera.rotation);
  if (!game.paused) {
    movePlayer();
    ui.camera.x = game.player.x;
    ui.camera.y = game.player.y;
    world.tickAll();
  }
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
}

function showMousePos() {
  push();
  textAlign(CENTER, CENTER);
  textFont(fonts.ocr);
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(20);
  text(
    "X:" + Math.round(game.mouse.x) + " Y:" + Math.round(game.mouse.y),
    ui.mouse.x,
    ui.mouse.y - 20
  );
  stroke(255);
  strokeWeight(2);
  line(ui.mouse.x - 10, ui.mouse.y, ui.mouse.x + 10, ui.mouse.y);
  line(ui.mouse.x, ui.mouse.y - 10, ui.mouse.x, ui.mouse.y + 10);
  pop();
}

function createPlayer() {
  let player = construct({
    type: "equipped-entity",
    x: 0,
    y: 0,
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
    speed: 6,
  });
  player.addItems("scrap", 27);
  player.addItems("stone-block", 18);
  player.addToWorld(world);
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
  if (ui.menuState === "in-game" && mouseIsPressed && !ui.waitingForMouseUp) {
    if (ui.mouseButton === "right") secondaryInteract();
    else interact();
  }
}

function secondaryInteract() {
  let block = world.getBlock(game.mouse.x, game.mouse.y);
  if (!block) return;
  if (InventoryEntity.mouseItemStack.item === "nothing") {
    world.break(game.mouse.x, game.mouse.y);
    InventoryEntity.mouseItemStack = new ItemStack(
      block.dropItem ?? "nothing",
      block.dropCount ?? 1
    );
  } else if (
    (InventoryEntity.mouseItemStack.item === block.dropItem ?? "nothing") &&
    (InventoryEntity.mouseItemStack.count <
      (Registry.items.get(block.dropItem ?? "nothing").stackSize ??
      99))
  ) {
    world.break(game.mouse.x, game.mouse.y);
    InventoryEntity.mouseItemStack.count++;
  }
}
function interact() {
  if (InventoryEntity.mouseItemStack.getItem() instanceof PlaceableItem) {
    InventoryEntity.mouseItemStack
      .getItem()
      .place(InventoryEntity.mouseItemStack);
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
  console.log(key);
  if (key === "p") {
    //Pause / unpause
    togglePause();
  }
  if (key === "Escape") {
    if (!UIComponent.evaluateCondition("menu:none")) {
      UIComponent.setCondition("menu:none");
      unpause();
    }
  }
  if (key === "F12") return true;
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
