import { Block, BreakType, PlaceType } from "../classes/block/block.js";
import { Container } from "../classes/block/container.js";
import { Chunk } from "../classes/world/chunk.js";
import { World } from "../classes/world/world.js";
import { Registries } from "../core/registry.js";
import { Log } from "./messaging.js";
import { ui, rotatedShape } from "../core/ui.js";
import { Inventory } from "../classes/inventory.js";
import { UIComponent } from "../core/ui.js";
import {} from "../lib/isl.js";
import { Serialiser } from "../core/serialiser.js";
import { createEffect, effectTimer, emitEffect, Explosion } from "./effects.js";
import { Player, respawnTimer } from "../classes/entity/player.js";
import { WaveParticle } from "../classes/effect/wave-particle.js";
import { clamp, rnd, roundNum, tru } from "../core/number.js";
import { PlaceableItem } from "../classes/item/placeable.js";
import { ItemStack } from "../classes/item/item-stack.js";
import { Equippable } from "../classes/item/equippable.js";
import { construct } from "../core/constructor.js";
//Make the ui exist
import { cmdHistory } from "../definitions/screens/in-game.js";
import {} from "../definitions/screens/title.js";
//is integration time
import {} from "../lib/int-setup.js";
import { ExecutionContext, exec } from "../lib/isl.js";
import { DroppedItemStack } from "../classes/item/dropped-itemstack.js";
import { fonts } from "./font.js";
import { patternedBulletExpulsion } from "../classes/projectile/bullet.js";
let histIndex = 0;
const game = {
  saveslot: 1,
  //Control type
  control: "keyboard",
  /** @type {Player | null} Player entity */
  player: null,
  paused: false,
  money: 10000,
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
  reset() {
    this.player = null;
    this.money = 0;
    this.paused = false;
  },
};
//Slightly laggy effect stuff
const effects = {
  lighting: false, //You need this for insanity
  shadeColour: [0, 230],
  lightColour: [255, 100],
  lightScale: 1,
  corruption: false,
  corruptionCount: 5,
  corruptionOffset: 100,
  corruptionSize: 500,
  corruptionHeight: 100,
  corruptionCopies: 2,
  screenShake: true,
  screenShakeScale: 1,
  /** @type {{ x: float, y: float, intensity: float, duration: int, originalDuration: int}[]} */
  screenShakeInstances: [],
  shake(x, y, intensity, duration) {
    this.screenShakeInstances.push({
      x: x,
      y: y,
      intensity: intensity,
      duration: duration,
      originalDuration: duration,
    });
  },
  applyShake() {
    let intensity = 0;
    this.screenShakeInstances.forEach((v, i, a) => {
      v.duration--;
      if (v.duration < 0) {
        a.splice(i, 1);
      } else {
        let int =
          (v.intensity *
            (v.duration / v.originalDuration) *
            this.screenShakeScale *
            100) /
          Math.max(game.player.distanceToPoint(v.x, v.y), 50);
        intensity += int;
      }
    });
    ui.camera.x += rnd(-intensity, intensity);
    ui.camera.y += rnd(-intensity, intensity);
  },
};
let worldSize = Block.size * Chunk.size * World.size;
const borders = () => [0, 0, worldSize, worldSize];
let preloadTicks = 100;
let timePerFrame = 1000 / 60;
let time = 0;
let framesToDraw = 0;
//Generation
const gen = {
  started: false,
  inprogress: false,
  msg: "Generating World...",
  progress: 0,
  stageProgress: 0,
  mode: "create",
  reset() {
    this.started = false;
    this.inprogress = false;
    this.progress = 0;
    this.stageProgress = 0;
    this.mode = "create";
  },
};
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
    type: "module",
  });
} catch (error) {
  console.error("Could not create worker:", error);
  Log.send("World generation could not be started.", [255, 0, 0]);
}
//

//Worldgen analysis
let stats = {
  placed: Object.create(null),
  total: 0,
  failed: 0,
  structures: Object.create(null),
  structs: 0,
};
//Create or load world
const world = new World();

