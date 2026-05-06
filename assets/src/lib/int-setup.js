import { PreloadRegistries, Registries } from "../core/registry.js";
import Integrate from "./integrate.js";
//Set up hardcoded stuff
import { } from "../registries/cutscene.js";
import { } from "../registries/images.js";
console.log("[Setup] Imported preload content");

import { } from "../registries/type.js";
console.log("[Setup] Imported types");

import { } from "../registries/block.js";
import { } from "../registries/entity.js";
import { } from "../registries/item.js";

import { } from "../registries/status.js";
import { } from "../registries/vfx.js";
import { } from "../registries/worldgen.js";

import { } from "../registries/deathmsg.js";
console.log("[Setup] Imported hardcoded content");
//Set up mods
Integrate.addModdableRegistry(Registries.blocks, "blocks");
Integrate.addModdableRegistry(Registries.items, "items");
Integrate.addModdableRegistry(Registries.entities, "entities");
Integrate.addModdableRegistry(PreloadRegistries.images, "images");
Integrate.addModdableRegistry(PreloadRegistries.cutscenes, "cutscenes");
//Not yet...
//Integrate.addModdableRegistry(Registries.statuses, "statuses");
Integrate.addModdableRegistry(Registries.vfx, "vfx");
Integrate.addModdableRegistry(Registries.worldgen, "worldgen");
console.log("[Setup] Added moddable registries");
