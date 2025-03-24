//Yes, this stuff.
//Why make a command line language when there's a perfectly good one right here?
import {
  ISLInterpreter,
  ISLError,
} from "https://cdn.jsdelivr.net/gh/LightningLaser8/ISL@main/core/interpreter.js";
import { ISLExtension } from "https://cdn.jsdelivr.net/gh/LightningLaser8/ISL@main/core/extensions.js";
//Util
function feedback(msg) {
  Log.send("ISL> " + msg, [200, 200, 200], "italic");
}
function getPos(x, y) {
  let obj = {
    x: x
      ? x.type === "relpos"
        ? ctx.x + parseFloat(x.value.substring(1))
        : x.type === "identifier" && x.value === "~"
        ? ctx.x
        : x.value
      : ctx.x,
    y: y
      ? y.type === "relpos"
        ? ctx.y + parseFloat(y.value.substring(1))
        : y.type === "identifier" && y.value === "~"
        ? ctx.y
        : y.value
      : ctx.y,
  };
  if (typeof obj.x !== "number" || typeof obj.y !== "number")
    throw new TypeError("Positions must be numbers!");
  return obj;
}
class ExecutionContext {
  get isEntity() {
    return this.self instanceof Entity;
  }
  constructor(x, y, self) {
    this.x = x;
    this.y = y;
    this.self = self;
  }
}
//Extension
const positionType = "number|relpos|identifier";
const cle = new ISLExtension("pr-cmd");
cle.addType("rloc-item", (val) => Registry.items.has(val));
cle.addType("rloc-entity", (val) => Registry.entities.has(val));
cle.addType("entity", () => false);
cle.addType("nonentity-ctx", () => false);
window["_self"] = cle.addVariable("self", new Entity(), "entity");
const _ctx = (window["_ctx"] = cle.addVariable(
  "ctx",
  new Block(),
  "nonentity-ctx"
));
let _ce = (window["_created"] = cle.addVariable("created", "null", "null"));
cle.addKeyword(
  "give",
  (interp, labels, entity, item, amount) => {
    let target = entity?.value;
    let leftover =
      target instanceof EquippedEntity
        ? target.equipment.addItem(item?.value, amount?.value)
        : amount?.value;
    let notgiven = 0;
    if (leftover) notgiven = target.inventory.addItem(item?.value, leftover);
    feedback(
      "Given " +
        ((amount?.value ?? 1) - notgiven) +
        " " +
        Registry.items.get(item?.value).name +
        " to " +
        target.name
    );
  },
  [
    { name: "target", type: "entity" },
    { name: "item", type: "rloc-item" },
    { name: "amount", type: "number", optional: true },
  ]
);
cle.addKeyword(
  "explode",
  (interp, labels, x, y, damage, radius) => {
    let pos = getPos(x, y);
    splashDamageInstance(
      pos.x,
      pos.y,
      damage?.value ?? 100,
      "explosion",
      radius?.value ?? 100,
      null,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "neutral"
    );
    feedback(
      "Created explosion at " +
        pos.x +
        ", " +
        pos.y +
        ", dealing " +
        (damage?.value ?? 100) +
        " damage in a " +
        (radius?.value ?? 100) +
        "px radius"
    );
  },
  [
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
    { name: "damage", type: "number", optional: true },
    { name: "radius", type: "number", optional: true },
  ]
);
cle.addKeyword(
  "spawn",
  (interp, labels, entity, x, y) => {
    let ent = construct(Registry.entities.get(entity?.value), "entity");
    let pos = getPos(x, y);
    ent.addToWorld(world, pos.x, pos.y);
    _ce.value = ent;
    _ce.type = "entity";
    feedback("Spawned new " + ent.name + " at " + pos.x + ", " + pos.y);
  },
  [
    { name: "entity", type: "rloc-entity" },
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
  ]
);
cle.addKeyword(
  "teleport",
  (interp, labels, target, x, y) => {
    let pos = getPos(x, y);
    target.value.x = pos.x;
    target.value.y = pos.y;
    feedback("Teleported " + target.value.name + " to " + pos.x + ", " + pos.y);
  },
  [
    { name: "target", type: "entity" },
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
  ]
);
cle.addKeyword(
  "save",
  (interp, labels, worldName) => {
    saveGame(worldName?.value);
  },
  [{ type: "string", name: "name", optional: true }]
);
cle.addKeyword(
  "load",
  (interp, labels, worldName) => {
    loadGame(worldName?.value);
  },
  [{ type: "string", name: "name", optional: true }]
);
//Interpreter
const commandLine = new ISLInterpreter({
  environment: "P:R",
  onlog: (msg) => {
    console.log("[ISL Log] " + msg);
    (msg + "").split("\n").forEach((val) => Log.send(val));
  },
  onwarn: (msg) => {
    console.log("[ISL Warning] " + msg);
    (msg + "").split("\n").forEach((val) => Log.send(val, [255, 255, 0]));
  },
  onerror: (msg) => {
    Log.send("ISL> Could not complete operation: ", [255, 0, 0], "italic");
    (msg + "")
      .split("\n")[1]
      .split(",")
      .forEach((x) => Log.send("    " + x, [255, 0, 0], "italic"));
    console.log("[ISL Error] " + msg);
  },
});
commandLine.extend(cle);
let ctx = new ExecutionContext(0, 0, null);

window["ExecutionContext"] = ExecutionContext;
window["islinterface"] = {
  do: (isl, context) =>
    isl.split(/[\n\;]/g).forEach((line) => runCommand(line, context)),
};
/**
 *
 * @param {string} cmd Command to execute.
 * @param {ExecutionContext} context Options for executing this command.
 */
function runCommand(cmd, context) {
  if (!context) throw new SyntaxError("Execution context is not defined!");
  _ctx.value = context.self;
  _ctx.type = context.isEntity ? "entity" : "nonentity-ctx";
  ctx = context;
  cmd = cmd.replaceAll("#", "\\_created\\");
  cmd = cmd.replaceAll("@s", "\\_ctx\\");
  cmd = cmd.replaceAll("@p", "\\_self\\");
  commandLine.executeLine(cmd);
}

console.log("ISL ready.");
