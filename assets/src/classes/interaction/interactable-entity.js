import { constructFromType } from "../../core/constructor.js";
import Integrate from "../../lib/integrate.js";
import { game } from "../../play/game.js";
import { EquippedEntity } from "../entity/inventory-entity.js";
import { DialogueManager } from "./dialogue.js";
import { TradeInfo, TradingManager } from "./trading.js";

/**
 * An entity which the player can interact with.\
 * If `dialogue` is present, then the player will be able to talk to them via their `DialogueManager`.\
 *
 * All of these will have the ability to be added to the player's `RelationManager` - some important notes about that:
 *  - Each entity type has its own relation, but each entity instance with the same registry name shares the relation.
 *   To avoid confusion, **only one instance of each registry name should be made**. I recommend the use of world events.
 *  - The persistent player stores relations, not any entity - so no deaths anywhere affect relations.
 *  - Flags are uncompressed (unless they match a registry name), so use short names where possible. I recommend an enumeration class of some sort, if possible (i.e. not if working in json)
 *  - In custom action text, you can use `$entity` to refer to the current entity's display name, `$player` to refer to the player's display name and `$<name>` to refer to the default display name of the entity with the registry name `<name>`.
 *
 */
export class InteractableEntity extends EquippedEntity {
  /** Doesn't exist for long. @type {Integrate.Unconstructed<DialogueManager>} */
  dialogue = null;
  /** Doesn't exist for long. @type {Integrate.Unconstructed<TradeInfo>[]} */
  trades = null;
  tradeCostX = 1;
  init() {
    super.init();
    if (this.dialogue) {
      // centralised dialogue for better saving
      const d =
        game.player.dialogue.get(this.registryName) ??
        constructFromType(this.dialogue, DialogueManager);

      game.player.dialogue.set(this.registryName, d);
      d.flags = game.player.savedLocalFlags.get(this.registryName) ?? new Set();

      d.entity = this;
      d.postEntInit();
      d.updateNode();
    }
    if (this.trades) {
      const t =
        game.player.trades.get(this.registryName) ??
        constructFromType({ trades: this.trades, tradeCostX: this.tradeCostX }, TradingManager);

      game.player.trades.set(this.registryName, t);

      t.entity = this;
      t.updateEverything();
    }
    delete this.dialogue;
    delete this.trades;
  }
}