worldGenWorker.onmessage = (ev) => {
  if (ev.data === "finish") {
    console.log("Generation finished.");
    gen.msg = "Entering World";
    for (let tick = 0; tick < preloadTicks; tick++) world.tickAll();
    deliverPlayer(null, worldSize / 2, worldSize / 2, true, true);

    gen.inprogress = false;
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
      gen.msg = ev.data.stage;
    }
    if (ev.data.type === "progress") {
      gen.progress = ev.data.progress;
    }
    if (ev.data.type === "progress-stage") {
      gen.stageProgress = ev.data.progress;
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
      chunk.i = def.i;
      chunk.j = def.j;
      world.chunks[def.j][def.i] = chunk;
    }
    if (ev.data.type === "build") {
      let successful = true;
      for (let block of ev.data.blocks) {
        //Create block, and overwrite properties
        if (
          world.isPositionFree(ev.data.x + block.x, ev.data.y + block.y) &&
          (!(ev.data.target || block.target) ||
            world.getBlock(
              ev.data.x + block.x,
              ev.data.y + block.y,
              "tiles"
            ) === (block.target ?? ev.data.target))
        )
          try {
            let blk = world.placeAt(
              block.block,
              ev.data.x + block.x,
              ev.data.y + block.y,
              block.layer ?? "blocks"
            );
            Object.assign(blk, block.construction ?? {});

            blk.direction = Block.dir.fromEnum(block.direction);

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
          world.getBlock(ev.data.x, ev.data.y, "tiles")?.registryName ===
            ev.data.target) &&
        (world.getBlock(ev.data.x, ev.data.y, "tiles")?.buildable ||
          world.getBlock(ev.data.x, ev.data.y, "floor")?.buildable)
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
    "\nat " +
    ev.lineno +
    ":" +
    ev.colno;
  console.error(errmsg, ev);
  ev.preventDefault();
  Log.send(errmsg, [255, 0, 0]);
};

worldGenWorker.onmessageerror = (ev) => {
  console.warn("Message could not be deserialised.");
  Log.send("Message could not be deserialised.", [255, 255, 0]);
};

const propertyReplacements = [
  ['"health":', "ḣ"],
  ['"direction":', "ḋ"],
  ['"block":', "ḃ"],
  ['"blocks":', "ḇ"],
  ['"tiles":', "ṫ"],
  ['"floors":', "ḟ"],
  ['"team":', "ṭ"],
  ['"x":', "ẋ"],
  ['"y":', "ẏ"],
  ['"i":', "ï"],
  ['"j":', "ĵ"],
  ['"spawnX":', "ξ"],
  ['"spawnY":', "ŷ"],
  ['"storage":', "§"],
  ['"recipe":', "®"],
  [
    /{"item":"nothing","count":[0-9]+,"tags":\[[^}]*\]}/gi,
    "л",
    '{"item":"nothing","count":0,"tags":[]}',
  ],
  ['"item":', "ī"],
  ['"tags":', "θ"],
  ['"count":', "©"],
  ['"inventory":', "ѝ"],
  ['"size":', "∫"],
  ["null", "ⁿ"],
  ["[ⁿ,ⁿ,ⁿ,ⁿ,ⁿ,ⁿ,ⁿ,ⁿ,ⁿ,ⁿ,ⁿ,ⁿ,ⁿ,ⁿ,ⁿ,ⁿ]", "ɴ"],
  ["[ɴ,ɴ,ɴ,ɴ,ɴ,ɴ,ɴ,ɴ,ɴ,ɴ,ɴ,ɴ,ɴ,ɴ,ɴ,ɴ]", "ℕ"],
  ['"isMainPlayer":', "ṁ"],
  ['"rightHand":', "ʀ"],
  ['"leftHand":', "λ"],
  ['"head":', "ײ"],
  ['"entity":', "ɜ"],
  ['"equipment":', "ɛ"],
  ['"statuses":', "ʃ"],
  ['"body":', "β"],
  ['"positions":', "ψ"],
  ['"seed":', "σ"],
  ['"name":', "ν"],
  ['"money":', "⅘"],
];
const postDictReplacers = [
  ["},{", "⁺"],
  ["],[", "₊"],
];
/**
 * Checks for a name in a number-name dictionary, such as the one used in save files..
 * @param {string} name Name to search for
 * @param {[int, string][]} dict Number-Name dictionary to search through.
 * @returns
 */
function hasNameInDictArray(name, dict) {
  for (let entry of dict) {
    if (entry[1] === name) return true;
  }
  return false;
}

const escapeJSON = function (str) {
  return str
    .replace(/[\\]/g, "\\\\")
    .replace(/[\"]/g, '\\"')
    .replace(/[\/]/g, "\\/")
    .replace(/[\b]/g, "\\b")
    .replace(/[\f]/g, "\\f")
    .replace(/[\n]/g, "\\n")
    .replace(/[\r]/g, "\\r")
    .replace(/[\t]/g, "\\t");
};

function saveGame(name) {
  name ??= "save.game";
  //Create file
  let wrld = world.serialise();
  wrld.money = game.money ?? 0;
  let file = JSON.stringify(wrld);
  //Minify the file
  //About 128(!) times smaller file size because of this
  //General find-and-replace:
  for (let replacer of propertyReplacements) {
    file = file.replaceAll(replacer[0], replacer[1]);
  }
  //Dictionary replacement:
  let dict = [];
  let num = 0;
  Registries.blocks.forEach((name) => {
    dict.push([num, name]);
    num++;
  });
  Registries.items.forEach((name) => {
    if (!hasNameInDictArray(name, dict)) {
      dict.push([num, name]);
      num++;
    }
  });
  Registries.entities.forEach((name) => {
    dict.push([num, name]);
    num++;
  });
  dict.forEach((val) => {
    file = file.replaceAll('"' + val[1] + '"', "⁝" + val[0]);
  });
  //Dictionary compression: Tiles
  file = file.replaceAll(/{ḃ⁝[0-9]+}/gi, (tile) => {
    return "…" + tile.substring(3, tile.length - 1);
  });
  //Dictionary compression: RLE
  file = file.replaceAll(/(…[0-9]+),?(?:\1,?)*/gi, (tile) => {
    let arr = tile.split(",").filter((x) => x.length > 0);
    return "×" + arr.length + arr[0];
  });
  //Postdict replacers
  for (let replacer of postDictReplacers) {
    file = file.replaceAll(replacer[0], replacer[1]);
  }
  //Add dictionary to save
  file =
    "DICT<" +
    dict.map((entry) => entry[0] + "=" + entry[1]).join("|") +
    ">" +
    file;
  let spaceUsed = sizeKB(name + file);
  Serialiser.set(name, file);
  console.log("Game saved (" + roundNum(spaceUsed, 2) + "KB).");
  Log.send(
    "Game has been saved (" + roundNum(spaceUsed, 2) + "KB).",
    [0, 255, 0]
  );
}

function clearData() {
  console.log("All saves deleted.");
  Log.send("Stored saves deleted.", [255, 0, 0]);
  Serialiser.clear("pr");
}

function loadGame(name) {
  name ??= "save.game";
  //Get file
  /**@type {string} */
  let file = Serialiser.get(name);
  if (!file) {
    Log.send("There is no save at '" + name + "'", [255, 255, 0]);
    return false;
  }
  //Deminify the file
  //Unreplace first
  let reversedPDReplacers = postDictReplacers.map((x) => x.slice(0));
  for (let replacer of reversedPDReplacers.reverse()) {
    file = file.replaceAll(
      replacer[1],
      (typeof replacer[0] === "string" ? replacer[0] : replacer[2]) ??
        replacer[0]
    );
  }
  //Dictionary decompression: Run Length Decoding
  file = file
    .replaceAll(/×[0-9]+…[0-9]+/gi, (tile) => {
      let str = tile.match(/…[0-9]+/)[0] + ",";
      let out = str.repeat(parseInt(tile.match(/(?<=×)[0-9]+(?=…)/)[0]));
      return out;
    })
    .replaceAll(/,]/g, "]");
  //Dictionary decompression: untile
  file = file.replaceAll(/…[0-9]+/gi, (tile) => {
    return "{ḃ⁝" + tile.substring(1) + "}";
  });
  let dict = [];
  file = file.replace(/DICT<.*?>/gim, (dictionary) => {
    let encoded = dictionary.substring(5, dictionary.length - 1);
    dict = encoded.split("|").map((entry) => entry.split("="));
    return "";
  });
  dict.forEach((entry) => {
    file = file.replaceAll("⁝" + entry[0] + ",", '"' + entry[1] + '",');
    file = file.replaceAll("⁝" + entry[0] + "}", '"' + entry[1] + '"}');
    file = file.replaceAll("⁝" + entry[0] + ":", '"' + entry[1] + '":');
  });
  //Unreplace
  let reversedReplacers = propertyReplacements.map((x) => x.slice(0));
  for (let replacer of reversedReplacers.reverse()) {
    file = file.replaceAll(
      replacer[1],
      (typeof replacer[0] === "string" ? replacer[0] : replacer[2]) ??
        replacer[0]
    );
  }
  console.log(file);
  effectTimer.cancel("*");
  effects.screenShakeInstances.splice(0);

  let wrld = JSON.parse(file);
  game.money = wrld.money ?? 10000;
  world.become(World.deserialise(wrld));
  console.log("Game loaded.");
  Log.send("You are now playing on '" + world.name + "'.", [0, 255, 0]);
  return true;
}

function localStorageSpace() {
  var allStrings = "";
  for (var key in window.localStorage) {
    if (window.localStorage.hasOwnProperty(key)) {
      allStrings += window.localStorage[key];
    }
  }
  return roundNum(3 + sizeKB(allStrings), 2) + "KB";
}
function sizeKB(string) {
  return string ? string.length / 512 : 0;
}

globalThis.preload = async function () {
  Registries.images.forEachAsync((name, el) => el.load());
  fonts.load();
};
//Set up the canvas, using the previous function
globalThis.setup = function () {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.addEventListener("contextmenu", (event) => event.preventDefault());
  rectMode(CENTER);
  imageMode(CENTER);
  colorMode("rgb", 255);
  textFont(fonts.darktech);
  textStyle("normal");
};

async function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}

async function generateWorld(seed) {
  gen.started = true;
  gen.inprogress = true;
  gen.progress = 0;
  gen.msg = "Generating World...";
  world.prepareForGeneration();
  console.log("Generation started");
  worldGenWorker.postMessage({ type: "generate", seed: seed });
  framesToDraw = 0;
}

//Change the size if the screen size changes
window.windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};

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
window.draw = function () {
  Log.tick();
  try {
    //Draw the void
    background(128 + Math.sin(frameCount / 120) * 128, 255);
    if (!errored) frame();
    if (keyIsDown(32)) errored = false;
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
    //addEventListener("keydown", fixError);
    noLoop();
    loop();
  }
  Log.draw();
};

