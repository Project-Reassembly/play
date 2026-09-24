import { col } from "../../core/color.js";
import { Registries } from "../../core/registry.js";
import { Serialiser } from "../../core/serialiser.js";
import { Log } from "../../play/messaging.js";
import { Corporation } from "../item/corporation.js";

export const discoverers = {
  /** @param {import("../entity/entity.js").Entity} target  */
  discoverEntity(target) {
    if (!target) return;
    const type = target?.registryName;
    if (discoverableEntities.all.has(type) && !discoveredEntities.all.has(type)) {
      discoveredEntities.discover(type);
      const corp = target.team;
      const found = discoveredEntities.teams.get(corp)?.length ?? 0;
      const total = discoverableEntities.teams.get(corp)?.length ?? 0;
      const complete = found === total;
      const c = complete ? col.cyan : col.interp([col.red, col.yellow, col.green], found / (total + 1));
      Log.send(
        `#>>icon.database#=-Discovered entity #[${Corporation.colorof(corp)}]b${target.name}#=- (${complete ? "#[0x30ffff]*complete" : `#[0x${col.hex(c)}]b${found}/${total}`}#=-)`,
      );
    }
  },
  /** @param {ItemStack} target  */
  discoverItem(target) {
    if (discoverable.all.has(target.item) && !discovered.all.has(target.item)) {
      discovered.discover(target.item);
      const corp = target.getItem().corp;
      const found = discovered.collections.get(corp)?.length ?? 0;
      const total = discoverable.collections.get(corp)?.length ?? 0;
      const complete = found === total;
      const c = complete ? col.cyan : col.interp([col.red, col.yellow, col.green], found / (total + 1));
      Log.send(
        `#>>icon.database#=-Discovered item #[${Corporation.colorof(corp)}]b${target.getItem().name}#=- (${Corporation.aliasof(corp) || "generic"}#=- collection, ${complete ? "#[0x30ffff]*complete" : `#[0x${col.hex(c)}]b${found}/${total}`}#=-)`,
      );
    }
  },
};

/** @import Integrate from "../../lib/integrate.js"; */
export const discoveredEntities = {
  /** @type {Set<string>} */
  all: new Set(),
  /** @type {Set<string>} */
  suspended: new Set(),
  /** @type {Map<string, string[]>} */
  teams: new Map(),
  discover(...items) {
    for (const item of items) this.add(item);
    this.serialise();
  },
  add(item) {
    this.all.add(item);
    const c = Registries.items.tryGet(item)?.corp ?? "";
    const a = this.teams.get(c);
    if (!a) this.teams.set(c, [item]);
    else a.push(item);
  },
  serialise() {
    if (!Serialiser.set("db:discovered.entities", [...new Set([...this.all, ...this.suspended])]))
      console.error("Could not save entity database discovery data!");
    console.log("Saved discovered entities.");
  },
  deserialise() {
    const data = Serialiser.get("db:discovered.entities");
    if (!data) console.error("Could not find entity database discovery data! Assuming no knowledge until next reset.");
    else if (!Array.isArray(data)) console.error("Entity database discovery data is corrupted! Assuming no knowledge until next reset. Got", data);
    else {
      const dstr = data.map(x => `${x}`);
      let modded = 0;
      this.all.clear();
      this.teams.clear();
      for (const i of dstr) {
        if (!Registries.entities.has(i)) {
          modded++;
          this.suspended.add(i);
          continue;
        }
        this.add(i);
      }
      if (modded > 0)
        console.log(`${modded} modded/unregistered entities are present in the discovery list - they will not be visible, but will persist`);
      console.log(`Loaded ${this.all.size} discovered entities.`);
    }
  },
};
export const discoverableEntities = {
  /** @type {Set<string>} */
  all: new Set(),
  /** @type {Map<string, string[]>} */
  teams: new Map(),
};

/** @import Integrate from "../../lib/integrate.js"; */
export const discovered = {
  /** @type {Set<string>} */
  all: new Set(),
  /** @type {Set<string>} */
  suspended: new Set(),
  /** @type {Map<string, string[]>} */
  collections: new Map(),
  discover(...items) {
    for (const item of items) this.add(item);
    this.serialise();
  },
  add(item) {
    this.all.add(item);
    const c = Registries.items.tryGet(item)?.corp ?? "";
    const a = this.collections.get(c);
    if (!a) this.collections.set(c, [item]);
    else a.push(item);
  },
  serialise() {
    if (!Serialiser.set("db:discovered.items", [...new Set([...this.all, ...this.suspended])]))
      console.error("Could not save database discovery data!");
    console.log("Saved discovered items.");
  },
  deserialise() {
    const data = Serialiser.get("db:discovered.items");
    if (!data) console.error("Could not find database discovery data! Assuming no knowledge until next reset.");
    else if (!Array.isArray(data)) console.error("Database discovery data is corrupted! Assuming no knowledge until next reset. Got", data);
    else {
      const dstr = data.map(x => `${x}`);
      let modded = 0;
      this.all.clear();
      this.collections.clear();
      for (const i of dstr) {
        if (!Registries.items.has(i)) {
          modded++;
          this.suspended.add(i);
          continue;
        }
        this.add(i);
      }
      if (modded > 0)
        console.log(`${modded} modded/unregistered items are present in the discovery list - they will not be visible, but will persist`);
      console.log(`Loaded ${this.all.size} discovered items.`);
    }
  },
};
export const discoverable = {
  /** @type {Set<string>} */
  all: new Set(),
  /** @type {Map<string, string[]>} */
  collections: new Map(),
};