//Yes, this stuff.
//Why make a command line language when there's a perfectly good one right here?

import { BreakType } from "../../classes/block/block.js";
import { EquippedEntity, InventoryEntity } from "../../classes/entity/inventory-entity.js";
import { deliverEntity } from "../../classes/world/events/event-action.js";
import { construct } from "../../core/constructor.js";
import { roundNum } from "../../core/number.js";
import { Registries } from "../../core/registry.js";
import { Explosion, NuclearExplosion } from "../../play/effects.js";
import { clearData, loadGame, saveGame, world } from "../../play/game.js";
import { Log } from "../../play/messaging.js";
import { blockSize } from "../../scaling.js";
import Integrate from "../integrate.js";
import { mods } from "../mod-list.js";
import {
  addCreatedEntity,
  core,
  doTo,
  ExecutionContext,
  feedback,
  getCTX,
  getPos,
  ISLError,
  ISLExtension,
  ISLInterpreter,
  makeInterpreter,
  positionType,
  quietMode,
  runCommand,
} from "./core.js";
const s = (str) => Log.send(str);
function give(entity, item, amount = 1) {
  let leftover =
    entity instanceof EquippedEntity && entity.ammo.hasItem(item) ?
      entity.ammo.addItem(item, amount)
    : (amount ?? 0);
  let notgiven = 0;
  if (leftover) notgiven = entity.inventory.addItem(item, leftover);
  return notgiven;
}
//Extension
const cle = new ISLExtension("pr-cmd");
cle.addKeyword(
  "give",
  (interp, labels, entity, item, amount) => {
    let target = entity?.value;
    let given = new Set();
    if (!Registries.items.has(item?.value)) {
      feedback(`#ciItem ${item?.value} does not exist!`);
      return;
    }
    const d = doTo(target, (ent) => {
      if (!(ent instanceof InventoryEntity)) {
        feedback(`#ci${ent.name}#ci has no inventory to give items to.`);
        return false;
      }
      let notgiven = give(ent, item?.value, amount?.value);
      given.add((amount?.value ?? 1) - notgiven);
      return true;
    });
    feedback(
      `Given ${given.size === 0 ? "no" : `${[...given]}x`} ${Registries.items.get(item?.value).name}#7i to ${d}`,
    );
  },
  [
    { name: "target", type: "entity" },
    { name: "item", type: "identifier" },
    { name: "amount", type: "number", optional: true },
  ],
);
cle.addKeyword(
  "effect",
  (interp, labels, entity, status, duration) => {
    let target = entity?.value;

    if (!Registries.statuses.has(status?.value)) {
      feedback(`#ciEffect ${status?.value} does not exist!`);
      return;
    }

    const d = doTo(target, (ent) => {
      ent.applyStatus(status?.value, (duration?.value ?? 10) * 60);
      return true;
    });

    feedback(
      `Given effect ${Registries.statuses.get(status?.value).name}#7i to ${d} for ${duration?.value ?? 1}s`,
    );
  },
  [
    { name: "target", type: "entity" },
    { name: "status", type: "identifier" },
    { name: "duration", type: "number", optional: true },
  ],
);
cle.addKeyword(
  "shield",
  (interp, labels, entity, amount) => {
    let target = entity?.value;

    const d = doTo(target, (ent) => {
      ent.addShield(amount?.value ?? 0);
      return true;
    });

    feedback(`Added ${amount?.value ?? 0} shield HP to ${d}`);
  },
  [
    { name: "target", type: "entity" },
    { name: "amount", type: "number" },
  ],
);
cle.addLabel("nuclear", ["explode"]);
cle.addKeyword(
  "explode",
  (interp, labels, x, y, damage, radius, team) => {
    let pos = getPos(x, y),
      rad = radius?.value ?? (labels.includes("nuclear") ? 500 : 100),
      amt = damage?.value ?? (labels.includes("nuclear") ? 10000 : 100);
    new (labels.includes("nuclear") ? NuclearExplosion : Explosion)({
      x: pos.x,
      y: pos.y,
      amount: amt,
      radius: rad,
      team: team?.value ?? "neutral",
      world: world,
    })
      .create()
      .dealDamage();
    feedback(`Created explosion at ${pos.x}, ${pos.y}, dealing ${amt} damage in a ${rad}px radius`);
  },
  [
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
    { name: "damage", type: "number", optional: true },
    { name: "radius", type: "number", optional: true },
    { name: "team", type: "string", optional: true },
  ],
);
cle.addKeyword(
  "spawn",
  (interp, labels, entity, x, y) => {
    if (!Registries.entities.has(entity?.value)) {
      feedback(`#ciEntity ${entity?.value} does not exist.`);
      return;
    }
    let ent = construct(Registries.entities.get(entity?.value), "entity");
    let pos = getPos(x, y);
    ent.addToWorld(world, pos.x, pos.y);
    addCreatedEntity(ent);
    feedback(`Spawned new ${ent.name}#7i at ${pos.x}, ${pos.y}`);
  },
  [
    { name: "entity", type: "identifier" },
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
  ],
);
cle.addKeyword(
  "deliver",
  (interp, labels, entity, x, y) => {
    if (!Registries.entities.has(entity?.value)) {
      feedback(`#ciEntity ${entity?.value} does not exist.`);
      return;
    }
    let ent = construct(Registries.entities.get(entity?.value), "entity");
    let pos = getPos(x, y);
    ent.addToWorld(world, pos.x, pos.y);
    deliverEntity(ent, false, world, false);
    addCreatedEntity(ent);
    feedback(`Delivering new ${ent.name}#7i at ${pos.x}, ${pos.y}`);
  },
  [
    { name: "entity", type: "identifier" },
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
  ],
);
cle.addKeyword(
  "tp",
  (interp, labels, target, x, y) => {
    const pos = getPos(x, y);
    const d = doTo(target.value, (ent) => {
      ent.x = pos.x;
      ent.y = pos.y;
      return true;
    });
    feedback(`Teleported ${d}#7i to ${pos.x}, ${pos.y}`);
  },
  [
    { name: "target", type: "entity" },
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
  ],
);
cle.addKeyword(
  "team",
  (interp, labels, target, team) => {
    if (!Registries.corps.has(team?.value)) {
      feedback(`#ciTeam ${team?.value} does not exist!`);
      return;
    }
    const d = doTo(target.value, (ent) => {
      ent.team = `${team.value}`;
      return true;
    });
    feedback(`Set the team of ${d}#7i to ${team.value}`);
  },
  [
    { name: "target", type: "entity" },
    { name: "team", type: "identifier" },
  ],
);
cle.addKeyword(
  "devset",
  (interp, labels) => {
    const cli_ctx = getCTX();
    if (!cli_ctx.isEntity && !(cli_ctx.self instanceof EquippedEntity)) {
      feedback(`#ciCannot give items to non-entity executor!.`);
      return;
    } else {
      give(cli_ctx.self, "dev::itemcatalog", 1);
      give(cli_ctx.self, "dev::commandblock", 100);
      give(cli_ctx.self, "dev::commandblock.chain", 100);
      give(cli_ctx.self, "dev::commandblock.loop", 100);
      give(cli_ctx.self, "dev::structurereader", 100);
    }
  },
  [],
);

