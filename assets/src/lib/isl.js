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
//Extension

const cle = new ISLExtension("pr-cmd");
cle.addType("rloc-item", (val) => Registry.items.has(val));
cle.addType("rloc-entity", (val) => Registry.entities.has(val));
cle.addType("entity", () => false);
window["_self"] = cle.addVariable("self", new Entity(), "entity");
window["_x"] = cle.addVariable("x", 0, "number");
window["_y"] = cle.addVariable("y", 0, "number");
let _ce = (window["_created"] = cle.addVariable("created", "null", "null"));
cle.addKeyword(
  "give",
  (interp, labels, entity, item, amount) => {
    let target = entity?.value;
    console.log(target);
    let leftover = target.equipment.addItem(item?.value, amount?.value);
    let notgiven = 0;
    if (leftover) notgiven = target.inventory.addItem(item?.value, leftover);
    feedback(
      "You have been given " +
        ((amount?.value ?? 1) - notgiven) +
        " " +
        Registry.items.get(item?.value).name
    );
  },
  [
    { name: "target", type: "entity" },
    { name: "item", type: "rloc-item" },
    { name: "amount", type: "number", optional: "true" },
  ]
);
cle.addKeyword(
  "explode",
  (interp, labels, x, y, damage, radius) => {
    splashDamageInstance(
      x?.value ?? 0,
      y?.value ?? 0,
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
        (x?.value ?? 0) +
        ", " +
        (y?.value ?? 0) +
        ", dealing " +
        (damage?.value ?? 100) +
        " damage in a " +
        (radius?.value ?? 100) +
        "px radius"
    );
  },
  [
    { name: "x", type: "number" },
    { name: "y", type: "number" },
    { name: "damage", type: "number" },
    { name: "radius", type: "number" },
  ]
);
cle.addKeyword(
  "spawn",
  (interp, labels, entity, x, y) => {
    let ent = construct(Registry.entities.get(entity?.value), "entity");
    ent.addToWorld(world, x?.value ?? 0, y?.value ?? 0);
    _ce.value = ent;
    _ce.type = "entity";
    feedback(
      "Spawned new " +
        ent.name +
        " at " +
        (x?.value ?? 0) +
        ", " +
        (y?.value ?? 0)
    );
  },
  [
    { name: "entity", type: "rloc-entity" },
    { name: "x", type: "number" },
    { name: "y", type: "number" },
  ]
);
cle.addKeyword(
  "teleport",
  (interp, labels, target, x, y) => {
    let xpos =
      x.type === "relpos"
        ? game.player.x + parseFloat(x.value.substring(1))
        : x.value;
    let ypos =
      y.type === "relpos"
        ? game.player.y + parseFloat(y.value.substring(1))
        : y.value;
    target.value.x = xpos ?? target.value.x;
    target.value.y = ypos ?? target.value.y;
    feedback(
      "Teleported " +
        target.value.name +
        " to " +
        (xpos ?? 0) +
        ", " +
        (ypos ?? 0)
    );
  },
  [
    { name: "target", type: "entity" },
    { name: "x", type: "number|relpos" },
    { name: "y", type: "number|relpos" },
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

window["islinterface"] = {
  do: (isl) => isl.split(/[\n\;]/g).forEach((line) => runCommand(line)),
};
function runCommand(cmd) {
  cmd = cmd.replaceAll("#", "\\_created\\");
  cmd = cmd.replaceAll("@", "\\_self\\");
  cmd = cmd.replaceAll("~x", "\\_x\\");
  cmd = cmd.replaceAll("~y", "\\_y\\");
  commandLine.executeLine(cmd);
}
console.log("ISL ready.");
