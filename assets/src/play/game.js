import "../lib/int-setup.js";

// stuff
import { Block, BreakType } from "../classes/block/block.js";
import { Container } from "../classes/block/container.js";
import { Space } from "../classes/effect/space-renderer.js";
import { Player, respawnTimer } from "../classes/entity/player.js";
import { Inventory } from "../classes/inventory.js";
import { DroppedItemStack } from "../classes/item/dropped-itemstack.js";
import { Equippable } from "../classes/item/equippable.js";
import { ItemStack } from "../classes/item/item-stack.js";
import { PlaceableItem } from "../classes/item/placeable.js";
import { Chunk } from "../classes/world/chunk.js";
import { World } from "../classes/world/world.js";
import { iterate2DArray } from "../core/2D-array.js";
import { Decoration } from "../core/cmft.js";
import { assign, construct, constructFromType } from "../core/constructor.js";
import { Cutscene } from "../core/cutscene.js";
import { clamp, rnd, roundNum } from "../core/number.js";
import { PreloadRegistries, Registries } from "../core/registry.js";
import { Serialiser } from "../core/serialiser.js";
import { ImageContainer, rotatedShape, ui, UIComponent } from "../core/ui.js";
import "../definitions/screens/any.js";
import "../definitions/screens/in-game.js";
import {
  selectors as createCorporationSelectors,
  creation,
} from "../definitions/screens/new-game.js";
import { loadStats, setupTips } from "../definitions/screens/title.js";
import { cmdHistory } from "../definitions/text-edit.js";

import { StatusEffect } from "../classes/effect/status-effect.js";
import { exec } from "../lib/isl/cli.js";
import { checkCreatedEntities, ExecutionContext } from "../lib/isl/core.js";
import { blockSize, totalSize } from "../scaling.js";
import { debug } from "./debug.js";
import { effectTimer } from "./effects.js";
import { fonts } from "./font.js";
import { Log } from "./messaging.js";

import { GroundTile } from "../classes/block/ground-tile.js";
import { deliverPlayer } from "../classes/world/events/event-action.js";
import "../definitions/screens/ide.js";
import { capturedInput, tcursor } from "../definitions/screens/ide.js";
let histIndex = 0;
const game = {
  saveslot: 1,
  //Control type
  control: "keyboard",
  /** @type {Player | null} Player entity */
  player: null,
  paused: false,
  money: 10000,
  mouse: {
    get x() {
      return ui.lastMousePos.x / ui.camera.zoom + ui.camera.x;
    },
    get blockX() {
      return Math.round(this.x / blockSize); //* contentScale;
    },
    get y() {
      return ui.lastMousePos.y / ui.camera.zoom + ui.camera.y;
    },
    get blockY() {
      return Math.round(this.y / blockSize); //* contentScale;
    },
  },
  reset() {
    this.player = null;
    this.money = 0;
    this.paused = false;
  },
};
globalThis.ui = ui;
//Slightly laggy effect stuff
const effects = {
  lighting: false,
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
    if (world.impactParticles.length > 0) return;
    let intensity = 0;
    this.screenShakeInstances.forEach((v, i, a) => {
      v.duration--;
      if (v.duration < 0) {
        a.splice(i, 1);
      } else {
        let int =
          (v.intensity * (v.duration / v.originalDuration) * this.screenShakeScale * 100) /
          Math.max(game.player.distanceToPoint(v.x, v.y), 50);
        intensity += int;
      }
    });
    ui.camera.x += rnd.float(-intensity, intensity);
    ui.camera.y += rnd.float(-intensity, intensity);
  },
};
const borders = () => [
  -blockSize * 0.5,
  -blockSize * 0.5,
  totalSize - blockSize * 0.5,
  totalSize - blockSize * 0.5,
];
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

//Initial values for canvas width and height
const baseWidth = 1920;
const baseHeight = 1080;
//scale everything
export let contentScale = 1;
globalThis.contentScale = () => contentScale;

//Get the biggest possible canvas that fits on the current screen, preserving aspect ratio
function getCanvasDimensions(baseWidth, baseHeight) {
  const aspectRatio = baseWidth / baseHeight;
  let [canvasWidth, canvasHeight] = [windowWidth, windowHeight];
  let [widthRatio, heightRatio] = [canvasWidth / baseWidth, canvasHeight / baseHeight];
  if (widthRatio < heightRatio) {
    [canvasWidth, canvasHeight] = [windowWidth, windowWidth / aspectRatio];
    contentScale = canvasWidth / baseWidth;
  } else {
    [canvasWidth, canvasHeight] = [windowHeight * aspectRatio, windowHeight];
    contentScale = canvasHeight / baseHeight;
  }
  return [canvasWidth, canvasHeight];
}

if (!window.Worker) {
  const errmsg = "This browser does not support Web Workers; World generation cannot proceed.";
  console.error(errmsg);
  Log.send("#4-" + errmsg);
}
//