cle.addKeyword(
  "save",
  (interp, labels, worldName) => {
    saveGame(worldName?.value);
  },
  [{ type: "string", name: "name", optional: true }],
);
cle.addKeyword(
  "load",
  (interp, labels, worldName) => {
    loadGame(worldName?.value);
  },
  [{ type: "string", name: "name", optional: true }],
);
cle.addKeyword(
  "clear",
  (interp, labels) => {
    clearData();
  },
  [],
);
cle.addKeyword(
  "activate",
  (interp, labels, x, y) => {
    let pos = getPos(x, y);
    let toActivate;
    try {
      toActivate = world.getBlockErroring(
        Math.round(pos.x / blockSize),
        Math.round(pos.y / blockSize),
      );
    } catch (err) {
      feedback(`#ci${err.message}.`);
      return;
    }
    toActivate.activated();
    feedback(`Activated block at ${pos.x}, ${pos.y}`);
  },
  [
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
  ],
);
cle.addKeyword(
  "place",
  (interp, labels, block, x, y, team) => {
    if (!Registries.blocks.has(block?.value)) {
      feedback(`#ciBlock ${block?.value} doesn't exist.`);
      return;
    }
    let pos = getPos(x, y);
    let placed;
    try {
      placed = world.placeAt(block.value, Math.round(pos.x / 30), Math.round(pos.y / 30));
    } catch (err) {
      feedback(`#ci${err.message}.`);
      return;
    }
    if (team?.value) placed.team = team.value;
    feedback(`Placed ${placed.name}#7i at ${pos.x}, ${pos.y}`);
  },
  [
    { name: "block", type: "identifier" },
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
    { name: "team", type: "string", optional: true },
  ],
);
cle.addKeyword(
  "break",
  (interp, labels, x, y, type) => {
    let pos = getPos(x, y);
    type ??= { type: "string", value: "ignore" };
    type.value ??= "ignore";
    try {
      let toBreak = world.getBlockErroring(Math.round(pos.x / 30), Math.round(pos.y / 30));
      if (type.value === "ignore" || toBreak.break(BreakType[type.value] ?? "delete"))
        world.break(Math.round(pos.x / 30), Math.round(pos.y / 30));
    } catch (err) {
      throw new ISLError(err.message, err.constructor);
    }
    feedback(
      `Broken block at ${pos.x}, ${pos.y}${type.value !== "ignore" ? ` as '${type.value}'` : ""}`,
    );
  },
  [
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
    { name: "breaktype", type: "=ignore|deconstruct|delete|explode|replace", optional: true },
  ],
);

