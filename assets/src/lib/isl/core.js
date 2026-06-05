import { ISLExtension } from "https://cdn.jsdelivr.net/gh/LightningLaser8/ISL@main/core/extensions.js";
import {
  ISLError,
  ISLInterpreter,
} from "https://cdn.jsdelivr.net/gh/LightningLaser8/ISL@main/core/interpreter.js";

export { ISLError, ISLExtension, ISLInterpreter };

  import { Entity } from "../../classes/entity/entity.js";
  import { DroppedItemStack } from "../../classes/item/dropped-itemstack.js";
  import { PhysicalObject } from "../../classes/physical.js";
  import { REGION_SIZE } from "../../classes/world/factory-valuations.js";
  import { rnd, Vector } from "../../core/number.js";
  import { Registries } from "../../core/registry.js";
  import { game, world } from "../../play/game.js";
  import { Log } from "../../play/messaging.js";
  import { blockSize, chunkSize } from "../../scaling.js";

export class ExecutionContext {
  get isEntity() {
    return this.self instanceof Entity;
  }
  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {PhysicalObject} self
   */
  constructor(x, y, self) {
    this.x = x;
    this.y = y;
    this.self = self;
  }
}
//Util
export let quietMode = false;

const REMOVE = "!",
  ADD = "+",
  FILTER = ">",
  CLAUSE = "|";

function parseSelector(sel) {
  const str = `${sel}`;
  let actions = [];
  let started = 0,
    mode = "";
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if ((char === REMOVE) | (char === ADD) | (char === FILTER) | (char === CLAUSE)) {
      actions.push({ mode, sel: str.substring(started, i) });
      started = i + 1;
      mode = char;
    }
  }
  actions.push({ mode, sel: str.substring(started) });
  return actions;
}

/**
 * Gets a subset of entities according to a compound selector.
 * @param {ExecutionContext} ctx Execution context.
 * @param {string} selector Selector string, without the @.
 * @param {Entity[]} source Where to select entities from.
 * @returns {Entity[]} Entities from `source` matching `selector`.
 */
export function select(ctx, selector, source = world.entities) {
  // console.log(`Selecting @${selector} from ${source.length} entities.`);
  const acts = parseSelector(selector);
  // console.log(`Actions: ${acts.map((x) => `${x.mode} ${x.sel}`)}`);
  const osource = source;
  let result = [];
  for (const action of acts) {
    // console.log(`Action: ${action.mode} ${action.sel}`);
    switch (action.mode) {
      case ADD:
        // console.log(`Adding: ... or @${action.sel}`);
        source = [...new Set(source.concat(oneselect(ctx, action.sel, world.entities)))];
        // console.log(`Matched ${source.length} entities.`);
        break;
      case FILTER:
        // console.log(`Filtering: ... where @${action.sel}`);
        source = oneselect(ctx, action.sel, source);
        // console.log(`Matched ${source.length} entities.`);
        break;
      case REMOVE:
        // console.log(`Removing: ... without @${action.sel}`);
        // console.log(`removing ${torem.length} items`);
        source = [...new Set(source).difference(new Set(oneselect(ctx, action.sel, source)))];
        // console.log(`Matched ${source.length} entities.`);
        break;
      case CLAUSE:
        // console.log(`Saving and making new: @${action.sel}`);
        result.push(...source);
        source = oneselect(ctx, action.sel, world.entities);
        // console.log(`Matched ${source.length} entities.`);
        break;
      default:
        // console.log(`Replacing: @${action.sel}`);
        source = oneselect(ctx, action.sel, osource);
      // console.log(`Matched ${source.length} entities.`);
    }
  }
  result.push(...source);
  // console.log(`Matched ${source.length} entities.`);
  return result;
}
/**
 * Gets a subset of entities according to a selector.
 * @param {ExecutionContext} ctx Execution context.
 * @param {string} selector Selector string, without the @.
 * @param {Entity[]} source Where to select entities from.
 */
