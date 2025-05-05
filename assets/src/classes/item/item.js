import { RegisteredItem } from "../../core/registered-item.js";
import { tru } from "../../core/number.js";
class Item extends RegisteredItem {
  image = "error";
  name = "<unnamed item>";
  description = "<no description>";
  rarity = 0;
  stackSize = 99;

  _cachedTooltip = null;
  init() {}
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
      this._cachedTooltip = this.createExtendedTooltip();
    return this._cachedTooltip;
  }
  createExtendedTooltip() {
    return [];
  }
  /**
   *
   * @param {number} rarity Item rarity. Must be between 0 and 5 inclusive. Use of `Item.rarity` is recommended.
   * @param {"light"|"dark"} [scheme="light"] Colour scheme **of the text**, not of the background.
   */
  static getColourFromRarity(rarity, scheme = "light") {
    switch (scheme) {
      case "light": {
        switch (rarity) {
          case this.rarity.COMMON:
            return [255, 255, 255];
          case this.rarity.CCC:
            return [150, 255, 150];
          case this.rarity.BLUE:
            return [150, 150, 255];
          case this.rarity.RARE:
            return [200, 150, 255];
          case this.rarity.SPECIAL:
            return [255, 240, 150];
          case this.rarity.PETI:
            return [255, 150, 150];
          case this.rarity.ITI:
            return [0, 190, 230];
        }
      }
      case "dark": {
        switch (rarity) {
          case this.rarity.COMMON:
            return [0, 0, 0];
          case this.rarity.CCC:
            return [0, 150, 0];
          case this.rarity.BLUE:
            return [0, 0, 150];
          case this.rarity.RARE:
            return [100, 0, 150];
          case this.rarity.SPECIAL:
            return [150, 145, 0];
          case this.rarity.PETI:
            return [150, 0, 0];
          case this.rarity.ITI:
            return [0, 50, 100];
        }
      }
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
  };
}
export { Item };