//Worldgen analysis
let stats = {
  placed: Object.create(null),
  total: 0,
  failed: 0,
  structures: Object.create(null),
  structs: 0,
  spawned: Object.create(null),
  spawns: 0,
};
//Create or load world
const world = new World();
function sortByE1(a, b) {
  const a0 = a[0],
    b0 = b[0];
  return (
    a0 < b0 ? -1
    : a0 > b0 ? 1
    : 0
  );
}
/** @type {Worker | null} */
let worldGenWorker = null;
try {
  worldGenWorker = new Worker("assets/src/worker/generator.js", {
    name: "[World Gen]",
    type: "module",
  });
  worldGenWorker.onmessage = (ev) => {
    try {
      if (ev.data === "finish") {
        console.log("Generation finished.");
        gen.msg = "Entering World";
        for (let tick = 0; tick < preloadTicks; tick++) world.tickAll();
        //make player
        deliverPlayer(null, totalSize / 2, totalSize / 2, true, creation.corporation, world);

        world.evaluator.updateWorldForAllTeams();

        gen.inprogress = false;
        //Worldgen stats
        let log = "\n";
        stats.total = Object.values(stats.placed).reduce((a, b) => a + b, 0);
        stats.structs = Object.values(stats.structures).reduce((a, b) => a + b, 0);
        stats.spawns = Object.values(stats.spawned).reduce((a, b) => a + b, 0);
        log += "\n#### WORLD GENERATED ####";
        log += "\n//// World Breakdown ////";
        log += "\n--- Tiles and Blocks: ---";
        for (const [key, val] of Object.entries(stats.placed).sort(sortByE1)) {
          log += `\n| ${key}: ${val} (${roundNum((val / stats.total) * 100, 2)}%)`;
        }
        log += "\n------- Entities: -------";
        for (const [key, val] of Object.entries(stats.spawned).sort(sortByE1)) {
          log += `\n| ${key}: ${val}`;
        }
        log += "\n------ Structures: ------";
        for (const [key, val] of Object.entries(stats.structures).sort(sortByE1)) {
          log += `\n| ${key}: ${val}`;
        }
        log += "\n-------------------------";
        log += `\n${stats.total} total blocks`;
        log += `\n${stats.spawns} total entities`;
        log += `\n${stats.structs} total structures`;
        log += `\n${stats.failed} failed spawns and placements (${roundNum((stats.failed / (stats.total + stats.spawns)) * 100, 2)}%)`;
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
          const def = ev.data.def,
            chunk = world.chunks[def.j][def.i] ?? new Chunk(),
            layer = ev.data.layer ?? "tiles",
            target = ev.data.target;

          if (target) {
            // console.log("builder targets: " + target);
            iterate2DArray(def.entries, (e, y, x) => {
              if (e) {
                if (chunk.tiles[y][x] === target) {
                  if (Registries.tiles.has(e)) {
                    chunk[layer][y][x] = GroundTile.getNumericalID(e);
                    stats.placed[e] ??= 0;
                    stats.placed[e]++;
                  } else {
                    stats.failed++;

                    stats.placed[`~${e}`] ??= 0;
                    stats.placed[`~${e}`]++;
                  }
                }
              }
            });
          } else
            iterate2DArray(def.entries, (e, y, x) => {
              if (e)
                if (Registries.tiles.has(e)) {
                  chunk[layer][y][x] = GroundTile.getNumericalID(e);
                  stats.placed[e] ??= 0;
                  stats.placed[e]++;
                } else {
                  stats.failed++;

                  stats.placed[`~${e}`] ??= 0;
                  stats.placed[`~${e}`]++;
                }
            });
          chunk.world = world;
          chunk.i = def.i;
          chunk.j = def.j;
          world.chunks[def.j][def.i] = chunk;
          // console.log(chunk, layer);
        }
        if (ev.data.type === "build") {
          let successful = true;
          for (let block of ev.data.blocks) {
            //Create block, and overwrite properties
            if (
              world.isPositionFree(ev.data.x + block.x, ev.data.y + block.y) &&
              (!(ev.data.target || block.target) ||
                world.getBlock(ev.data.x + block.x, ev.data.y + block.y, "tiles") ===
                  (block.target ?? ev.data.target))
            ) {
              if (block.block)
                try {
                  let blk = world.placeAt(block.block, ev.data.x + block.x, ev.data.y + block.y);
                  Object.assign(blk, block.construction ?? {});

                  blk.direction = Block.dir.fromEnum(block.direction);

                  stats.placed[`​[Struct] ${block.block}`] ??= 0;
                  stats.placed[`​[Struct] ${block.block}`]++;
                } catch (e) {
                  console.warn("Worldgen Error:\n" + e);
                  successful = false;
                  stats.failed++;

                  stats.placed[`​[Struct] ~${block.block}`] ??= 0;
                  stats.placed[`​[Struct] ~${block.block}`]++;
                }
              else if (block.entity)
                try {
                  let ent = construct(Registries.entities.get(block.entity), "entity");
                  ent.addToWorld(
                    world,
                    (ev.data.x + block.x) * blockSize,
                    (ev.data.y + block.y) * blockSize,
                  );

                  ent.direction = Block.dir.fromEnum(block.direction);

                  stats.spawned[`​[Struct] ${block.entity}`] ??= 0;
                  stats.spawned[`​[Struct] ${block.entity}`]++;
                } catch (e) {
                  console.warn("Worldgen Error:\n" + e);
                  successful = false;
                  stats.failed++;

                  stats.spawned[`​[Struct] ~${block.entity}`] ??= 0;
                  stats.spawned[`​[Struct] ~${block.entity}`]++;
                }
            }
          }
          stats.structures[successful ? ev.data.name : `~${ev.data.name}`] ??= 0;
          stats.structures[successful ? ev.data.name : `~${ev.data.name}`]++;
        }
        if (ev.data.type === "ores") {
          let successful = true;
          for (let block of ev.data.ores) {
            if (block.block)
              try {
                world.setOre(block.block, ev.data.x + block.x, ev.data.y + block.y);

                stats.placed[`​[Struct Ore] ${block.block}`] ??= 0;
                stats.placed[`​[Struct Ore] ${block.block}`]++;
              } catch (e) {
                console.warn("Worldgen Error:\n" + e);
                successful = false;
                stats.failed++;

                stats.placed[`​[Struct Ore] ~${block.block}`] ??= 0;
                stats.placed[`​[Struct Ore] ~${block.block}`]++;
              }
          }
        }
        if (ev.data.type === "place") {
          if (!ev.data.target || world.getTile(ev.data.x, ev.data.y) === ev.data.target)
            if (
              ev.data.layer !== "blocks" ||
              (world.isPositionFree(ev.data.x, ev.data.y) &&
                (world.getTileData(ev.data.x, ev.data.y, "tiles")?.buildable ||
                  (ev.data.layer !== "floor" &&
                    world.getBlock(ev.data.x, ev.data.y, "floor")?.buildable)))
            ) {
              try {
                assign(
                  world.placeAt(ev.data.block, ev.data.x, ev.data.y, ev.data.layer),
                  ev.data.construction ?? {},
                );
                stats.placed[`​[Ore] ${ev.data.block}`] ??= 0;
                stats.placed[`​[Ore] ${ev.data.block}`]++;
              } catch (e) {
                console.warn("Worldgen Error:\n" + e);
                stats.failed++;

                stats.placed[`​[Ore] ~${ev.data.block}`] ??= 0;
                stats.placed[`​[Ore] ~${ev.data.block}`]++;
              }
            } else {
              stats.failed++;

              stats.placed[`​[Ore] ~${ev.data.block}`] ??= 0;
              stats.placed[`​[Ore] ~${ev.data.block}`]++;
            }
        }
      }
    } catch (e) {
      //oh shit
      console.error("Worldgen failed:\n", e);
      gen.reset();
      gen.msg = "Error!";
      ui.menuState = "title";

      Log.send(`#4-   [${e.constructor.name}] ${e.message}`);
      e.stack
        .split("\n")
        .slice(1)
        .forEach((el) => Log.send("#4-  " + el));
    }
  };

  worldGenWorker.onerror = (ev) => {
    if (ev.message) {
      let errmsg = `[World Gen] Error: \n${ev.message}\n - in ${ev.filename}\nat ${ev.lineno}:${ev.colno}`;
      console.error(errmsg, ev.error, ev);
      Log.send("#4-" + errmsg);
    } else console.error("[World Gen] Error!", ev);
    ev.preventDefault();
  };

  worldGenWorker.onmessageerror = (ev) => {
    console.warn("Message could not be deserialised.");
    Log.send("#y-Message could not be deserialised.");
  };
} catch (error) {
  console.error("Could not create worker:", error);
  Log.send("#4-World generation could not be started.");
}