cle.addKeyword(
  "quietmode",
  (interp, labels, enabled) => {
    if (quietMode) feedback("Disabling quiet mode.");
    else feedback("Enabling quiet mode.");
    quietMode = enabled?.value ?? true;
  },
  [{ type: "boolean", name: "enabled", optional: true }],
);

cle.addKeyword(
  "read",
  (interp, labels, x, y, as, variable) => {
    let pos = getPos(x, y);
    let toRead;
    try {
      toRead = world.getBlockErroring(Math.floor(pos.x / 30), Math.floor(pos.y / 30));
    } catch (err) {
      throw new ISLError(err.message, err.constructor);
    }
    let val = toRead.read();
    if (as.value === "to") {
      interp.setVar(variable.value, val);
    } else {
      Log.send(
        "#niISL#yi> Actually, extensions can't create variables (yet). This is here as a placeholder.",
      );
    }
  },
  [
    { name: "x", type: positionType },
    { name: "y", type: positionType },
    { name: "separator", type: "=as|to" },
    { name: "variable", type: "identifier" },
  ],
);

cle.addKeyword(
  "write",
  (interp, labels, text, x, y) => {
    let pos = getPos(x, y);
    let toWriteTo;
    try {
      toWriteTo = world.getBlockErroring(Math.floor(pos.x / 30), Math.floor(pos.y / 30));
    } catch (err) {
      throw new ISLError(err.message, err.constructor);
    }
    if (typeof toWriteTo.write === "function") {
      toWriteTo.write(text.value);
      feedback(`Wrote text to ${toWriteTo.name} at ${toWriteTo.x}, ${toWriteTo.y}.`);
    } else throw new ISLError("Selected block cannot be written to.", TypeError);
  },
  [
    { name: "text", type: "string" },
    { name: "x", type: positionType, optional: true },
    { name: "y", type: positionType, optional: true },
  ],
);

cle.addKeyword(
  "at",
  (interp, labels, target, ...code) => {
    const cmd = code
      .map((x) => x.value)
      .join(" ")
      .replaceAll("&", ";");
    feedback(`Doing ${cmd} at ${target.value}`);
    const d = doTo(target.value, (ent) => {
      exec(cmd, new ExecutionContext(ent.x, ent.y, ent));
    });
  },
  [
    { type: "entity", name: "target" },
    { type: "any", name: "code", recurring: true },
  ],
);