window.postProcess = function () {
  push();
  //Corruption/glitch effect
  imageMode(CORNER);
  if (effects.corruption)
    for (let i = 0; i < effects.corruptionCount; i++) {
      let x = random(-effects.corruptionOffset, width),
        y = random(-effects.corruptionOffset, height);
      let tile = get(
        x,
        y,
        random(effects.corruptionSize, width + effects.corruptionOffset),
        random(effects.corruptionHeight / 2, effects.corruptionHeight)
      );
      for (let j = 0; j < effects.corruptionCopies; j++)
        image(
          tile,
          x + rnd(-effects.corruptionOffset, effects.corruptionOffset),
          y + rnd(-effects.corruptionOffset, effects.corruptionOffset)
        );
    }
  pop();
};

function frame() {
  //Frameskip stuff
  framesToDraw += deltaTime / timePerFrame;
  if (gen.inprogress) {
    push();
    translate(width / 2, height / 2);
    frameSkippingFunction(drawNeutralBackground);
    pop();
    push();
    textFont(fonts.darktech);
    fill(0);
    stroke(255, 200, 0);
    strokeWeight(6);
    textAlign(CENTER);
    textSize(40);
    text(gen.msg, width / 2, height / 2);
    strokeWeight(3);
    fill(0);
    rectMode(CENTER);
    rect(width / 2, height / 2 + 60, width * 0.6, 30);
    rect(width / 2, height / 2 + 120, width * 0.4, 20);
    fill(230, 170, 0);
    let w = width * 0.6 * gen.progress;
    let w2 = width * 0.4 * gen.stageProgress;
    rectMode(CORNER);
    rect(width * 0.2, height / 2 + 45, w, 30);
    rect(width * 0.3, height / 2 + 110, w2, 20);
    textFont(fonts.ocr);
    textAlign(CENTER, CENTER);
    fill(255);
    noStroke();
    textSize(18);
    text((gen.progress * 100).toFixed(2) + "%", width / 2, height / 2 + 60);
    textSize(12);
    text(
      "Stage " +
        Registries.worldgen.size * gen.stageProgress +
        "/" +
        Registries.worldgen.size,
      width / 2,
      height / 2 + 120
    );
    pop();
  } else {
    push();
    translate(width / 2, height / 2);
    //Draw everything else
    if (ui.menuState === "in-game") {
      if (!gen.started) {
        if (gen.mode === "create") generateWorld(); //2147483647
        else if (gen.mode === "load") {
          if (loadGame()) gen.started = true;
          else gen.mode = "create";
        } else throw new Error("No generation mode! Use 'create' or 'load'.");
        return;
      }
      gameFrame();
      if (effects.lighting)
        lighting(effects.shadeColour, effects.lightColour, effects.lightScale);
    } else if (ui.menuState === "title") {
      drawNeutralBackground();
    }
    fpsUpdate();
    uiFrame();
    if (!ui.waitingForMouseUp) mouseInteraction();
    pop();
  }
}