const propertyReplacements = [
  ['"health":', "ḣ"],
  ['"direction":', "ḋ"],
  ['"shield":', "ּ"],
  ['"energy":', "ɞ"],
  ['"power":', "∏"],
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
  ['"world":', "ɰ"],
  ['"plasma":', "℗"],
  ["ⁿ,", "њ"],
  ["ɴ,", "ñ"],
  ["л,", "ň"],

  ["ñññññ", "ɲ"],
  ["ňňňňň", "ŋ"],

  ["false", "ɟ"],
  ["true", "ŧ"],

  ['"player"', "ַ"],
  ['"enemy"', "ế"],
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
globalThis.gg = getGame;
function getGame(name) {
  name ??= "save.game";
  return Serialiser.get(name);
}
function saveGame(name) {
  name ??= "save.game";
  //Create file
  let file = {};
  let wrld = world.serialise();
  file.world = wrld;
  file.money = game.money;
  file = JSON.stringify(file);
  //Minify the file
  //About 128(!) times smaller file size because of this
  //General find-and-replace:
  for (let replacer of propertyReplacements) {
    file = file.replaceAll(replacer[0], replacer[1]);
  }
  //Dictionary replacement:
  let dict = [];
  let num = 0;
  Registries.tiles.forEach((item, name) => {
    if (file.includes(name)) {
      dict.push([num, name]);
      num++;
    }
  });
  Registries.blocks.forEach((item, name) => {
    if (file.includes(name)) {
      dict.push([num, name]);
      num++;
    }
  });
  Registries.items.forEach((item, name) => {
    if (file.includes(name)) {
      if (!hasNameInDictArray(name, dict)) {
        dict.push([num, name]);
        num++;
      }
    }
  });
  Registries.entities.forEach((item, name) => {
    dict.push([num, name]);
    num++;
  });
  dict.forEach((val) => {
    file = file.replaceAll('"' + val[1] + '"', "⁝" + val[0] + "⁝");
  });
  //Dictionary compression: Tiles
  // file = file.replaceAll(/[0-9]+,/gi, (tile) => {
  //   return "…" + tile.substring(3, tile.length - 1);
  // });
  //Dictionary compression: RLE
  file = file.replaceAll(/(⁝[0-9]+⁝),?(?:\1,?)*/gi, (tile) => {
    let arr = tile.split(",").filter((x) => x.length > 0);
    return `×${arr.length}${arr[0]}`;
  });
  //Postdict replacers
  for (let replacer of postDictReplacers) {
    file = file.replaceAll(replacer[0], replacer[1]);
  }
  //Add dictionary to save
  file = `DICT<${dict.map((entry) => `${entry[0]}=${entry[1]}`).join("|")}>${file}`;
  let spaceUsed = sizeKB(name + file);
  Serialiser.set(name, file);
  console.log(`Game saved (${roundNum(spaceUsed, 2)}KB).`);
  Log.send(`#a-Game has been saved (${roundNum(spaceUsed, 2)}KB).`);
}

function clearData() {
  console.log("All saves deleted.");
  Log.send("#4-Stored saves deleted.");
  Serialiser.clear("pr");
}

function loadGame(name) {
  name ??= "save.game";
  //Get file
  /**@type {string} */
  let file = Serialiser.get(name);
  if (!file) {
    Log.send(`#y-There is no save at '${name}'`);
    return false;
  }
  //Deminify the file
  //Unreplace first
  let reversedPDReplacers = postDictReplacers.map((x) => x.slice(0));
  for (let replacer of reversedPDReplacers.reverse()) {
    file = file.replaceAll(
      replacer[1],
      (typeof replacer[0] === "string" ? replacer[0] : replacer[2]) ?? replacer[0],
    );
  }
  //Dictionary decompression: Run Length Decoding
  file = file
    .replaceAll(/×[0-9]+⁝[0-9]+⁝/gi, (tile) => {
      let str = tile.match(/⁝[0-9]+⁝/)[0] + ",",
        count = parseInt(tile.match(/(?<=×)[0-9]+(?=⁝)/)[0]);
      // console.log("rle'd "+count+" times '"+str+"'")
      let out = str.repeat(count);
      return out;
    })
    .replaceAll(/,]/g, "]")
    .replaceAll(/,}/g, "}");
  // console.log(file)
  let dict = [];
  file = file.replace(/DICT<.*?>/gim, (dictionary) => {
    let encoded = dictionary.substring(5, dictionary.length - 1);
    dict = encoded.split("|").map((entry) => entry.split("="));
    return "";
  });
  dict.forEach((entry) => {
    file = file.replaceAll("⁝" + entry[0] + "⁝", '"' + entry[1] + '"');
  });
  // console.log(file)
  //Unreplace
  let reversedReplacers = propertyReplacements.map((x) => x.slice(0));
  for (let replacer of reversedReplacers.reverse()) {
    file = file.replaceAll(
      replacer[1],
      (typeof replacer[0] === "string" ? replacer[0] : replacer[2]) ?? replacer[0],
    );
  }
  // console.log(file)
  effectTimer.cancel("*");
  effects.screenShakeInstances.splice(0);

  file = JSON.parse(file);
  game.money = file.money ?? 10000;
  world.become(World.deserialise(file.world));
  console.log("Game loaded.");
  Log.send(`#a-Game loaded.`);
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
  loadStats.images = 0;
  loadStats.cutscenes = 0;
  loadStats.totalImages = PreloadRegistries.images.size;
  loadStats.totalCutscenes = PreloadRegistries.cutscenes.size;
  await fonts.load();
  console.log("Loaded fonts.");
  PreloadRegistries.images.forEach((el, name) => {
    if (el.type === "repo") {
      console.log("repository - ", el.items);
      [...el.items].forEach((x) => {
        if (!Registries.images.has(x[0]))
          Registries.images.add(x[0], new ImageContainer(x[1] ?? x[0]));
      });
    } else if (!Registries.images.has(name))
      Registries.images.add(name, new ImageContainer(el.path));
  });
  await Registries.images.forEachAsync(async (el, name) => {
    await el.load();
    loadStats.images++;
  });
  console.log(`Loaded ${loadStats.images}/${loadStats.totalImages} images.`);
  await PreloadRegistries.cutscenes.forEachAsync(async (el, name) => {
    if (!Registries.cutscenes.has(name))
      Registries.cutscenes.add(name, await Cutscene.from(el.path));
    loadStats.cutscenes++;
  });
  console.log(`Loaded ${loadStats.cutscenes}/${loadStats.totalCutscenes} cutscenes.`);

  PreloadRegistries.stati.forEach((el, name) => {
    if (!Registries.statuses.has(name))
      Registries.statuses.add(name, constructFromType(el, StatusEffect));
  });

  createCorporationSelectors();

  GroundTile.reloadIDs();

  loadStats.hide();
  console.log("All assets loaded.");
};
//Set up the canvas, using the previous function
globalThis.setup = function () {
  let cnv = createCanvas(...getCanvasDimensions(baseWidth, baseHeight));
  cnv.addEventListener("contextmenu", (event) => event.preventDefault());
  rectMode(CENTER);
  imageMode(CENTER);
  colorMode("rgb", 255);
  textFont(fonts.darktech);
  textStyle("normal");
  Space.setup();
  setupTips();
};

