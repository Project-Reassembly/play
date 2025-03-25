//Yes, this stuff.
//Why make a command line language when there's a perfectly good one right here?
import {
  ISLInterpreter,
  ISLError,
} from "https://cdn.jsdelivr.net/gh/LightningLaser8/ISL@main/core/interpreter.js";
import { ISLExtension } from "https://cdn.jsdelivr.net/gh/LightningLaser8/ISL@main/core/extensions.js";
//Util
let quietMode = false;
function feedback(msg) {
  if (!quietMode) Log.send("ISL> " + msg, [200, 200, 200], "italic");
}
function give(entity, item, amount) {
  let leftover =
    entity instanceof EquippedEntity
      ? entity.equipment.addItem(item, amount)
      : amount ?? 0;
  let notgiven = 0;
  if (leftover) notgiven = entity.inventory.addItem(item, leftover);
  return notgiven;
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
cle.addType(
  "rloc-item",
  (val) => Registry.items.has(val) && !Registry.blocks.has(val)
);
cle.addType(
  "rloc-block",
  (val) => Registry.blocks.has(val) && !Registry.items.has(val)
);
cle.addType(
  "rloc-placeable",
  (val) => Registry.blocks.has(val) && Registry.items.has(val)
);
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
    let notgiven = give(target, item?.value, amount?.value);
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
    { name: "item", type: "rloc-item|rloc-placeable" },
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
  "devset",
  (interp, labels) => {
    if (!ctx.isEntity && !(ctx.self instanceof EquippedEntity))
      throw new ISLError(
        "Cannot give items to non-entity executor!",
        TypeError
      );
    else {
      give(ctx.self, "dev::commandblock", 99)
      give(ctx.self, "dev::commandblock.chain", 99)
      give(ctx.self, "dev::commandblock.loop", 99)
      give(ctx.self, "message", 99)
      give(ctx.self, "dev::itemcatalog", 1)
    }
  },
  []
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
cle.addKeyword(
  "activate",
  (interp, labels, x, y) => {
    let pos = getPos(x, y);
    let toActivate;
    try {
      toActivate = world.getBlockErroring(
        Math.floor(pos.x / 30),
        Math.floor(pos.y / 30)
      );
    } catch (err) {
      throw new ISLError(err.message, err.constructor);
    }
    toActivate.activated();
    feedback("Activated block at " + pos.x + ", " + pos.y);
  },
  [
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
  ]
);
cle.addKeyword(
  "place",
  (interp, labels, block, x, y, team) => {
    let pos = getPos(x, y);
    let placed;
    try {
      placed = world.placeAt(
        block.value,
        Math.floor(pos.x / 30),
        Math.floor(pos.y / 30)
      );
    } catch (err) {
      throw new ISLError(err.message, err.constructor);
    }
    if (team?.value) placed.team = team.value;
    feedback("Placed " + placed.name + " at " + pos.x + ", " + pos.y);
  },
  [
    { name: "block", type: "rloc-block|rloc-placeable" },
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
    { name: "team", type: "string", optional: true },
  ]
);
cle.addKeyword(
  "break",
  (interp, labels, x, y, type) => {
    let pos = getPos(x, y);
    type ??= { type: "string", value: "ignore" };
    type.value ??= "ignore";
    try {
      let toBreak = world.getBlockErroring(
        Math.floor(pos.x / 30),
        Math.floor(pos.y / 30)
      );
      if (
        type.value === "ignore" ||
        toBreak.break(BreakType[type.value] ?? "delete")
      )
        world.break(Math.floor(pos.x / 30), Math.floor(pos.y / 30));
    } catch (err) {
      throw new ISLError(err.message, err.constructor);
    }
    feedback(
      "Broken block at " +
        pos.x +
        ", " +
        pos.y +
        (type.value !== "ignore" ? " as '" + type.value + "'" : "")
    );
  },
  [
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
    {
      name: "breaktype",
      type: "=ignore|deconstruct|delete|explode|replace",
      optional: true,
    },
  ]
);

cle.addKeyword(
  "quietmode",
  (interp, labels, enabled) => {
    if (quietMode) feedback("Disabling quiet mode.");
    else feedback("Enabling quiet mode.");
    quietMode = enabled?.value ?? true;
  },
  [{ type: "boolean", name: "enabled", optional: true }]
);

cle.addKeyword(
  "read",
  (interp, labels, x, y, as, variable) => {
    let pos = getPos(x, y);
    let toRead;
    try {
      toRead = world.getBlockErroring(
        Math.floor(pos.x / 30),
        Math.floor(pos.y / 30)
      );
    } catch (err) {
      throw new ISLError(err.message, err.constructor);
    }
    let val = toRead.read();
    if (as.value === "to") {
      interp.setVar(variable.value, val);
    } else {
      Log.send(
        "ISL> Actually, extensions can't create variables. This is here as a placeholder.",
        [255, 255, 0],
        "italic"
      );
    }
  },
  [
    { name: "x", type: positionType },
    { name: "y", type: positionType },
    { name: "separator", type: "=as|to" },
    { name: "variable", type: "identifier" },
  ]
);

cle.addKeyword(
  "write",
  (interp, labels, text, x, y) => {
    let pos = getPos(x, y);
    let toWriteTo;
    try {
      toWriteTo = world.getBlockErroring(
        Math.floor(pos.x / 30),
        Math.floor(pos.y / 30)
      );
    } catch (err) {
      throw new ISLError(err.message, err.constructor);
    }
    if (
      toWriteTo instanceof CommandExecutorBlock ||
      toWriteTo instanceof SignBlock
    )
      toWriteTo.write(text.value);
    else throw new ISLError("Selected block cannot be written to.", TypeError);
  },
  [
    { name: "text", type: "string" },
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
  ]
);

cle.addLabel("general", ["help"]);
cle.addKeyword(
  "help",
  (interp, labels, cmd) => {
    let command = cmd?.value;
    const s = (str, style) => Log.send(str, undefined, style, 1080);
    const b = (str) => s(str, "bold");
    //Header
    b(">>> ISL Command Line Help <<<");
    //Body
    if (!labels.includes("general")) {
      if (!command) {
        s("Run [help ... ] to get help for a command");
        s("Run [general help] to get help for the command line");
        s("ISL basics function, but are not covered here");
        b("utility");
        s(" give");
        s(" spawn");
        s(" teleport");
        s(" explode");
        b("manipulation");
        s(" activate");
        s(" place");
        s(" break");
        b("storage");
        s(" save");
        s(" load");
        b("ui");
        s(" quietmode");
        b("information");
        s(" read");
        s(" write");
      } else if (command === "give") {
        b("utility > give");
        s(" Adds an item to an entity's inventory.");
        b("Parameters:");
        s(" entity: The entity to give the items to.");
        s(" item: Registry name of the item to give.");
        s(" (amount): The number of items to give.");
      } else if (command === "spawn") {
        b("utility > spawn");
        s(" Creates an entity at a location.");
        s(" This entity can be accessed through [#].");
        s(' Entity will always start on team "enemy".');
        b("Parameters:");
        s(" entity: Registry name of entity to spawn.");
        s(" (x, y): Position from top-left corner. 1 block = 30px.");
      } else if (command === "teleport") {
        b("utility > teleport");
        s(" Moves an entity to a location.");
        b("Parameters:");
        s(" entity: The entity to move.");
        s(" (x, y): Position from top-left corner. 1 block = 30px.");
      } else if (command === "explode") {
        b("utility > explode");
        s(" Creates an explosion.");
        b("Parameters:");
        s(" x, y: Position from top-left corner. 1 block = 30px.");
        s(" damage: Amount of damage to deal.");
        s(" radius: Radius of the explosion in pixels.");
      } else if (command === "devset") {
        b("utility > devset");
        s(" Gives the executor:");
        s("  99 Command Blocks");
        s("  99 Chaining Command Blocks");
        s("  99 Looping Command Blocks");
        s("  99 Message Units");
        s("  1 Item Catalog");
        s(" Useful for testing.");
        b("Parameters:");
        s(" (none)");
      } else if (command === "activate") {
        b("manipulation > activate");
        s(" Activates a block. Different blocks do different things.");
        s(
          " Most dev blocks can be activated, either with this or shift-click."
        );
        b("Parameters:");
        s(" (x, y): Position from top-left corner. 1 block = 30px.");
      } else if (command === "place") {
        b("manipulation > place");
        s(" Places a block in the world.");
        s(" This block cannot then be accessed through ISL directly.");
        b("Parameters:");
        s(" block: Registry name of block to place.");
        s(" (x, y): Position from top-left corner. 1 block = 30px.");
      } else if (command === "break") {
        b("manipulation > break");
        s(" Breaks a block. Can specify a type of breaking,");
        s(" which may cause item drops, explosions or ineffectiveness.");
        b("Parameters:");
        s(" (x, y): Position from top-left corner. 1 block = 30px.");
        s(" (type): Breaking type. Leave blank or set to [ignore] to just");
        s("         remove the block, disregarding any special behaviour.");
        s("         May have side-effects, especially with mods.");
      } else if (command === "read") {
        b("information > read");
        s(" Reads data from a block, stores the result in a variable.");
        s("Results by block type:");
        s(" Sign blocks: Set text.");
        s(" Containers: Registry name of item in first non-empty slot.");
        s(" Conveyors: Registry name of transported item.");
        s(" Unloaders: Filter item.");
        s(" Structure readers: Group of block registry names.");
        s(" Command blocks: Set command.");
        s(" Other blocks: Registry name.");
        b("Parameters:");
        s(" x, y: Position from top-left corner. 1 block = 30px.");
        s(" as");
        s(" variable: Variable to set the value of.");
      } else if (command === "write") {
        b("information > write");
        s(" Writes a string to a sign or command block.");
        b("Parameters:");
        s(" text: String to write to the block.");
        s(" (x, y): Position from top-left corner. 1 block = 30px.");
      } else if (command === "save") {
        b("storage > save");
        s(" Saves the game.");
        b("Parameters:");
        s(" (name): Name of the save file. Needed for loading.");
        s("         Leave blank to use the default save file.");
      } else if (command === "load") {
        b("storage > load");
        s(" Loads a save file and starts playing on it.");
        s(
          " Does not save the current session, so use of [save] is recommended."
        );
        b("Parameters:");
        s(" (name): Name of the save file. Needed for custom files.");
        s("         Leave blank to use the default save file.");
      } else if (command === "quietmode") {
        b("isl > quietmode");
        s(" Enables or disables quiet mode.");
        s(" When in quiet mode, ordinary feedback (prefixed with ISL>)");
        s(" will not be shown.");
        b("Parameters:");
        s(" (enabled): State to set quiet mode to. If blank, will turn it on.");
      } else {
        Log.send("Invalid Command: " + command, [255, 0, 0], "bold", 1080);
        s(" The chosen keyword is not a command line");
        s(" exclusive keyword. If unsure, run [help] with");
        s(" no parameters for a list of available commands.");
      }
    } else {
      s("General command line syntax help.");
      b(
        "This is incompatible with normal ISL. Do not expect this to work in scripts."
      );
      b("Shorthand");
      s("@p: The current player.");
      s('@s: The executor ("self"). May be a block.');
      s("#: Most recently created entity. May be null.");
      b("Positioning");
      s(" Positions may be given as a number, or as an ISL");
      s(' relative position ("relpos"). This is relative to');
      s(" the executor, whether it is a block or an entity.");
      s(" [~] may be used as the current relevant coordinate.");
      s(" 1 block is 30px wide, so 1 block right would be [~30 ~].");
    }
    //Footer
    b(">>> ---------P:R--------- <<<");
  },
  [{ name: "command", type: "keyword", optional: true }]
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
    if (msg.includes("Error detected")) {
      if (!quietMode) {
        Log.send("ISL> Could not complete operation: ", [255, 0, 0], "italic");
        (msg + "")
          .split("\n")[1]
          .split(",")
          .forEach((x) => Log.send("    " + x, [255, 0, 0], "italic"));
      }
    } else (msg + "").split("\n").forEach((val) => Log.send(val, [255, 0, 0]));
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