function drawNeutralBackground() {
  time++;
  let size = Math.max(width, height);
  background(0);
  noStroke();
  strokeWeight(30);
  fill(255, 200, 0);
  // rotatedShape("square", 0, 0, size * 0.6, size * 0.6, frameCount / 100);
  // rotatedShape("square", 0, 0, size * 0.8, size * 0.8, 2 + -frameCount / 100);
  for (let offset = 0; offset < Math.ceil((width * 2) / 3); offset += 20) {
    rotatedShape(
      "rect",
      -width + (((time + offset) * 3) % (width * 2)),
      0,
      20,
      height * 1.43,
      PI / 4
    );
  }
  fill(40);
  rotatedShape("rect", 0, 0, width, height * 0.85, 0);
  noFill();
  stroke(60);
  strokeWeight(10);
  rotatedShape("rect", 0, 0, width * 1.2, height, 0);
  strokeWeight(5);
  rotatedShape("rect", 0, 0, width * 1.2, height * 0.85, 0);
}

function fpsUpdate() {
  //calculate FPS
  if (frameRate() && ui?.previousFPS) {
    ui.previousFPS.push(frameRate());
    if (ui.previousFPS.length > 5) {
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
  UIComponent.setCondition(
    "containerselected:" + (Container.selectedBlock instanceof Container)
  );
  updateUIActivity();
  tickUI();
  //Reset mouse held status
  if (ui.waitingForMouseUp && !mouseIsPressed) ui.waitingForMouseUp = false;
  //Draw UI and mouse pos
  if (gen.started && !gen.inprogress && ui.menuState === "in-game") {
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
  // push();
  // noFill();
  // stroke(255);
  // strokeWeight(5);
  // rect(0, 0, width * ui.camera.zoom + 5, height * ui.camera.zoom + 5);
  // pop();
}

function tickTimers() {
  effectTimer.tick();
  respawnTimer.tick();
}

function gameFrame() {
  push();
  frameSkippingFunction(() => {
    if (!game.paused) {
      tickTimers();
      if (game.player) {
        movePlayer();
        if (!freecam && freecamReturn <= 0) {
          ui.camera.x = game.player.x;
          ui.camera.y = game.player.y;
        }
        if (!freecam && freecamReturn >= 0) {
          freecamReturn -= 0.05;
          ui.camera.x -= camDiff.x * 0.05;
          ui.camera.y -= camDiff.y * 0.05;
        }
      } else UIComponent.setCondition("dead:yes");
      effects.applyShake();
      world.tickAll();
    }
  });
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
  if (ui.texteditor.active) return false;
  if (keyIsDown(SHIFT) || game.player.dead || !game.player.controllable) {
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
  _playerx.value = game.player.x;
  _playery.value = game.player.y;
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
      if (ui.wasReset) {
        ui.wasReset = false;
        updateUIActivity();
        break;
      }
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
/**
 * @param {Player | null} player
 */
function createPlayer(player = null, x, y, arm = true) {
  if (!player) {
    player = construct(Registries.entities.get("player"));
    if (arm) {
      player.equipment.addItem("scrap-assembler");
      player.equipment.addItem("scrap-bullet", roundNum(rnd(4500, 5500)));
      if (tru(1 / 11)) player.leftHand.addItem("scrap-shooter");
      else player.rightHand.addItem("scrap-shooter");
    }
    player.addToWorld(world, x ?? worldSize / 2, y ?? worldSize / 2);
    player.setSpawn();
  }
  game.player = player;
  if (x !== undefined) game.player.x = x;
  if (y !== undefined) game.player.y = y;
  //For ISL
  _self.value = player;

  //Change to an accessor property
  Object.defineProperty(game.player, "target", {
    get: () => game.mouse, //This way, I only have to set it once.
  });
}

// Makes a player with a bang
function deliverPlayer(player = null, x, y, arm = true, moveCamera = false) {
  createPlayer(player, x, y, arm);
  game.player.health = game.player.maxHealth;
  game.player.statuses = {};
  if (game.player.dead) {
    game.player.dead = false;
    game.player.addToWorld(world);
  }
  game.player.visible = false;
  game.player.controllable = false;
  if (moveCamera) {
    ui.camera.x = game.player.x;
    ui.camera.y = game.player.y;
  }
  emitEffect("land-target", game.player);
  effectTimer.do(() => {
    let y = ui.camera.y - height / ui.camera.zoom;
    let life = (game.player.y - y) / 20;
    patternedBulletExpulsion(
      game.player.x,
      y,
      {
        lifetime: life - 1,
        speed: 20,
        trailEffect: "land-trail",
        drawer: { hidden: true },
        collides: false,
        fires: 9,
        fire: {
          damage: 6,
          lifetime: 2880,
          interval: 20,
          status: "burning",
          statusDuration: 120,
        },
        fireSpread: 50,
        fragNumber: 9,
        fragSpacing: 40,
        fragSpread: 40,
        fragBullet: {
          lifetime: 20,
          speed: 30,
          decel: 1.5,
          pierce: 2,
          trailEffect: "fire",
          status: "burning",
          statusDuration: 360,
          drawer: {
            shape: "rhombus",
            fill: "gray",
            width: 30,
            height: 8,
          },
          damage: [
            {
              amount: 20,
              type: "ballistic",
            },
            {
              amount: 40,
              type: "explosion",
              radius: 30,
            },
          ],
          despawnEffect: "explosion~30",
          fires: 2,
          fire: {
            damage: 6,
            lifetime: 1440,
            interval: 20,
            status: "burning",
            statusDuration: 120,
          },
          fireSpread: 10,
        },
      },
      1,
      90,
      0,
      0,
      world,
      game.player
    );
    effectTimer.do(() => {
      new Explosion({
        x: game.player.x,
        y: game.player.y,
        world: world,
        team: "player",
        radius: 150,
        amount: 500,
        knockback: 0,
      })
        .create()
        .dealDamage();
      createEffect(
        "land-wave",
        world,
        game.player.x,
        game.player.y,
        -Math.PI / 2,
        1
      );
      createEffect(
        "land-scorch",
        world,
        game.player.x,
        game.player.y,
        -Math.PI / 2,
        1
      );
      for (let tick = 0; tick < 10; tick++)
        DroppedItemStack.create(
          new ItemStack("scrap", roundNum(rnd(2, 20))),
          world,
          game.player.x,
          game.player.y,
          rnd(4, 10),
          rnd(0, 360)
        );
      game.player.visible = true;
      game.player.controllable = true;
    }, life);
  }, 180);
}

function mouseInteraction() {
  if (
    ui.menuState === "in-game" &&
    mouseIsPressed &&
    !ui.waitingForMouseUp &&
    game.player.controllable &&
    UIComponent.evaluateCondition("menu:none")
  ) {
    if (ui.mouseButton === "right") secondaryInteract();
    else interact();
  }
}

function secondaryInteract() {
  if (Inventory.mouseItemStack.item === "nothing") {
    let block = world.getBlock(game.mouse.blockX, game.mouse.blockY);
    if (block && block.team === game.player.team && !keyIsDown(SHIFT))
      if (block.dropItem) {
        //Break breakables

        if (block.break(BreakType.deconstruct))
          if (block === Container.selectedBlock) Container.selectedBlock = null;
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
    ui.waitingForMouseUp = true;
  }
}

function interact() {
  let heldItem = Inventory.mouseItemStack.getItem();
  let clickedBlock = world.getBlock(game.mouse.blockX, game.mouse.blockY);
  if (
    clickedBlock &&
    clickedBlock.team === game.player.team &&
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
      if (
        heldItem.place(
          Inventory.mouseItemStack,
          game.mouse.blockX,
          game.mouse.blockY,
          selectedDirection
        )
      )
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
  if (
    clickedBlock &&
    clickedBlock.selectable &&
    clickedBlock.team === game.player.team
  ) {
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
  if (heldItem !== null)
    Inventory.mouseItemStack
      .getItem()
      .useInAir(game.player, Inventory.mouseItemStack);
  if (Inventory.mouseItemStack?.isEmpty())
    Inventory.mouseItemStack = ItemStack.EMPTY;

  if (ui.waitingForMouseUp) return;
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

/**Triggers on any key press
 * @param {KeyboardEvent} ev
 */
window.keyPressed = function (ev) {
  //CAPS LOCK doesn't matter
  key = key.toString().toLowerCase();
  if (ui.texteditor.active) {
    if (key === "enter") {
      ui.endEdit();
    }
    if (key === "escape") ui.texteditor.active = false;
    if (ui.texteditor.isCommandLine) {
      if (key === "arrowup") {
        histIndex++;
        let last = cmdHistory[histIndex];
        if (last !== undefined) ui.texteditor.text = last;
        else histIndex--;
      }
      if (key === "arrowdown") {
        histIndex--;
        let last = cmdHistory[histIndex];
        if (last !== undefined) ui.texteditor.text = last;
        else histIndex++;
      }
    }
    if (key === "backspace")
      ui.texteditor.text = ui.texteditor.text.substring(
        0,
        ui.texteditor.text.length - 1
      );
    return false;
  }
  //hold grave to log keys
  if (keyIsDown("`")) console.log(ev, key);

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
  //Command line
  else if (key === "/") openCommandLine();
  //Prevent any default behaviour
  ev.preventDefault();
  ev.stopPropagation();
  ev.stopImmediatePropagation();
  return false;
};

function openCommandLine() {
  ui.texteditor.active = true;
  ui.texteditor.title = "Command Line";
  ui.texteditor.isCommandLine = true;
  ui.texteditor.save = (command) => {
    exec(
      command,
      new ExecutionContext(game.player.x, game.player.y, game.player)
    );
    cmdHistory.unshift(command);
    histIndex = -1;
  };
}
/**@param {KeyboardEvent} ev  */
window.keyTyped = function (ev) {
  if (!ui.texteditor.active) return false;
  if (key !== "/") {
    ui.texteditor.text +=
      ev.shiftKey || ev.getModifierState("CapsLock")
        ? key.toUpperCase()
        : key.toLowerCase();
  }
  return false;
};

//Show dialog box if game in progress
onbeforeunload = (ev) => {
  if (ui.menuState === "in-game") {
    ev.stopPropagation();
    ev.preventDefault();
  }
};
let selectedDirection = 0;
const zoomSpeed = 0.00125;
/**@param {WheelEvent} ev  */
window.mouseWheel = function (ev) {
  //CTRL + scroll to zoom
  if (ev.ctrlKey) {
    ui.camera.zoom = roundNum(
      clamp(ui.camera.zoom - ev.delta * zoomSpeed, 0.25, 5),
      2
    );
    //fix zooming holes
    world.resetRenderer();
  }
  //scroll normally to change block placement direction
  else
    selectedDirection = (
      ev.delta > 0 ? Block.dir.rotateAntiClockwise : Block.dir.rotateClockwise
    )(selectedDirection);
  return false;
};

function nextRecipe() {
  let block = ui.hoveredBlock ?? Container.selectedBlock;
  if (!block) return;
  block.rightArrow();
}

function prevRecipe() {
  let block = ui.hoveredBlock ?? Container.selectedBlock;
  if (!block) return;
  block.leftArrow();
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
window.mousePressed = function () {
  return false;
};

export {
  game,
  effects,
  createPlayer,
  world,
  fonts,
  loadGame,
  saveGame,
  clearData,
  gen,
  deliverPlayer,
};
