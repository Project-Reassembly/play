import { col } from "../../core/color.js";
import { discoverableEntities, discoveredEntities } from "../../definitions/screens/entity-database.js";
import { discoverable, discovered } from "../../definitions/screens/item-database.js";
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
  /** @param {import("../item/item-stack.js").ItemStack} target  */
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