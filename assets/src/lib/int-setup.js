import { Registries } from "../core/registry.js";
import { Integrate } from "./integrate.js";
//Set up hardcoded stuff
import {} from "../registries/type.js";
console.log("[Setup] Imported types");
import {} from "../registries/images.js";
import {} from "../registries/deathmsg.js";

import {} from "../registries/item.js";
import {} from "../registries/block.js";
import {} from "../registries/entity.js";

import {} from "../registries/status.js";
import {} from "../registries/vfx.js";
import {} from "../registries/worldgen.js";
console.log("[Setup] Imported hardcoded content");
//Set up mods
Integrate.addModdableRegistry(Registries.blocks, "blocks");
Integrate.addModdableRegistry(Registries.items, "items");
Integrate.addModdableRegistry(Registries.entities, "entities");
//Not yet...
//Integrate.addModdableRegistry(Registries.images, "images");
//Integrate.addModdableRegistry(Registries.statuses, "statuses");
Integrate.addModdableRegistry(Registries.vfx, "vfx");
Integrate.addModdableRegistry(Registries.worldgen, "worldgen");
console.log("[Setup] Added moddable registries");
export { Integrate };