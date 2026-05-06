import * as CMFT from "../../core/cmft.js";
import { rnd, tru } from "../../core/number.js";
import Integrate from "../../lib/integrate.js";
import { ShapeParticle } from "../effect/shape-particle.js";
class Item extends Integrate.RegisteredItem {
  image = "error";
  name = "<unnamed item>";
  description = "<no description>";
  rarity = 0;
  stackSize = 100;

  marketValue = 0;

  _cachedTooltip = null;
  /**@type {CMFTTextDrawer} */
  tooltip = null;
  init() {
    // this.description = wrapWords(this.description, 40);
    this.title = CMFT.drawer("#@b" + this.name + "#--", 25, 40).conjoin(
      CMFT.drawer(
        this.description +
          (this.marketValue > 0 ? "\n#a-Sell value: $" + this.marketValue : "\n#4iNo sell value"),
        20,
        40,
      ),
    );

    //this.tooltip =
  }
  /** Called every tick while in inventory.
   * @param {InventoryEntity} holder Entity holding this item.
   */
  tick(holder) {}
  /** Called when an interaction is attempted with this item, but nothing happens.
   * @param {InventoryEntity} holder Entity using this item.
   */
  useInAir(holder) {}
  /**
   * Called when ticking on the ground.
   * @param {number} x
   * @param {number} y
   * @param {World} world
   */
  groundTick(x, y, world) {
    if (tru(0.1))
      if (this.rarity === Item.rarity.SPECIAL) {
        let dir = rnd.float(0, Math.PI * 2);
        let size = rnd.float(3, 8);
        let dist = rnd.float(0, 8);
        world.particles.push(
          new ShapeParticle(
            x + Math.cos(dir) * dist,
            y + Math.sin(dir) * dist,
            0,
            40,
            0,
            0,
            "rhombus",
            [
              Item.getColourFromRarity(Item.rarity.SPECIAL, "light"),
              Item.getColourFromRarity(Item.rarity.SPECIAL, "dark"),
            ],
            size,
            0,
            size,
            0,
            0,
          ),
        );
      }
  }
  getContextualisedInfo(entity) {}
  getInformativeTooltip() {
    if (!this._cachedTooltip)
      this._cachedTooltip = this.createExtendedTooltip().concat(
        "🟩Sell value: $" + this.marketValue + "⬜",
      );
    return this._cachedTooltip;
  }
  getTooltipDrawer() {
    return this.tooltip;
  }
  createExtendedTooltip() {
    return [];
  }
  /**
   *
   * @param {number} rarity Item rarity. Must be between 0 and 5 inclusive. Use of `Item.rarity` is recommended.
   */
  static getColourFromRarity(rarity) {
    switch (rarity) {
      case this.rarity.COMMON:
        return CMFT.Decoration.colours.f;
      case this.rarity.CCC:
        return CMFT.Decoration.colours.h;
      case this.rarity.BLUE:
        return CMFT.Decoration.colours.l;
      case this.rarity.RARE:
        return CMFT.Decoration.colours.r;
      case this.rarity.SPECIAL:
        return CMFT.Decoration.colours.s;
      case this.rarity.PETI:
        return CMFT.Decoration.colours.p;
      case this.rarity.ITI:
        return CMFT.Decoration.colours.i;
      case this.rarity.DEV:
        return CMFT.Decoration.colours.y;
      case this.rarity.ADV:
        return CMFT.Decoration.colours.v;
    }
    return 0;
  }
  /**@readonly */
  static rarity = {
    /**@readonly */
    COMMON: 0,
    /**@readonly */
    ITI: 1,
    /**@readonly */
    CCC: 2,
    /**@readonly */
    PETI: 3,
    /**@readonly */
    RARE: 4,
    /**@readonly */
    SPECIAL: 5,
    /**@readonly */
    BLUE: 6, //What?
    /**@readonly */
    DEV: 7,
    /**@readonly */
    ADV: 8,
    toIcon(rarity) {
      switch (rarity) {
        case this.ITI:
          return "icon.iti";
        case this.PETI:
          return "icon.peti";
        case this.CCC:
          return "icon.ccc";
        case this.ADV:
          return "icon.adv";
        case this.DEV:
          return "icon.dev";
      }
    },
  };
}
export { Item };