async function generateWorld(seed) {
  gen.started = true;
  gen.inprogress = true;
  gen.progress = 0;
  gen.msg = "Generating World...";
  world.prepareForGeneration();
  world.name = creation.name;
  console.log("Generation started");
  worldGenWorker.postMessage({ type: "generate", seed: seed });
  framesToDraw = 0;
}

//Change the size if the screen size changes
window.windowResized = function () {
  resizeCanvas(...getCanvasDimensions(baseWidth, baseHeight));
};

function frameSkippingFunction(func) {
  if (framesToDraw > 1000) {
    func();
    framesToDraw = 0;
    return;
  }
  let st = framesToDraw;
  for (let fr = 0; fr < st - 1; fr++) {
    func();
    framesToDraw--;
  }
}

let errored = false;
window.draw = function () {
  push();
  translate(width / 2, height / 2);
  scale(contentScale);
  Log.tick();
  try {
    //Draw the void
    clear(128 + Math.sin(frameCount / 120) * 128, 255);
    noStroke();
    noFill();
    if (!errored) frame();
    else {
      drawNeutralBackground();
    }
    if (keyIsDown(32)) errored = false;
  } catch (error) {
    errored = true;
    console.error("caught:\n", error);
    Log.send("#4-Project: Reassembly has encountered an error:");
    Log.send(`#4-   [${error.constructor.name}] ${error.message}`);
    error.stack
      .split("\n")
      .slice(1)
      .forEach((el) => Log.send("#4-  " + el));
    Log.send("#4-Press [Space] to continue");
    //addEventListener("keydown", fixError);
    noLoop();
    loop();
  }
  Log.draw();
  pop();
};