cle.addKeyword(
  "mod",
  async (interp, labels, url) => {
    try {
      /**@type {Integrate.Mod} */
      const m = await Integrate.add(`${url?.value}`);
      preload();
      console.log(m);
      feedback(`Successfully loaded '${m.displayName}: ${m.tagline}' (${m.name}) by ${m.author}!`);
      mods.set(m.name, m);
    } catch (e) {
      feedback(`#ciMod loading from '${url?.value}' failed: ${e.message}`);
    }
  },
  [{ type: "string", name: "url" }],
);
cle.addKeyword(
  "mod-info",
  async (interp, labels, mod) => {
    const lmod = mods.get(`${mod?.value}`);
    if (!lmod) {
      feedback(`#ciThere is no loaded mod with ID '${mod?.value}'.`);
      return;
    }
    const affectedReg = [...new Set(lmod.content.map((c) => c.registry))];
    feedback(`Listing info for mod '${lmod.displayName}':`);
    s(`#@b${lmod.displayName}#@- by ${lmod.author}#--`);
    s(`#@i${lmod.tagline.replaceAll("#", "\#")}#--`);
    s(`#7-${lmod.description.replaceAll("#", "\#")}#--`);
    s(
      `#h-${lmod.content.length}#-- content item${lmod.content.length === 1 ? "" : "s"} ${affectedReg.length === 1 ? `in #n-Registries#--.#i-${affectedReg[0]}#--` : `across #h-${affectedReg.length}#-- registries`}:`,
    );
    if (affectedReg.length === 1) {
      lmod.content
        .filter((c) => c.registry === affectedReg[0])
        .forEach((c) => {
          s(
            ` - #e-${c.name}#--: ${c.constructible.type ?? "unknown type"}, #6-${roundNum((c.JSON.length * 2) / 1024, 3)}kb#--`,
          );
        });
    } else
      affectedReg.forEach((v, i) => {
        const incl = lmod.content.filter((c) => c.registry === v);
        s(` #h-${incl.length}#-- in #n-Registries#--.#i-${v}#--: `);
        incl.forEach((c) => {
          s(
            `  - #e-${c.name}#--: ${c.constructible.type ?? "unknown type"}, #6-${roundNum((c.JSON.length * 2) / 1024, 3)}kb#--`,
          );
        });
      });
  },
  [{ type: "string|identifier", name: "mod" }],
);
cle.addKeyword(
  "mod-list",
  async (interp, labels) => {
    feedback(`Listing all loaded mods and their IDs:`);
    if (mods.size > 0)
      mods.forEach((mod, id) => {
        s(` #@b${mod.displayName}#-- (#n-${id}#--) #i-${mod.version}#--`);
      });
    else s(` #7-No mods to show.`);
  },
  [],
);

