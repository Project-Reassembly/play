import { RegisteredItem } from "../../core/registered-item.js";
import { tru, rnd } from "../../core/number.js";
import { ShapeParticle } from "../effect/shape-particle.js";
import { Decoration, process, TextDrawer, wrapWords } from "../../core/text.js";
class Item extends RegisteredItem {
  image = "error";
  name = "<unnamed item>";
  description = "<no description>";
  rarity = 0;
  stackSize = 100;

  marketValue = 0;

  _cachedTooltip = null;
  /**@type {TextDrawer} */
  tooltip = null;
  init() {
    // this.description = wrapWords(this.description, 40);
    this.title = process("#@b"+this.name+"#fn", 40)
      .drawer(25)
      .conjoin(
        process(
          this.description +
            (this.marketValue > 0
              ? "\n#a-Sell value: $" + this.marketValue
              : "\n#4iNo sell value"),
          40
        ).drawer(20)
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
        let dir = rnd(0, Math.PI * 2);
        let size = rnd(3, 8);
        let dist = rnd(0, 8);
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
            0
          )
        );
      }
  }
  getContextualisedInfo(entity) {}
  getInformativeTooltip() {
    if (!this._cachedTooltip)
      this._cachedTooltip = this.createExtendedTooltip().concat(
        "🟩Sell value: $" + this.marketValue + "⬜"
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
            return Decoration.colours.f;
          case this.rarity.CCC:
            return Decoration.colours.h;
          case this.rarity.BLUE:
            return Decoration.colours.l;
          case this.rarity.RARE:
            return Decoration.colours.r;
          case this.rarity.SPECIAL:
            return Decoration.colours.s;
          case this.rarity.PETI:
            return Decoration.colours.p;
          case this.rarity.ITI:
            return Decoration.colours.i;
          case this.rarity.DEV:
            return Decoration.colours.y;
          case 8:
            return Decoration.colours.v;
        }
    return [0, 0, 0, 0];
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
    8: 8
  };
}
export { Item };