function oneselect(ctx, selector, source) {
  switch (selector) {
    // Constants (ish)
    case "s":
    case "self":
      return [ctx.self];
    case "p":
    case "player":
      return [game.player];

    // General selectors
    case "t":
    case "team":
    // nothing for now, but may change if i add alliances
    case "a":
    case "ally":
      return source.filter((e) => e.team && e.team === ctx.self?.team);
    case "n":
    case "enemy":
      return source.filter((e) => e.team && e.team !== ctx.self?.team);

    case "e":
    case "everything":
      return source;

    case "l":
    case "living":
      return source.filter((e) => !(e instanceof DroppedItemStack));
    case "i":
    case "item":
      return source.filter((e) => e instanceof DroppedItemStack);

    // Utility selectors
    case "r":
    case "random":
      return source.length === 0 ? [] : [rnd.in(source)];

    case "":
    case "w":
    case "newest":
      return source.length === 0 ? [] : [newestIn(source)];

    case "c":
    case "closest":
      return source.length === 0 ? [] : [closestInToPoint(source, ctx.x, ctx.y)];

    default:
      // select corporations @iti
      if (Registries.corps.has(selector))
        return source.filter((e) => e.team.toLowerCase() === selector.toLowerCase());
      // select entity types @=scavenger
      const ss1 = selector.substring(1);
      if (Registries.entities.has(ss1) && selector.startsWith("="))
        return source.filter((e) => e.registryName.toLowerCase() === ss1.toLowerCase());
      // select property values!
      const ss2 = selector.slice(1, -1);
      if (selector.startsWith("{") && selector.endsWith("}")) {
        const ci = ss2.indexOf(":");
        // match `[prop]` being the presence of `prop` on `entity`
        if (ci === -1) return source.filter((e) => ss2.trim() in e);
        // match `[prop:value]` being `entity.prop == value`
        else
          return source.filter(
            (e) => ss2.substring(ci + 1).trim() === `${e[ss2.substring(0, ci)]}`.trim(),
          );
      }
      feedback(`#eiInvalid selector: @${selector}`);
      return [];
  }
}
/**
 *
 * @param {Entity[]} array
 * @param {number} x
 * @param {number} y
 */
function closestInToPoint(array, x, y) {
  let dist = Infinity,
    chosen = null;
  for (const ent of array) {
    const d = ent.distanceToPoint(x, y);
    if (d < dist) {
      dist = d;
      chosen = ent;
    }
  }
  return chosen;
}
/**
 *
 * @param {Entity[]} array
 */
function newestIn(array) {
  let age = Infinity,
    chosen = null;
  for (const ent of array) {
    if (ent.age < age) {
      age = ent.age;
      chosen = ent;
    }
  }
  return chosen;
}

/** Does something to a selection of entities in the current context.
 * @param {string} selector Selector, optionally with the @ symbol.
 * @param {(target: Entity) => boolean} action What to do to the entities. Return true if the operation succeeded.
 * @returns {string} A description of the entities affected (i.e. those for which `true` was returned.)
 */
export function doTo(selector, action) {
  const type = selector[0];
  const matches = new Set(
    type === "@" ? select(ctx, selector.substring(1))
    : type === "#" ? select(ctx, selector.substring(1), created)
    : select(ctx, selector),
  );
  let ents = new Map();
  for (const ent of matches) {
    // console.log(`For ${ent.name}:`);
    if (action(ent)) ents.set(ent.name, (ents.get(ent.name) ?? 0) + 1);
  }
  return ents.size === 0 ?
      "nothing"
    : [...ents].map((v) => (v[1] === 1 ? `#7i${v[0]}#7i` : `#7i${v[1]}x ${v[0]}#7i`)).join(", ");
}

export function getCTX() {
  return ctx;
}
export function setCTX(newctx) {
  ctx = newctx;
}
/** @type {ExecutionContext} */
let ctx = null;

export function addCreatedEntity(newent) {
  created.push(newent);
}
export function checkCreatedEntities() {
  for (let i = 0; i < created.length; i++) {
    const ent = created[i];
    if (ent.dead) {
      created.splice(i, 1);
      i--;
    }
  }
}
/**@type {Entity[]} */
let created = [];