window.postProcess = function () {
  push();
  //Corruption/glitch effect
  imageMode(CORNER);
  if (effects.corruption)
    for (let i = 0; i < effects.corruptionCount; i++) {
      let x = random(-effects.corruptionOffset, 1920),
        y = random(-effects.corruptionOffset, 1080);
      let tile = get(
        x,
        y,
        random(effects.corruptionSize, 1920 + effects.corruptionOffset),
        random(effects.corruptionHeight / 2, effects.corruptionHeight),
      );
      for (let j = 0; j < effects.corruptionCopies; j++)
        image(
          tile,
          x + rnd.float(-effects.corruptionOffset, effects.corruptionOffset),
          y + rnd.float(-effects.corruptionOffset, effects.corruptionOffset),
        );
    }
  pop();
};

function frame() {
  //Frameskip stuff
  framesToDraw += deltaTime / timePerFrame;
  Decoration.timer.tick();
  if (gen.inprogress) {
    drawNeutralBackground();

    // pop();
    // push();
    textFont(fonts.darktech);
    fill(0);
    stroke(255, 200, 0);
    strokeWeight(6);
    textAlign(CENTER);
    textSize(40);
    text(gen.msg, 0, 0);
    strokeWeight(3);
    fill(0);
    rectMode(CORNER);
    rect(-600, 45, 1200, 30);
    rect(-400, 120, 800, 20);
    fill(230, 170, 0);
    let w = 1200 * gen.progress;
    let w2 = 800 * gen.stageProgress;
    rect(-600, 45, w, 30);
    rect(-400, 120, w2, 20);
    textFont(fonts.ocr);
    textAlign(CENTER, CENTER);
    fill(255);
    noStroke();
    textSize(18);
    text(`${(gen.progress * 100).toFixed(2)}%`, 0, 60);
    textSize(12);
    text(
      `Stage ${Registries.worldgen.size * gen.stageProgress}/${Registries.worldgen.size}`,
      0,
      130,
    );
  } else {
    //Draw everything else
    if (ui.menuState === "in-game") {
      if (!gen.started) {
        if (gen.mode === "create")
          generateWorld(); //2147483647
        else if (gen.mode === "load") {
          if (loadGame()) gen.started = true;
          else gen.mode = "create";
        } else throw new Error("No generation mode! Use 'create' or 'load'.");
        return;
      }
      gameFrame();
      if (effects.lighting) lighting(effects.shadeColour, effects.lightColour, effects.lightScale);
    } else if (ui.menuState === "new-game") {
    } else {
      drawNeutralBackground();
    }
    fpsUpdate();
    uiFrame();
    if (!ui.waitingForMouseUp) mouseInteraction();
    if (!game.paused && game.player) {
      if (!ui.mouse.left && game.player.punchChargeR > 0) game.player.releasePunchRight();
      if (!ui.mouse.right && game.player.punchChargeL > 0) game.player.releasePunchLeft();
    }
  }
}

export function drawNeutralBackground(yo = 0) {
  time++;
  push();
  fill(0);
  rect(0, yo, 1920, 1080);
  noStroke();
  fill(255, 200, 0);
  // rotatedShape("square", 0, 0, size * 0.6, size * 0.6, frameCount / 100);
  // rotatedShape("square", 0, 0, size * 0.8, size * 0.8, 2 + -frameCount / 100);
  for (let offset = 0; offset < Math.ceil((1920 * 2) / 3); offset += 20) {
    rotatedShape("rect", -1920 + (((time + offset) * 3) % (1920 * 2)), yo, 20, 1080 * 1.43, PI / 4);
  }
  fill(40);
  rect(0, yo, 1920, 1080 * 0.85);
  noFill();
  stroke(60);
  strokeWeight(15);
  rect(0, yo, 1920 * 1.2, 1080);
  strokeWeight(10);
  rect(0, yo, 1920 * 1.2, 1080 * 0.85);
  noStroke();
  fill(80);
  rect(0, yo - 555, 1920, 20);
  fill(20);
  rect(0, yo + 555, 1920, 20);
  pop();
}