cle.addLabel("general", ["help"]);
cle.addLabel("selector", ["help"]);
cle.addKeyword(
  "help",
  (interp, labels, cmd) => {
    let command = cmd?.value;
    //Header
    s("#@->>> ISL Command Line Help <<<");
    //Body
    if (labels.includes("general")) {
      s("General command line syntax help.");
      s("#ciThis is incompatible with normal ISL,");
      s("#ci so not expect this to work in mod scripts.");
      s("#@-Selectors");
      s(" For help with selectors (#6-@...#--), run [#b-selector help#--]");
      s("#@-Positioning");
      s(" Positions may be given as a number, or as an ISL");
      s(" relative position (#h-relpos#--). This is relative to");
      s(" the executor, #-bwhether it is a block or an entity#--.");
      s(" #b-~#-- may be used as the current relevant coordinate.");
      s(" The suffix #b-b#-- may be used to indicate block coordinates");
      s(" so 1 block right would be either #b-~30 ~#-- or #b-~1b ~#--.");
      s(" The suffix #b-c#-- indicates chunks, and #b-r#-- indicates");
      s(" evaluation regions.");
    } else if (labels.includes("selector")) {
      s("Selectors are used to provide entities to commands which require an");
      s("#7i<entity>#-- input. They can be very simple, or very complex:");
      s("#@-Simple Selectors");
      s(" #6-@p#--/#6-@player#--: The current player.");
      s(" #6-@s#--/#6-@self#--: The executor of the command. May be a block.");
      s(" #6-@r#--/#6-@random#--: A random entity.");
      s(
        " #6-@c#--/#6-@closest#--: The closest entity (likely yourself when used alone, unless using command blocks).",
      );
      s(" #6-@#--/#6-@w#--/#6-@newest#--: The most recently spawned entity.");
      s(" #6-@e#--/#6-@everything#--: All entities.");
      s(" #6-@t#--/#6-@team#--: All entities on the team of the executor.");
      s(" #6-@a#--/#6-@ally#--: All entities allied to the team of the executor.");
      s(" #6-@n#--/#6-@enemy#--: All entities not on or allied to the team of the executor.");
      s("#@-Generated/Programmatic Selectors");
      s(
        ` #6-@${[...Registries.corps]
          .map((x) => x.key)
          .join("#--/#6-@")}#--: All entities on the specified team.`,
      );
      s(
        ` #6-@=<type>#--: All entities of the specified #6-<type>#--, e.g. #6-@=scavenger#-- matches all scavengers.`,
      );
      s(
        ` #6-@{<property>}#--: All entities with the specified #6-<property>#--, such as #6-@{relation}#--.`,
      );
      s(
        ` #6-@{<property>:<value>}#--: All entities with the specified #6-<value>#-- of #6-<property>#--, such as #6-@{health:100}#--`,
      );
      s("#@-Compound Selectors");
      s(
        ` Here, #6-x#-- and #6-y#-- are generic selectors, i.e. anything from the lists above, or '#6-x#-- can be another compound selector.`,
      );
      s(
        ` #6-@x>y#--: All entities that matched #6-x#-- which also match #6-y#--, such as #6-@n>c#-- for closest enemy.`,
      );
      s(
        ` #6-@x+y#--: All entities that matched #6-x#-- or match #6-y#--, such as #6-@iti+ccc#-- for entities in either #6-iti#-- or #6-ccc#--.`,
      );
      s(
        ` #6-@x!y#--: All entities that matched #6-x#-- which don't match #6-y#--, such as #6-@n!peti#-- for enemies which aren't #6-peti#--`,
      );
      s(
        ` #6-@x|y#--: The same as #6-@x+y#--, except further combinations only affect #6-y#--, not #6-x#--.`,
      );
      s(
        ` These can be chained infinitely (e.g. #6-@n>r|e!p>c|iti#--: all #6-iti#-- entities, a random enemy #-iand#-- the closest entity other than the player).`,
      );
      s(` Evaluation is left-to-right.`);
      s("#@-Created Entity Selectors");
      s(
        ` Replacing the #6-@#-- with a #6-\\##-- selects from only ISL-created entities, instead of all entities in the whole world.`,
      );
    } else {
      if (!command) {
        s("Run [#3-help #7i<command>#--] to get help for a command");
        s("Run [#3-general help#--] to get help for the command line");
        s("ISL basics function, but are not covered here");
        s("#ei- utility ---------------------------------------------------------------------- ");
        s(" #3-give #7i<entity> <item> [amount]");
        s(" #3-spawn #7i<entity> [x] [y]     #3-deliver #7i<entity> [x] [y]");
        s(" #3-tp #7i<entity> <x> <y>        #3-team #7i<entity> <team>");
        s(" #3-explode #7i<x> <y> [damage] [radius] [team]");
        s(" #3-at #7i<entity> <...command>");
        s(" #3-devset");
        s("#ei- manipulation ----------------------------------------------------------------- ");
        s(" #3-activate #7i<x> <y>");
        s(" #3-place #7i<block> <x> <y>      #3-break #7i<x> <y> [type]");
        s("#ei- storage ---------------------------------------------------------------------- ");
        s(" #3-save #7i[name]                #3-load #7i[name]                #3-clear");
        s("#ei- ui --------------------------------------------------------------------------- ");
        s(" #3-quietmode #7i[enabled]");
        s("#ei- information ------------------------------------------------------------------ ");
        s(" #3-read #7i<x> <y> as <variable> #3-write #7i<text> <x> <y>");
        s("#ei- modifications ---------------------------------------------------------------- ");
        s(" #3-mod #7i<url>                  #3-mod-info #7i<mod>             #3-mod-list");
        s("#ei-------------------------------------------------------------------------------- ");
      } else if (command === "give") {
        s("#eiutility #-->#3- give");
        s(" Adds an item to an entity's inventory.");
        s("#@-Parameters:");
        s("  #6-<entity>#--: The entity to give the items to.");
        s("  #6-<item>#--: Registry name of the item to give.");
        s("  #6-[amount]#--: The number of items to give.");
      } else if (command === "spawn") {
        s("#eiutility #-->#3- spawn");
        s(" Creates an entity at a location.");
        s("#@-Parameters:");
        s("  #6-<entity>#--: Registry name of entity to spawn.");
        s("  #6-[x], [y]#--: Position from top-left corner. 1 block = 30px.");
      } else if (command === "deliver") {
        s("#eiutility #-->#3- deliver");
        s(" Drops an entity at a location, as if it were spawned by an event.");
        s(" WIll not create the secondary shockwave that player spawns create.");
        s("#@-Parameters:");
        s("  #6-<entity>#--: Registry name of entity to spawn.");
        s("  #6-[x], [y]#--: Position from top-left corner. 1 block = 30px.");
      } else if (command === "team") {
        s("#eiutility #-->#3- team");
        s(" Changes an entity's team.");
        s("#@-Parameters:");
        s("  #6-<entity>#--: Registry name of entity to spawn.");
        s("  #6-<team>#--: String name of the target team.");
      } else if (command === "tp") {
        s("#eiutility #-->#3- tp");
        s(" Teleports an entity to a location.");
        s("#@-Parameters:");
        s("  #6-<entity>#--: The entity to move.");
        s("  #6-<x>, <y>#--: Position from top-left corner. 1 block = 30px.");
      } else if (command === "explode") {
        s("#eiutility #-->#3- explode");
        s(" Creates an explosion.");
        s("#@-Parameters:");
        s("  #6-<x>, <y>#--: Position from top-left corner. 1 block = 30px.");
        s("  #6-[damage]#--: Amount of damage to deal. Default 100.");
        s("  #6-[radius]#--: Radius of the explosion in pixels. Default 100.");
        s('  #6-[team]#--: Team of the explosion. By default "neutral".');
      } else if (command === "devset") {
        s("#eiutility #-->#3- devset");
        s(" Gives the executor:");
        s("  #c-99 #e-Command Blocks");
        s("  #c-99 #e-Chaining Command Blocks");
        s("  #c-99 #e-Looping Command Blocks");
        s("  #c-99 #e-Message Units");
        s("  #c-1 #e-Item Catalog");
        s(" Useful for testing.");
        s("#@-Parameters:");
        s(" (none)");
      } else if (command === "at") {
        s("#eiutility #-->#3- at");
        s(" Performs a command at and as one or more entities.");
        s(" #@-&#-- can be used in #7i<...command>#-- to perform multiple commands at once.");
        s("#@-Parameters:");
        s("  #6-<entity>#--: Selector for entities to perform this at.");
        s("  #6-<...command>#--: Any valid command for this command line,");
        s("    or sequence separated with #@-&#--.");
      } else if (command === "activate") {
        s("#eimanipulation #-->#3- activate");
        s(" Activates a block. Different blocks do different things.");
        s(" Most dev blocks can be activated, either with this or shift-click.");
        s("#@-Parameters:");
        s("  #6-<x>, <y>#--: Position from top-left corner. 1 block = 30px.");
      } else if (command === "place") {
        s("#eimanipulation #-->#3- place");
        s(" Places a block in the world.");
        s(" This block cannot then be accessed through ISL directly.");
        s("#@-Parameters:");
        s(" block: Registry name of block to place.");
        s("  #6-<x>, <y>#--: Position from top-left corner. 1 block = 30px.");
      } else if (command === "break") {
        s("#eimanipulation #-->#3- break");
        s(" Breaks a block. Can specify a type of breaking,");
        s(" which may cause item drops, explosions or ineffectiveness.");
        s("#@-Parameters:");
        s("  #6-<x>, <y>#--: Position from top-left corner. 1 block = 30px.");
        s("  #6-[type]#--: Breaking type. Leave blank or set to 'ignore' to just");
        s("         remove the block, disregarding any special behaviour.");
        s("         May have side-effects, especially with mods.");
      } else if (command === "read") {
        s("#eiinformation #-->#3- read");
        s(" Reads data from a block, stores the result in a variable.");
        s("Results by block type:");
        s(" Sign blocks: Set text.");
        s(" Containers: Registry name of item in first non-empty slot.");
        s(" Conveyors: Registry name of transported item.");
        s(" Unloaders: Filter item.");
        s(" Structure readers: Group of block registry names.");
        s(" Command blocks: Set command.");
        s(" Other blocks: Registry name.");
        s("#@-Parameters:");
        s("  #6-<x>, <y>#--: Position from top-left corner. 1 block = 30px.");
        s("  as");
        s("  #6-<variable>#--: Variable to set the value of.");
      } else if (command === "write") {
        s("#eiinformation #-->#3- write");
        s(" Writes a string to a sign or command block.");
        s("#@-Parameters:");
        s("  #6-<text>#--: String to write to the block.");
        s("  #6-<x>, <y>#--: Position from top-left corner. 1 block = 30px.");
      } else if (command === "save") {
        s("#eistorage #-->#3- save");
        s(" Saves the game.");
        s("#@-Parameters:");
        s("  #6-[name]#--: Name of the save file. Needed for loading.");
        s("         Leave blank to use the default save file.");
      } else if (command === "load") {
        s("#eistorage #-->#3- load");
        s(" Loads a save file and starts playing on it.");
        s(" Does not save the current session, so use of [#3-save#--] is recommended.");
        s("#@-Parameters:");
        s("  #6-[name]#--: Name of the save file. Needed for custom files.");
        s("         Leave blank to use the default save file.");
      } else if (command === "clear") {
        s("#eistorage #-->#3- clear");
        s(" #c-Deletes all your save files.");
        s(" This command will delete #cievery save file that you or the game made.");
        s(" This includes saves from [#3-save#--], and from [#=-ctrl+j#--].");
        s(
          " Your #>>icon.database#=-database#-- data will not be deleted, and mod data may remain.",
        );
        s(" #4bUse with caution - this is #4kirreversible#4b!");
      } else if (command === "quietmode") {
        s("#eiui #-->#3- quietmode");
        s(" Enables or disables quiet mode.");
        s(" When in quiet mode, ordinary feedback (prefixed with #niISL#-->)");
        s(" will not be shown.");
        s("#@-Parameters:");
        s("  #6-[enabled]#--: State to set quiet mode to. If blank, will turn it on.");
      } else if (command === "mod") {
        s("#eimodifications #-->#3- mod");
        s(" Loads and implements an Integrate mod from the Internet, then reloads");
        s(" game resources.");
        s(" May cause lag if a large mod is loaded, so runs #-iasynchronously#--.");
        s("#@-Parameters:");
        s("  #6-<url>#--: The URL to fetch the mod from.");
      } else if (command === "mod-info") {
        s("#eimodifications #-->#3- mod-info");
        s(" Gets extended information for an installed mod.");
        s("#@-Parameters:");
        s("  #6-<mod>#--: The identifier of the mod.");
      } else if (command === "mod-list") {
        s("#eimodifications #-->#3- mod-list");
        s(" Gets the titles and identifiers of all installed mods.");
        s("#@-Parameters:");
        s(" (none)");
      } else {
        s("#4bInvalid Command: " + command);
        s(" The chosen keyword is not a command line-exclusive keyword.");
        s(" If unsure, run [help] with no #@-Parameters#-- ");
        s(" for a list of available commands.");
      }
    }
  },
  [{ name: "command", type: "keyword", optional: true }],
);

//Interpreter
/** @type {ISLInterpreter} */
const commandLine = makeInterpreter("P:R.CLI");
commandLine.extend(core);
commandLine.extend(cle);

function exec(isl, context) {
  isl.split(/[\n\;]/g).forEach((line) => runCommand(line, context, commandLine));
}

console.log("[Setup] ISL CLI ready.");
export { commandLine, exec };

