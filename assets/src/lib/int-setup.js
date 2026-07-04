import { constructDelayed, PreloadRegistries, Registries } from "../core/registry.js";
import Integrate from "./integrate.js";
//Set up hardcoded stuff
import "../registries/bullets.js";
import "../registries/cutscene.js";
import "../registries/images.js";
console.log("[Setup] Imported preload content");

import "../registries/types/type.js";

import "../registries/types/accessory.js";
import "../registries/types/bullet.js";
import "../registries/types/worldevent.js";
console.log("[Setup] Imported types");

import "../registries/block.js";
import "../registries/corps.js";
import "../registries/entity.js";
import "../registries/item.js";
import "../registries/tile.js";

import "../registries/events.js";
import "../registries/status.js";
import "../registries/vfx.js";
import "../registries/worldgen.js";

import "../registries/deathmsg.js";
import "../registries/punches.js";
console.log("[Setup] Imported hardcoded content");
//Set up mods
Integrate.addModdableRegistry(Registries.blocks, "blocks");
Integrate.addModdableRegistry(Registries.tiles, "tiles");
Integrate.addModdableRegistry(Registries.items, "items");
Integrate.addModdableRegistry(Registries.entities, "entities");
Integrate.addModdableRegistry(PreloadRegistries.images, "images");
Integrate.addModdableRegistry(Registries.events, "events");
Integrate.addModdableRegistry(PreloadRegistries.cutscenes, "cutscenes");
Integrate.addModdableRegistry(Registries.corps, "corporations");
Integrate.addModdableRegistry(PreloadRegistries.stati, "statuses");
Integrate.addModdableRegistry(PreloadRegistries.bullets, "bullets");
Integrate.addModdableRegistry(Registries.small.punch_types, "punches");
Integrate.addModdableRegistry(Registries.vfx, "vfx");
Integrate.addModdableRegistry(Registries.worldgen, "world-generators");

Integrate.setPrefix(true);
console.log("[Setup] Added moddable registries");

constructDelayed("hardcoded");

console.log("[Setup] Done delayed constructions: <hardcoded>");