export function getPos(x, y) {
  // console.log(ctx, x?.value, y?.value);
  let obj = new Vector(
    x ?
      x.type === "relpos" ? ctx.x + parseFloat(x.value.substring(1))
      : x.type === "blockpos" ? parseFloat(x.value.slice(0, -1)) * blockSize
      : x.type === "chunkpos" ? parseFloat(x.value.slice(0, -1)) * blockSize * chunkSize
      : x.type === "regionpos" ? parseFloat(x.value.slice(0, -1)) * blockSize * REGION_SIZE
      : x.type === "blockrelpos" ? ctx.x + parseFloat(x.value.slice(1, -1)) * blockSize
      : x.type === "chunkrelpos" ? ctx.x + parseFloat(x.value.slice(1, -1)) * blockSize * chunkSize
      : x.type === "regionrelpos" ?
        ctx.x + parseFloat(x.value.slice(1, -1)) * blockSize * REGION_SIZE
      : x.type === "here" ? ctx.x
      : x.value
    : ctx.x,
    y ?
      y.type === "relpos" ? ctx.y + parseFloat(y.value.substring(1))
      : y.type === "blockpos" ? parseFloat(y.value.slice(0, -1)) * blockSize
      : y.type === "chunkpos" ? parseFloat(y.value.slice(0, -1)) * blockSize * chunkSize
      : y.type === "regionpos" ? parseFloat(y.value.slice(0, -1)) * blockSize * REGION_SIZE
      : y.type === "blockrelpos" ? ctx.y + parseFloat(y.value.slice(1, -1)) * blockSize
      : y.type === "chunkrelpos" ? ctx.y + parseFloat(y.value.slice(1, -1)) * blockSize * chunkSize
      : y.type === "regionrelpos" ?
        ctx.y + parseFloat(y.value.slice(1, -1)) * blockSize * REGION_SIZE
      : y.type === "here" ? ctx.y
      : y.value
    : ctx.y,
  );
  if (typeof obj.x !== "number" || typeof obj.y !== "number")
    throw new ISLError(
      `Positions must be numbers (got [${typeof obj.x},${typeof obj.y}])!`,
      TypeError,
    );
  if (isNaN(obj.x) || isNaN(obj.y)) throw new ISLError(`Position is invalid (NaN).`, TypeError);
  return obj;
}
export function feedback(msg) {
  if (!quietMode) Log.send(`#niISL#7i> ${msg}`);
}
export const core = new ISLExtension("pr-core");

// core.addType("rloc<item>", (val) => Registries.items.has(val) && !Registries.blocks.has(val));
// core.addType("rloc<block>", (val) => Registries.blocks.has(val) && !Registries.items.has(val));
// core.addType("rloc<placeable>", (val) => Registries.blocks.has(val) && Registries.items.has(val));
// core.addType("rloc<status>", (val) => Registries.statuses.has(val));
// core.addType("rloc<entity>", (val) => Registries.entities.has(val));
// core.addType("rloc<corporation>", (val) => Registries.corps.has(val));
// core.addType("rloc<cutscene>", (val) => Registries.cutscenes.has(val));
// core.addType("rloc<vfx>", (val) => Registries.vfx.has(val));
core.addType("entity", (v) => ["@", "#"].includes(`${v}`[0]));
core.addType("block", () => false);
core.addType("here", (v) => v == "~");
core.addType("blockpos", (v) => `${v}`.endsWith("b") && !isNaN(parseFloat(`${v}`.slice(0, -1))));
core.addType("regionpos", (v) => `${v}`.endsWith("r") && !isNaN(parseFloat(`${v}`.slice(0, -1))));
core.addType("chunkpos", (v) => `${v}`.endsWith("c") && !isNaN(parseFloat(`${v}`.slice(0, -1))));

core.addType(
  "blockrelpos",
  (v) => `${v}`.startsWith("~") && `${v}`.endsWith("b") && !isNaN(parseFloat(`${v}`.slice(1, -1))),
);
core.addType(
  "regionrelpos",
  (v) => `${v}`.startsWith("~") && `${v}`.endsWith("r") && !isNaN(parseFloat(`${v}`.slice(1, -1))),
);
core.addType(
  "chunkrelpos",
  (v) => `${v}`.startsWith("~") && `${v}`.endsWith("c") && !isNaN(parseFloat(`${v}`.slice(1, -1))),
);

export const positionType =
  "number|relpos|here|blockpos|chunkpos|regionpos|blockrelpos|regionrelpos|chunkrelpos";

export function makeInterpreter(env) {
  return new ISLInterpreter({
    environment: env,
    onlog: (msg) => {
      console.log("[ISL Log] " + msg);
      (msg + "").split("\n").forEach((val) => Log.send(val));
    },
    onwarn: (msg) => {
      console.log("[ISL Warning] " + msg);
      (msg + "").split("\n").forEach((val) => Log.send("#e-" + val));
    },
    onerror: (msg) => {
      if (msg.includes("Error detected")) {
        if (!quietMode) {
          Log.send("#niISL#4i> Could not complete operation: ");
          `${msg}`
            .split("\n")[1]
            .split(",")
            .forEach((x) => Log.send("#4i    " + x));
        }
      } else `${msg}`.split("\n").forEach((val) => Log.send("#4i" + val));
      console.log(`[ISL Error] ${msg}`);
    },
  });
}

/**
 *
 * @param {string} cmd Command to execute.
 * @param {ExecutionContext} context Options for executing this command.
 * @param {ISLInterpreter} interp Interpreter to use.
 */
export function runCommand(cmd, context, interp) {
  if (!context) throw new SyntaxError("Execution context is not defined!");
  setCTX(context);
  interp.executeLine(cmd);
}