function fpsUpdate() {
  //calculate FPS
  if (frameRate && ui?.previousFPS) {
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

ui.addReset("paused:false");
ui.addReset("menu:none");
ui.addReset("containerselected:false");
ui.addReset("dead:no");
ui.addReset("boss:no");
ui.addReset("mode:build");

function uiFrame() {
  Inventory.tooltip = null;
  //Tick UI
  UIComponent.setCondition("containerselected:" + (Container.selectedBlock instanceof Container));
  updateUIActivity();
  tickUI();
  //Reset mouse held status
  if (ui.waitingForMouseUp && !mouseIsPressed) ui.waitingForMouseUp = false;
  //Draw UI and mouse pos
  if (
    gen.started &&
    !gen.inprogress &&
    ui.menuState === "in-game" &&
    UIComponent.evaluateCondition("mode:build")
  ) {
    ui.hoveredBlock = world.getBlock(game.mouse.blockX, game.mouse.blockY);
    if (ui.hoveredBlock) ui.hoveredBlock.highlight();
    let conblock = Container.selectedBlock;
    if (conblock) {
      conblock.highlight(true);
      conblock.drawTooltip(
        conblock.uiX + blockSize * 0.5 * ui.camera.zoom,
        conblock.uiY - blockSize * 0.5 * ui.camera.zoom,
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
  if (world.impactParticles.length > 0) return;
  effectTimer.tick();
  respawnTimer.tick();
}

function gameFrame() {
  push();
  frameSkippingFunction(() => {
    if (!game.paused) {
      tickTimers();
      if (game.player) {
        if (world.impactParticles.length == 0) movePlayer();
        if (!freecam) {
          ui.camera.x -= (ui.camera.x - game.player.x) * 0.1;
          ui.camera.y -= (ui.camera.y - game.player.y) * 0.1;
        }
      } else UIComponent.setCondition("dead:yes");
      effects.applyShake();
      world.tickAll();
      checkCreatedEntities();
    }
  });
  UIComponent.setCondition("boss:" + (world.hasBoss() ? "yes" : "no"));
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
  if (ui.texteditor.active) return (game.player.controllable = false);
  if (keyIsDown(ALT) || game.player.dead) {
    freecam = true;
    UIComponent.setCondition("fc:true");
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
    game.player.controllable = false;
  } else {
    freecam = false;
    UIComponent.setCondition("fc:false");
    game.player.controllable = true;
  }
}

function updateUIActivity() {
  if (!keyIsDown(CONTROL)) {
    ui.lastMousePos.x = ui.mouse.x;
    ui.lastMousePos.y = ui.mouse.y;
  }
  //Check each component, but only do it once.
  for (let component of ui.components) {
    component.updateActivity();
  }
}

function drawUI() {
  textFont(fonts.ocr);
  textStyle("normal");
  textSize(20);
  textAlign(LEFT, CENTER);
  for (let component of ui.components) {
    if (component.active) {
      component.draw();
    }
  }
}

function tickUI() {
  ui.timer.tick();
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
  if (debug.position) {
    textAlign(CENTER, CENTER);
    textFont(fonts.ocr);
    stroke(0);
    strokeWeight(2);
    textSize(20);
    fill(255, 150, 150);
    text(
      "UI X:" + Math.round(ui.mouse.x) + " Y:" + Math.round(ui.mouse.y),
      ui.mouse.x,
      ui.mouse.y - (ui.menuState === "in-game" ? 80 : 20),
    );
    if (ui.menuState === "in-game") {
      fill(0, 200, 255);
      text(
        "Block X:" + Math.round(game.mouse.blockX) + " Y:" + Math.round(game.mouse.blockY),
        ui.mouse.x,
        ui.mouse.y - 60,
      );
      fill(0, 255, 200);
      text(
        "Player X:" + Math.round(game.player.x) + " Y:" + Math.round(game.player.y),
        ui.mouse.x,
        ui.mouse.y - 40,
      );
      fill(255);
      text(
        "Mouse X:" + Math.round(game.mouse.x) + " Y:" + Math.round(game.mouse.y),
        ui.mouse.x,
        ui.mouse.y - 20,
      );
    }
  }
  const mouseSize = 15;
  stroke(255, 0, 0);
  strokeWeight(2);
  line(
    ui.lastMousePos.x - mouseSize,
    ui.lastMousePos.y,
    ui.lastMousePos.x + mouseSize,
    ui.lastMousePos.y,
  );
  line(
    ui.lastMousePos.x,
    ui.lastMousePos.y - mouseSize,
    ui.lastMousePos.x,
    ui.lastMousePos.y + mouseSize,
  );
  stroke(255);
  line(ui.mouse.x - mouseSize, ui.mouse.y, ui.mouse.x + mouseSize, ui.mouse.y);
  line(ui.mouse.x, ui.mouse.y - mouseSize, ui.mouse.x, ui.mouse.y + mouseSize);
  pop();
}
/**
 * @param {Player | null} player
 */
function createPlayer(player = null, x, y, playerType = "iti-player") {
  if (!player) {
    player = construct(Registries.entities.get(playerType));
    player.addToWorld(world, x ?? totalSize / 2, y ?? totalSize / 2);
  }
  game.player = player;
  if (x !== undefined) game.player.x = x;
  if (y !== undefined) game.player.y = y;

  //Change to an accessor property
  Object.defineProperty(game.player, "target", {
    get: () => game.mouse, //This way, I only have to set it once.
  });
}
function mouseInteraction() {
  if (
    ui.menuState === "in-game" &&
    ui.mouse.down &&
    !ui.waitingForMouseUp &&
    game.player?.controllable &&
    ui.conditions.menu === "none"
  ) {
    if (ui.conditions.mode === "build") {
      // press both buttons to replace blocks
      if (ui.mouse.right) tryBreak();
      if (ui.mouse.left) tryPlace();
    } else if (ui.conditions.mode === "fight") {
      if (!Inventory.mouseItemStack.isEmpty()) {
        Inventory.mouseItemStack.getItem().useInAir(game.player, Inventory.mouseItemStack);
        return;
      }
      if (ui.waitingForMouseUp) return;

      // LMB = right hand // primary mouse button -> dominant hand
      if (ui.mouse.left) {
        const rhi = game.player.rightHand.get(0);
        if (rhi instanceof ItemStack && rhi.getItem() instanceof Equippable)
          rhi.getItem().use(game.player, keyIsDown(SHIFT));
        else game.player.chargePunchRight();
      }
      if (ui.mouse.right) {
        const lhi = game.player.leftHand.get(0);
        if (lhi instanceof ItemStack && lhi.getItem() instanceof Equippable)
          lhi.getItem().use(game.player, keyIsDown(SHIFT));
        else game.player.chargePunchLeft();
      }
    }
  }
}

function tryBreak() {
  if (!Inventory.mouseItemStack.isEmpty()) {
    DroppedItemStack.create(
      Inventory.mouseItemStack,
      world,
      game.player.x,
      game.player.y,
      10,
      game.player.direction + rnd.float(-10, 10),
    );
    Inventory.mouseItemStack.clear();
    ui.waitingForMouseUp = true;
    return;
  }
  let block = world.getBlock(game.mouse.blockX, game.mouse.blockY);
  if (block && block.team === game.player.team && ui.conditions.mode === "build")
    if (block.dropItem) {
      //Break breakables

      if (block.break(BreakType.deconstruct))
        if (block === Container.selectedBlock) Container.selectedBlock = null;
      return;
    }
  if (ui.conditions.mode === "fight") {
    if (
      game.player.leftHand.get(0) instanceof ItemStack &&
      game.player.leftHand.get(0).getItem() instanceof Equippable
    )
      game.player.leftHand.get(0).getItem().use(game.player, true);
  }
}

function tryPlace() {
  let heldItem = Inventory.mouseItemStack.getItem();
  let clickedBlock = world.getBlock(game.mouse.blockX, game.mouse.blockY);
  if (
    clickedBlock &&
    clickedBlock.team === game.player.team &&
    clickedBlock.interaction(game.player, Inventory.mouseItemStack)
  )
    return;
  //Place items on free space
  if (heldItem instanceof PlaceableItem) {
    //If space is free, and buildable
    if (
      world.getBlock(game.mouse.blockX, game.mouse.blockY, "floor")?.buildable ||
      (Registries.tiles.get(world.getTile(game.mouse.blockX, game.mouse.blockY)).buildable ?? true)
    ) {
      if (
        heldItem.place(
          Inventory.mouseItemStack,
          game.mouse.blockX,
          game.mouse.blockY,
          selectedDirection,
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
  if (clickedBlock && clickedBlock.selectable && clickedBlock.team === game.player.team) {
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
    Inventory.mouseItemStack.getItem().useInAir(game.player, Inventory.mouseItemStack);
  if (Inventory.mouseItemStack?.isEmpty()) Inventory.mouseItemStack = ItemStack.EMPTY;
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

let db = false;
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
      ui.texteditor.text = ui.texteditor.text.substring(0, ui.texteditor.text.length - 1);
    return false;
  }
  //hold grave to log keys
  if (keyIsDown("`")) console.log(ev, key);

  //Hotkeys

  // debug
  if (key === "f3") {
    UIComponent.setCondition("debugging:true");
  } else if (UIComponent.evaluateCondition("debugging:true")) {
    console.log("debug: " + key);
    UIComponent.setCondition("debugging:false");

    if (key === "b") {
      debug.hitboxes = !debug.hitboxes;
      Log.send(`#7-[#@-Debug#7-] Hitboxes ${debug.hitboxes ? "shown" : "hidden"}`);
    } else if (key === "a") {
      debug.ai = !debug.ai;
      Log.send(`#7-[#@-Debug#7-] AI targets and areas ${debug.ai ? "shown" : "hidden"}`);
    } else if (key === "c") {
      debug.chunkBorders = !debug.chunkBorders;
      Log.send(`#7-[#@-Debug#7-] Chunk borders ${debug.chunkBorders ? "shown" : "hidden"}`);
    } else if (key === "t") {
      UIComponent.setCondition(
        "debug-tools:" + (UIComponent.evaluateCondition("debug-tools:true") ? "false" : "true"),
      );
      Log.send(
        `#7-[#@-Debug#7-] Debug tools ${UIComponent.evaluateCondition("debug-tools:true") ? "shown" : "hidden"}`,
      );
    } else if (key === "r") {
      debug.regionBorders = !debug.regionBorders;
      Log.send(`#7-[#@-Debug#7-] Region borders ${debug.regionBorders ? "shown" : "hidden"}`);
    } else if (key === "p") {
      debug.position = !debug.position;
      Log.send(`#7-[#@-Debug#7-] Cursor position ${debug.position ? "shown" : "hidden"}`);
    } else if (key === "x") {
      debug.text = !debug.text;
      Log.send(`#7-[#@-Debug#7-] Text blocks ${debug.text ? "shown" : "hidden"}`);
    } else if (key === "escape") {
      for (const key in debug) {
        debug[key] = false;
      }
      Log.send(`#7-[#@-Debug#7-] Disabled everything.`);
    }
  }
  //Pause / unpause
  else if (key === " ") togglePause();
  // save/load, ctrl buttons
  else if (ev.ctrlKey && ui.menuState === "in-game") {
    if (key === "j") saveGame();
    if (key === "k") loadGame();
  }
  // close menu
  else if (key === "escape" && !UIComponent.evaluateCondition("menu:none"))
    UIComponent.setCondition("menu:none");
  //Inventory
  else if (key === "e") {
    if (UIComponent.evaluateCondition("menu:inventory")) UIComponent.setCondition("menu:none");
    else UIComponent.setCondition("menu:inventory");
  }
  //DevTools and fullscreen
  else if (key === "f12" || key === "f11") return true;
  //Recipe controls
  else if (key === "arrowright") nextRecipe();
  else if (key === "arrowleft") prevRecipe();
  else if (key === "arrowup") UIComponent.setCondition("mode:build");
  else if (key === "arrowdown") UIComponent.setCondition("mode:fight");
  //Command line
  else if (key === "/") openCommandLine();
  //Hotkeys
  else if (key === "b") {
    if (UIComponent.evaluateCondition("mode:build")) UIComponent.setCondition("mode:fight");
    else UIComponent.setCondition("mode:build");
  } else if (UIComponent.evaluateCondition("mode:build")) {
    if (key === "1") game.player.inventory.hotkeySlot(0, true);
    else if (key === "2") game.player.inventory.hotkeySlot(1, true);
    else if (key === "3") game.player.inventory.hotkeySlot(2, true);
    else if (key === "4") game.player.inventory.hotkeySlot(3, true);
    else if (key === "5") game.player.inventory.hotkeySlot(4, true);
    else if (key === "6") game.player.inventory.hotkeySlot(5, true);
    else if (key === "7") game.player.inventory.hotkeySlot(6, true);
    else if (key === "8") game.player.inventory.hotkeySlot(7, true);
    else if (key === "9") game.player.inventory.hotkeySlot(8, true);
    else if (key === "0") game.player.inventory.hotkeySlot(9, true);
  }
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
    if (command.startsWith("/")) command = command.substring(1);
    exec(command, new ExecutionContext(game.player.x, game.player.y, game.player));
    cmdHistory.unshift(command);
    histIndex = -1;
  };
}
/**@param {KeyboardEvent} ev  */
window.keyTyped = function (ev) {
  if (tcursor.active)
    capturedInput(
      ev.shiftKey || ev.getModifierState("CapsLock") ? key.toUpperCase() : key.toLowerCase(),
    );
  if (!ui.texteditor.active) return false;
  // if (key === "/") return false;
  if (key === "c" && ev.ctrlKey) navigator.clipboard.writeText(ui.texteditor.text);
  else if (key === "x" && ev.ctrlKey)
    navigator.clipboard.writeText(ui.texteditor.text).then((x) => (ui.texteditor.text = ""));
  else if (key === "v" && ev.ctrlKey)
    navigator.clipboard.readText(ui.texteditor.text).then((v) => (ui.texteditor.text = v));
  else {
    ui.texteditor.text +=
      ev.shiftKey || ev.getModifierState("CapsLock") ? key.toUpperCase() : key.toLowerCase();
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
    ui.camera.zoom = roundNum(clamp(ui.camera.zoom - ev.delta * zoomSpeed, 0.25, 5), 2);
    //fix zooming holes
    world.resetRenderer();
  }
  //scroll normally to change block placement direction
  else
    selectedDirection = (ev.delta > 0 ? Block.dir.rotateAntiClockwise : Block.dir.rotateClockwise)(
      selectedDirection,
    );
  return false;
};
/**
 * @param {World} world
 */
// function eventify(world) {
//   // spawn an iti merchant in 5 mins
//   world.addEvent("iticorpspawn", 18000, (world) => {
//     Log.send("#i-ITI have sent a merchant to trade");
//     let entiti = construct(Registries.entities.get("iti-corporate-merchant"), "entity");
//     entiti.x = game.player.x + rnd.float(300, 800) * (tru(0.5) ? -1 : 1);
//     entiti.y = game.player.y + rnd.float(300, 800) * (tru(0.5) ? -1 : 1);
//     deliverEntity(entiti, true, world);
//   });
//   //bossfight in 3-ish mins
//   world.addEvent("scrapboss-warning", 36000, (world) => {
//     Log.send("#d-The Scrapper is descending...");
//   });
//   //bossfight
//   world.addEvent("scrapboss", 46800, (world) => {
//     Log.send("#4-The Scrapper has descended!");
//     let entiti = construct(Registries.entities.get("scrapper"), "entity");
//     entiti.x = game.player.x + rnd.float(300, 800) * (tru(0.5) ? -1 : 1);
//     entiti.y = game.player.y + rnd.float(300, 800) * (tru(0.5) ? -1 : 1);
//     deliverEntity(entiti, true, world);
//   });
// }

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

window.world = world;

export { clearData, createPlayer, effects, fonts, game, gen, loadGame, saveGame, world };

